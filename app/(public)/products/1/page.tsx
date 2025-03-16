'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Mail } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/productcard';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  specifications: string[]; // Array of specifications
  inStock: boolean;
  image: string;
  additionalImages: string[];
  addToCart?: boolean;
}

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80'
  );
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1); // Quantity state
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const product: Product = {
    id: 1,
    name: 'Performance Brake Kit',
    category: 'Brakes',
    price: 299.99,
    description:
      'High-performance brake kit designed for maximum stopping power and durability.',
    specifications: [
      'Fits most performance vehicles',
      'Cross-drilled rotors',
      'Ceramic brake pads',
    ],
    inStock: true,
    image:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80',
      'https://unsplash.com/photos/a-lone-pine-tree-stands-alone-in-the-snow-mxcEEn61-eQ?auto=format&fit=crop&q=80',
    ],
  };

  const relatedProducts = [
    {
      id: 2,
      name: 'Carbon Fiber Wheels',
      category: 'Wheels',
      price: 1299.99,
      image: product.image,
      addToCart: true,
    },
    {
      id: 3,
      name: 'Performance Exhaust System',
      category: 'Exhaust',
      price: 599.99,
      image: product.image,
      addToCart: true,
    },
    {
      id: 4,
      name: 'Custom Engine Tuning',
      category: 'Engine',
      price: 799.99,
      image: product.image,
      addToCart: false,
    },
  ];

  // Handle zoom effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return; // Guard clause to ensure imageContainerRef is not null

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Stop zoom when cursor is 8px away from the image
    if (x < -8 || x > width + 8 || y < -8 || y > height + 8) {
      setShowZoom(false);
      return;
    }

    setShowZoom(true);
    setCursorPosition({ x, y });
    setZoomPosition({
      x: Math.max(0, Math.min(100, (x / width) * 100)),
      y: Math.max(0, Math.min(100, (y / height) * 100)),
    });
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value)); // Ensure quantity is at least 1
    setQuantity(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 ">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Image Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              ref={imageContainerRef}
              className="relative h-96 overflow-hidden rounded-lg bg-gray-900"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowZoom(false)}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Zoom Lens */}
              {showZoom && (
                <div
                  className="absolute w-24 h-24 border-2 border-red-500 pointer-events-none z-10"
                  style={{
                    left: Math.max(
                      0,
                      Math.min(
                        cursorPosition.x - 48,
                        imageContainerRef.current?.clientWidth ?? 0 - 96
                      )
                    ),
                    top: Math.max(
                      0,
                      Math.min(
                        cursorPosition.y - 48,
                        imageContainerRef.current?.clientHeight ?? 0 - 96
                      )
                    ),
                  }}
                ></div>
              )}

              {/* Zoomed Image */}
              {showZoom && (
                <div
                  className="fixed bg-gray-900 w-64 h-64 border border-gray-700 rounded-lg overflow-hidden z-20 shadow-xl"
                  style={{
                    left: cursorPosition.x + 120,
                    top: cursorPosition.y - 32,
                    backgroundImage: `url(${selectedImage})`,
                    backgroundSize: '300%',
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.additionalImages.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-md cursor-pointer ${
                    selectedImage === img ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-2xl text-red-500 font-semibold">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-gray-300">{product.description}</p>

            {/* Specifications */}
            <ul className="list-disc pl-5 text-gray-300">
              {product.specifications.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>

            {/* Quantity Input */}
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="w-full p-3 bg-gray-800 rounded"
              placeholder="Quantity"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </motion.button>
          </motion.div>
        </div>

        {/* Related Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8">
            Related Products
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
