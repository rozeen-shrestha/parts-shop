"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Mail, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: {
    id?: number | string
    _id?: string
    name: string
    category: string
    price: number
    image: string
    addToCart: boolean
  }
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const productId = product._id || product.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="group"
    >
      <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-900 transition-all duration-300 overflow-hidden">
        <Link href={`/products/${productId}`} className="block">
          <div className="relative h-64 overflow-hidden">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="relative w-full h-full">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            <Badge variant="secondary" className="absolute top-4 left-4 bg-red-600/90 text-white border-none">
              {product.category}
            </Badge>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2"
            >
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </motion.div>
          </div>
        </Link>

        <CardContent className="p-6">
          <Link href={`/products/${productId}`}>
            <motion.h3
              whileHover={{ x: 5 }}
              className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors cursor-pointer"
            >
              {product.name}
            </motion.h3>
          </Link>
          <div className="flex items-center justify-between mb-4">
            <motion.p whileHover={{ scale: 1.05 }} className="text-2xl font-bold text-red-500">
              ${product.price.toFixed(2)}
            </motion.p>
            <Badge variant="outline" className="border-gray-600 text-gray-400">
              In Stock
            </Badge>
          </div>

          <Button
            className={`w-full transition-all duration-300 ${
              product.addToCart ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center"
            >
              {product.addToCart ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Inquire
                </>
              )}
            </motion.div>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
