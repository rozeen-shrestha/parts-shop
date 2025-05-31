"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, CreditCard, Truck, Shield, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [selectedGateway, setSelectedGateway] = useState<"esewa" | "fonepay" | "bank" | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [finalEmail, setFinalEmail] = useState<string>("")
  const [orderSummary, setOrderSummary] = useState<any>(null)
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    address: "",
    note: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Load cart from localStorage and redirect if empty
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (!stored || JSON.parse(stored).length === 0) {
      router.replace("/cart");
    } else {
      setCartItems(JSON.parse(stored));
    }
  }, [router]);

  // Mock cart data
  // const cartItems = [
  //   { name: "Performance Brakes", price: 299.99, quantity: 2 },
  //   { name: "Custom Wheels", price: 1299.99, quantity: 1 },
  // ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // Update shipping cost logic for new shipping methods
  const shippingCost = shippingMethod === "outside" ? 249.99 : 119.99
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  // Update shipping options
  const shippingOptions = [
    { id: "inside", name: "Inside Valley", time: "Delivery within valley area", price: 119.99 },
    { id: "outside", name: "Outside Valley", time: "Delivery outside valley area", price: 249.99 },
  ]

  const steps = [
    { id: 1, name: "Shipping", icon: Truck },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: Check },
  ]

  // Dummy QR images (replace with real URLs as needed)
  const qrImages: Record<string, string> = {
    esewa: "/qr/esewa.png",
    fonepay: "/qr/fonepay.png",
    bank: "/qr/bank.png",
  }

  // Helper to get billing details for modal
  // function getEmailValue() {
  //   if (typeof window !== "undefined") {
  //     const val = (document?.getElementById("email") as HTMLInputElement)?.value
  //     return val || "-"
  //   }
  //   return "-"
  // }

  async function handlePlaceOrder() {
    if (placingOrder) return; // Prevent spamming
    setPlacingOrder(true);
    const billing = {
      firstName: formData.firstName || "-",
      lastName: formData.lastName || "-",
      email: formData.email || "-",
      phone: formData.number || "-",
      address: formData.address || "-",
      note: formData.note || "-",
    }
    let paymentProofFileIds: string[] = [];
    let paymentProofPaths: string[] = [];

    // Upload payment proofs to /api/public-upload and collect file IDs and paths
    if (uploadedFiles.length > 0) {
      const formDataUpload = new FormData();
      uploadedFiles.forEach(file => formDataUpload.append("files", file));
      formDataUpload.append("orderData", JSON.stringify({ billing, cartItems }));

      const uploadRes = await fetch("/api/public-upload", {
        method: "POST",
        body: formDataUpload,
      });
      const uploadJson = await uploadRes.json();
      // Use returned ids and files
      if (Array.isArray(uploadJson.ids)) {
        paymentProofFileIds = uploadJson.ids.map((id: any) => typeof id === "object" && id.$oid ? id.$oid : id);
      }
      if (Array.isArray(uploadJson.files)) {
        paymentProofPaths = uploadJson.files;
      }
    }

    const payment = {
      method: selectedGateway,
      proofs: paymentProofFileIds,
      proofFileIds: paymentProofFileIds,
    }

    const order = {
      billing,
      payment,
      cartItems,
      subtotal,
      shippingCost,
      total,
      shippingMethod,
      createdAt: new Date().toISOString(),
    }
    // Save to localStorage for success page
    localStorage.setItem("confirmedOrder", JSON.stringify({ ...order, confirmedAt: new Date().toISOString() }));
    // Optionally save lastOrder for other use
    localStorage.setItem("lastOrder", JSON.stringify(order));
    // Send to API
    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      localStorage.removeItem("cart");
      setPlacingOrder(false);
      router.push("/checkout/success");
      return;
    } catch {}
    localStorage.removeItem("cart");
    setPlacingOrder(false);
  }

  // Form validation for shipping step
  function isShippingValid() {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.number.trim() &&
      formData.address.trim() &&
      !!shippingMethod // Ensure a shipping method is selected
    );
  }

  // Form validation for payment step
  function isPaymentValid() {
    return !!selectedGateway && uploadedFiles.length > 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your order securely</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-red-600 border-red-600 text-white" : "border-gray-600 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${currentStep >= step.id ? "text-white" : "text-gray-400"}`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${currentStep > step.id ? "bg-red-600" : "bg-gray-600"}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Shipping Information */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-300">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          className="bg-gray-700 border-gray-600 text-white"
                          value={formData.firstName}
                          onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          className="bg-gray-700 border-gray-600 text-white"
                          value={formData.lastName}
                          onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        value={formData.email}
                        onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="number" className="text-gray-300">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="number"
                        type="tel"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="98XXXXXXXX"
                        value={formData.number}
                        onChange={e => setFormData(f => ({ ...f, number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-gray-300">
                        Address
                      </Label>
                      <Input
                        id="address"
                        className="bg-gray-700 border-gray-600 text-white"
                        value={formData.address}
                        onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="note" className="text-gray-300">
                        Additional Note
                      </Label>
                      <textarea
                        id="note"
                        rows={3}
                        className="bg-gray-700 border-gray-600 text-white w-full rounded-md px-3 py-2"
                        placeholder="Any additional instructions or notes..."
                        value={formData.note}
                        onChange={e => setFormData(f => ({ ...f, note: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Shipping Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {shippingOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          shippingMethod === option.id
                            ? "border-red-600 bg-red-600/10"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                        onClick={() => setShippingMethod(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{option.name}</h4>
                            <p className="text-gray-400 text-sm">{option.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">Rs {(option.price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button
                  onClick={() => isShippingValid() && setCurrentStep(2)}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!isShippingValid()}
                >
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Payment Method */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Instruction paragraph */}
                    <div className="mb-4">
                      <ol className="text-base text-gray-200 space-y-2 font-medium list-decimal list-inside">
                        <li>Select your preferred payment method below.</li>
                        <li>Pay the total amount using the selected method.</li>
                        <li>Upload the payment screenshot as proof (max 2 files).</li>
                        <li>Wait for confirmation.</li>
                      </ol>
                    </div>
                    {/* Payment Gateway Buttons */}
                    <div className="flex gap-4 mt-4">
                      <Button
                        type="button"
                        variant={selectedGateway === "esewa" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedGateway("esewa")}
                      >
                        E-sewa
                      </Button>
                      <Button
                        type="button"
                        variant={selectedGateway === "fonepay" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedGateway("fonepay")}
                      >
                        Fonepay
                      </Button>
                      <Button
                        type="button"
                        variant={selectedGateway === "bank" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedGateway("bank")}
                      >
                        Bank
                      </Button>
                    </div>

                    {/* Show QR and file upload if a gateway is selected */}
                    {selectedGateway && (
                      <div className="mt-6 space-y-4">
                        <div className="flex flex-col items-center">
                          {/* Replace src with actual QR image paths */}
                          <img
                            src={qrImages[selectedGateway]}
                            alt={`${selectedGateway} QR`}
                            className="w-48 h-48 object-contain border border-gray-700 rounded-lg bg-white"
                          />
                          <span className="mt-2 text-gray-300 capitalize">{selectedGateway} QR</span>
                        </div>
                        <div>
                          <Label htmlFor="payment-proof" className="text-gray-300 mb-2 block">
                            Upload Payment Proof (max 2 files)
                          </Label>
                          <label
                            htmlFor="payment-proof"
                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 cursor-pointer hover:border-red-500 transition-colors bg-gray-800"
                          >
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            <span className="text-gray-400 text-sm">Click to upload or drag and drop</span>
                            <span className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG (max 2 files)</span>
                            <input
                              id="payment-proof"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={e => {
                                const files = Array.from(e.target.files || []).slice(0, 2)
                                setUploadedFiles(files)
                              }}
                            />
                          </label>
                          {uploadedFiles.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {uploadedFiles.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center bg-gray-700 rounded px-2 py-1 text-gray-200 text-xs max-w-[160px]"
                                >
                                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                                  </svg>
                                  <span className="truncate" title={file.name}>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => isPaymentValid() && setCurrentStep(3)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={!isPaymentValid()}
                  >
                    Review Order
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Order Review */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      Review Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Billing Details */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white mb-2">Billing Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400">First Name:</span>
                          <span className="text-white ml-2">{formData.firstName || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Name:</span>
                          <span className="text-white ml-2">{formData.lastName || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white ml-2">{formData.email || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Phone Number:</span>
                          <span className="text-white ml-2">{formData.number || "-"}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-white ml-2">{formData.address || "-"}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Additional Note:</span>
                          <span className="text-white ml-2">{formData.note || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white mb-2">Payment Method</h3>
                      <span className="text-white capitalize">
                        {selectedGateway ? selectedGateway : "-"}
                      </span>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {uploadedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center bg-gray-700 rounded px-2 py-1 text-gray-200 text-xs max-w-[160px]"
                            >
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                              </svg>
                              <span className="truncate" title={file.name}>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white mb-2">Order Items</h3>
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div>
                            <span className="text-white">{item.name}</span>
                            <span className="text-gray-400 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="text-white">
                            Rs {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-gray-600" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span>Rs {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Shipping</span>
                        <span>Rs {shippingCost.toFixed(2)}</span>
                      </div>
                      {/* Removed Tax row */}
                      <div className="flex justify-between text-lg font-semibold text-white">
                        <span>Total</span>
                        <span>Rs {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox id="terms" checked={agreeTerms} onCheckedChange={checked => setAgreeTerms(!!checked)} />
                      <Label htmlFor="terms" className="text-sm text-gray-300">
                        I agree to the terms and conditions
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handlePlaceOrder}
                    disabled={uploadedFiles.length === 0 || !agreeTerms || placingOrder}
                  >
                    {placingOrder ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-white text-sm">{item.name}</span>
                          <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-white text-sm">
                          Rs {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-gray-600" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>Rs {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping</span>
                      <span>Rs {shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total</span>
                      <span>Rs {(subtotal + shippingCost).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Removed Secure SSL Encryption and Free Returns within 30 days */}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
