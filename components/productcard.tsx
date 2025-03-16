'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Mail } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    addToCart: boolean;
  };
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            {product.name}
          </h3>
          <p className="text-red-500 font-medium">
            ${product.price.toFixed(2)}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`mt-4 w-full text-white py-2 rounded-lg transition-colors ${
              product.addToCart
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={(e) => e.preventDefault()}
          >
            {product.addToCart ? (
              <>
                <ShoppingCart className="inline-block mr-2 h-4 w-4" />
                Add to Cart
              </>
            ) : (
              <>
                <Mail className="inline-block mr-2 h-4 w-4" />
                Inquire
              </>
            )}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}
