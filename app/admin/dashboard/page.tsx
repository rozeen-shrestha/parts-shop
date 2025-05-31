'use client';

import { useState, useEffect } from 'react';
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

interface Contact {
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: string;
}

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  total?: number;
  // ...other fields...
}

interface Product {
  _id: string;
  name: string;
  price: number;
  // ...other fields...
}

export default function AdminDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [contactsRes, ordersRes, productsRes] = await Promise.all([
          fetch('/api/contacts'),
          fetch('/api/order'),
          fetch('/api/product'),
        ]);
        const [contactsData, ordersData, productsData] = await Promise.all([
          contactsRes.ok ? contactsRes.json() : [],
          ordersRes.ok ? ordersRes.json() : [],
          productsRes.ok ? productsRes.json() : [],
        ]);
        setContacts(Array.isArray(contactsData) ? contactsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (e) {
        setContacts([]);
        setOrders([]);
        setProducts([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Sales = confirmed orders
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const totalSales = confirmedOrders.length;
  const totalSalesAmount = confirmedOrders.reduce(
    (sum, o) => sum + (typeof o.total === 'number' ? o.total : 0),
    0
  );
  const avgOrderValue = totalSales > 0 ? totalSalesAmount / totalSales : 0;

  const stats = [
    { label: 'Total Sales', value: totalSales },
    { label: 'Products', value: products.length },
    { label: 'Contacts', value: contacts.length },
  ];

  // Sales data for chart: group confirmed orders by month
  const salesData = (() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        name: months[d.getMonth()],
        year: d.getFullYear(),
        key: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }
    const salesByMonth: Record<string, number> = {};
    confirmedOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      salesByMonth[key] = (salesByMonth[key] || 0) + 1;
    });
    return last6Months.map((m) => ({
      name: m.name,
      sales: salesByMonth[m.key] || 0,
    }));
  })();

  if (loading) return <div className="p-8 text-white">Loading...</div>;

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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 w-full"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 p-6 rounded-lg w-full"
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
            {contacts.slice(0, 5).map((contact, index) => (
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
