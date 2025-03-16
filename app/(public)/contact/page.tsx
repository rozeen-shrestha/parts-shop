'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
    );
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <main className="flex flex-col min-h-screen bg-black text-white">
      {/* Contact Section */}
      <section className="flex-grow flex items-center justify-center px-6 py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="w-full max-w-5xl bg-gray-800 p-8 rounded-lg shadow-lg">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-bold text-center mb-8"
          >
            Contact Us
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="text-white text-lg font-semibold"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-white text-lg font-semibold"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-white text-lg font-semibold"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="text-white text-lg font-semibold"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={4}
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Submit
            </motion.button>
          </form>
        </div>
      </section>
    </main>
  );
}
