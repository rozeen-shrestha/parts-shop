'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

const stats = [
  { label: 'Total Sales', value: '$23,456' },
  { label: 'Products', value: '124' },
  { label: 'Customers', value: '1,893' },
  { label: 'Avg. Order Value', value: '$189' },
];

interface Contact {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function AdminDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      message: 'Looking for bulk orders.',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '987-654-3210',
      message: 'Interested in a partnership.',
    },
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      {/* Dashboard Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Dashboard
      </motion.h1>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 p-6 rounded-lg"
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Sales Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 p-6 rounded-lg mt-8"
      >
        <h2 className="text-xl font-semibold mb-6">Sales Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Contact Submissions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 p-6 rounded-lg mt-8"
      >
        <h2 className="text-xl font-semibold mb-6">
          Recent Contact Submissions
        </h2>

        {contacts.length === 0 ? (
          <p className="text-gray-400">No contact submissions yet.</p>
        ) : (
          <motion.div className="space-y-6">
            {contacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 p-5 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition"
                onClick={() => setSelectedContact(contact)}
              >
                <p className="text-lg font-semibold text-red-500">
                  {contact.name}
                </p>
                <p className="text-gray-400">📧 {contact.email}</p>
                <p className="text-gray-400">📞 {contact.phone}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Contact Details Modal */}
      <AnimatePresence>
        {selectedContact && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                {selectedContact.name}
              </h2>
              <p className="text-gray-400">📧 {selectedContact.email}</p>
              <p className="text-gray-400">📞 {selectedContact.phone}</p>
              <p className="text-gray-300 mt-4">📝 {selectedContact.message}</p>
              <button
                className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition w-full"
                onClick={() => setSelectedContact(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
