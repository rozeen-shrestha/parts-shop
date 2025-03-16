'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ProductCard from '@/components/productcard';

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1615854366019-77d4df6d8e8d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1615854365977-1d2065be1146?auto=format&fit=crop&q=80',
  ];

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [featuredRef, featuredInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [testimonialRef, testimonialInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const featuredProducts = [
    {
      id: 1,
      name: 'Performance Brakes',
      category: 'Brakes',
      price: 299.99,
      image:
        'https://images.unsplash.com/photo-1615854366019-77d4df6d8e8d?auto=format&fit=crop&q=80',
      addToCart: true,
    },
    {
      id: 2,
      name: 'Custom Wheels',
      category: 'Wheels',
      price: 1299.99,
      image:
        'https://images.unsplash.com/photo-1615854365977-1d2065be1146?auto=format&fit=crop&q=80',
      addToCart: true,
    },
    {
      id: 3,
      name: 'Racing Exhaust',
      category: 'Exhaust',
      price: 599.99,
      image:
        'https://images.unsplash.com/photo-1615854366009-2f973f2037b4?auto=format&fit=crop&q=80',
      addToCart: true,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        className="h-screen relative flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src={images[currentImage]}
            alt="Motorcycle parts background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </motion.div>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="max-w-7xl mx-auto px-4 z-10 text-center">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-4 tracking-wider"
          >
            PREMIUM BIKE PARTS
          </motion.h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Elevate your ride with precision-engineered components
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Explore Products
          </motion.button>
        </div>
      </motion.section>

      {/* Featured Products */}
      <section
        ref={featuredRef}
        className="py-20 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-16 tracking-wide"
          >
            Featured Products
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialRef}
        className="py-20 bg-gradient-to-b from-gray-900 to-black"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-4xl font-bold text-center mb-12"
          >
            What Our Customers Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'John Doe',
                feedback:
                  'The best brakes I have ever used! The quality and performance are top-notch.',
                image: 'https://randomuser.me/api/portraits/men/1.jpg',
              },
              {
                name: 'Sarah Lee',
                feedback:
                  'The wheels transformed my ride. Super smooth and stylish!',
                image: 'https://randomuser.me/api/portraits/women/1.jpg',
              },
              {
                name: 'Mike Johnson',
                feedback:
                  'Amazing exhaust system! My bike runs better and sounds incredible.',
                image: 'https://randomuser.me/api/portraits/men/2.jpg',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={
                  testimonialInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 40 }
                }
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-all"
              >
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full mr-4"
                  />
                  <h4 className="text-white font-semibold">
                    {testimonial.name}
                  </h4>
                </div>
                <p className="text-lg text-gray-300">
                  "{testimonial.feedback}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
