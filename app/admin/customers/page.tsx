'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  image?: string;
  proofs?: string[];
}

export default function AdminCustomers() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>(
    [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '456-789-1230' },
    ]
  );

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderProofs, setOrderProofs] = useState<string[]>([]);

  // Example: Simulate fetching order with proofs for modal (replace with real fetch in your orders page)
  useEffect(() => {
    if (selectedCustomer && Array.isArray(selectedCustomer.proofs)) {
      setOrderProofs(selectedCustomer.proofs);
    } else {
      setOrderProofs([]);
    }
  }, [selectedCustomer]);

  const handleDelete = (id: number) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  const handleViewDetails = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Customer Management
      </motion.h1>

      {/* Customer Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 overflow-x-auto bg-gray-900 rounded-lg p-4"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="py-3 px-4 text-left">Image</th>
              <th className="py-3 px-4 text-left">Customer Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-700">
                <td className="py-3 px-4">
                  {customer.image ? (
                    <img
                      src={
                        customer.image.startsWith("http")
                          ? customer.image
                          : `/api/file/${customer.image}`
                      }
                      alt={customer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                      N/A
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">{customer.name}</td>
                <td className="py-3 px-4">{customer.email}</td>
                <td className="py-3 px-4">{customer.phone}</td>
                <td className="py-3 px-4 text-center space-x-3">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={() => handleViewDetails(Number(customer.id))}
                  >
                    View
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    onClick={() => handleDelete(Number(customer.id))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal for Viewing Customer Details */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4 text-white">Customer Details</h2>
            {selectedCustomer.image && (
              <img
                src={
                  selectedCustomer.image.startsWith("http")
                    ? selectedCustomer.image
                    : `/api/file/${selectedCustomer.image}`
                }
                alt={selectedCustomer.name}
                className="w-20 h-20 rounded-full object-cover mb-4 mx-auto"
              />
            )}
            <p className="text-white"><strong>Name:</strong> {selectedCustomer.name}</p>
            <p className="text-white"><strong>Email:</strong> {selectedCustomer.email}</p>
            <p className="text-white"><strong>Phone:</strong> {selectedCustomer.phone}</p>
            {/* Show payment proofs if available */}
            {orderProofs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">Payment Proofs</h3>
                <div className="flex flex-wrap gap-2">
                  {orderProofs.map((proofId, idx) => (
                    <img
                      key={proofId}
                      src={`/api/file/${proofId}`}
                      alt={`Proof ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border border-gray-700"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
