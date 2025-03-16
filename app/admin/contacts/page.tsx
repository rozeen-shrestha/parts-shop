'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleDone = () => {
    setSelectedContact(null);
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      {/* Dashboard Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Contacts
      </motion.h1>

      {/* Contact Submissions Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 p-6 rounded-lg mt-8"
      >
        <h2 className="text-xl font-semibold mb-6">Recent Contact Submissions</h2>

        {contacts.length === 0 ? (
          <p className="text-gray-400">No contact submissions yet.</p>
        ) : (
          <motion.div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">Message</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr
                    key={index}
                    className="bg-gray-800 hover:bg-gray-700 transition"
                  >
                    <td className="px-4 py-2 border-b">{contact.name}</td>
                    <td className="px-4 py-2 border-b">{contact.email}</td>
                    <td className="px-4 py-2 border-b">{contact.phone}</td>
                    <td className="px-4 py-2 border-b">{contact.message}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mr-2"
                        onClick={() => handleView(contact)}
                      >
                        View
                      </button>
                      <button
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        onClick={() => handleDone()}
                      >
                        Done
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>

      {/* Contact Details Modal */}
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
    </div>
  );
}
