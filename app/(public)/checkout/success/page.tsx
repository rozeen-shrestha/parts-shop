"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export default function CheckoutSuccessPage() {
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null)

  useEffect(() => {
    const order = typeof window !== "undefined" ? localStorage.getItem("confirmedOrder") : null
    if (order) {
      setConfirmedOrder(JSON.parse(order))
    }
  }, [])

  if (!confirmedOrder) {
    return null
  }

  const orderNumber = confirmedOrder._id || "BP-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()

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
            className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Order Placed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg mb-8"
          >
            Thank you for your purchase. Your order has been successfully placed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <p className="text-gray-500 text-sm">
              Questions about your order? Contact our support team at support@bikeparts.com
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
