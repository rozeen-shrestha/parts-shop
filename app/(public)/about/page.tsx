'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function AboutUsPage() {
  const faqs = [
    {
      question: 'What makes our products unique?',
      answer:
        'Our products are designed with cutting-edge technology, precision engineering, and a commitment to quality. We prioritize performance and durability to ensure the best user experience.',
    },
    {
      question: 'Do we offer international shipping?',
      answer:
        'Yes! We provide international shipping to over 50 countries with secure packaging and fast delivery options.',
    },
    {
      question: 'What is our return policy?',
      answer:
        'We offer a 30-day return policy for unused products in their original packaging. If you’re not satisfied, we’ll make it right.',
    },
    {
      question: 'How can I contact customer support?',
      answer:
        'You can reach out to us via email at support@example.com or through our live chat support available 24/7.',
    },
  ];

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            ← Back to Home
          </Link>
        </motion.div>

        {/* About Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold mb-4 text-white">About Us</h1>
          <p className="text-gray-400 leading-relaxed">
            We are a team of passionate engineers and designers dedicated to
            crafting high-performance automotive parts. Our goal is to push the
            boundaries of innovation, ensuring every product we offer meets the
            highest standards of quality and precision.
          </p>
        </motion.div>

        {/* Animated Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-semibold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We believe in performance, durability, and customer satisfaction.
            Every product we create is rigorously tested to deliver exceptional
            results on the road and the track. Our mission is simple: provide
            the best quality at unbeatable value.
          </p>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-semibold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-md"
              >
                <button
                  className="flex justify-between items-center w-full text-left text-lg text-gray-200 focus:outline-none"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  {faq.question}
                  {openFAQ === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                {/* Animated dropdown */}
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden mt-3"
                    >
                      <p className="text-gray-400">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
