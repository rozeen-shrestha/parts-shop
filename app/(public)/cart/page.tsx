"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  quantity: number
  inStock: boolean
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("cart")
    if (stored) {
      setCartItems(JSON.parse(stored))
    }
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    setCartItems((items) => {
      const updated = items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item))
      localStorage.setItem("cart", JSON.stringify(updated))
      return updated
    })
  }

  const removeItem = (id: string) => {
    setCartItems((items) => {
      const updated = items.filter((item) => item.id !== id)
      localStorage.setItem("cart", JSON.stringify(updated))
      return updated
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">Add some premium bike parts to get started</p>
            <Link href="/products">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Continue Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-400">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {cartItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden">
                          <Image
                            src={
                              item.image
                                ? (item.image.startsWith("http") ? item.image : `/api/file/${item.image}`)
                                : "/placeholder.svg"
                            }
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-4 md:mb-0">
                              <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                              <Badge variant="outline" className="border-gray-600 text-gray-400 mb-2">
                                {item.category}
                              </Badge>
                              <p className="text-xl font-bold text-red-500">Rs {item.price.toFixed(2)}</p>
                              {!item.inStock && (
                                <Badge variant="destructive" className="mt-2">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-gray-600 hover:bg-gray-700"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={!item.inStock}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-gray-600 hover:bg-gray-700"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={!item.inStock}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>Rs {subtotal.toFixed(2)}</span>
                    </div>

                    <Separator className="bg-gray-600" />

                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total</span>
                      <span>Rs {total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-4">
                    <Link href="/products">
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                        Continue Shopping
                      </Button>
                    </Link>
                    <Link href="/checkout">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                        disabled={cartItems.some((item) => !item.inStock)}
                      >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
