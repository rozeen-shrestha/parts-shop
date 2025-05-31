"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Package, Truck, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CheckoutSuccessPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/order/info?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data && !data.error ? data : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <span className="text-white text-lg">Loading...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <span className="text-red-500 text-lg">Order not found.</span>
      </div>
    );
  }

  const orderNumber = id ? `BP-${id.slice(-8).toUpperCase()}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-28 h-28 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Check className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold text-white mb-6"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-2xl mb-10"
          >
            Thank you for your purchase. Your order has been successfully placed.
          </motion.p>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm max-w-xl mx-auto">
              <CardContent className="p-8 text-center">
                <Truck className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-white font-bold text-2xl mb-4">Details</h3>
                <div className="mt-2">
                  <span className="text-gray-400 text-lg">Status: </span>
                  <span className="text-white text-lg font-bold">{order.status}</span>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400 text-lg">Shipping Method: </span>
                  <span className="text-white text-lg">{order.shippingMethod || "-"}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tracking ID Highlight Card */}
          {order.trackingId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-12"
            >
              <Card className="bg-yellow-900/80 border-yellow-600 max-w-md mx-auto shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="text-yellow-300 font-extrabold text-3xl mb-2">Tracking ID</h3>
                  <div className="text-yellow-100 text-2xl font-bold tracking-widest">{order.trackingId}</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Track Order Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
              <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xl px-8 py-4">
                Track Your Order
              </Button>
            </div>

            {/* Order Details */}
            <div className="bg-gray-800/60 rounded-lg p-8 text-left max-w-3xl mx-auto mb-10">
              <h2 className="text-white text-2xl font-bold mb-6">Order Details</h2>
              <div className="mb-3">
                <span className="text-gray-400 text-lg">Name:</span>
                <span className="text-white ml-2 text-lg">{order.billing?.firstName} {order.billing?.lastName}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-400 text-lg">Email:</span>
                <span className="text-white ml-2 text-lg">{order.billing?.email}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-400 text-lg">Phone:</span>
                <span className="text-white ml-2 text-lg">{order.billing?.phone}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-400 text-lg">Address:</span>
                <span className="text-white ml-2 text-lg">{order.billing?.address}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-400 text-lg">Note:</span>
                <span className="text-white ml-2 text-lg">{order.billing?.note}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-400 text-lg">Items:</span>
                <ul className="ml-6 list-disc">
                  {order.cartItems?.map((item: any, i: number) => (
                    <li key={item.id || i} className="text-white text-lg">
                      <span className="font-semibold">{item.name}</span> x{item.quantity} (Rs {(item.price * item.quantity).toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-xl px-8 py-4">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <p className="text-gray-400 text-lg mt-10">
              Questions about your order? Contact our support team at support@bikeparts.com
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
