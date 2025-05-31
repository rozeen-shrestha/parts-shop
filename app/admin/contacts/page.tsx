'use client';

import { useEffect, useState } from 'react';

interface Contact {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-300">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Message</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, idx) => (
                <tr
                  key={contact._id || idx}
                  className="border-b border-gray-700 hover:bg-gray-800 transition"
                >
                  <td className="py-3 px-4">{contact.name}</td>
                  <td className="py-3 px-4">{contact.email}</td>
                  <td className="py-3 px-4">{contact.phone}</td>
                  <td className="py-3 px-4">{contact.message}</td>
                  <td className="py-3 px-4">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => setSelectedContact(contact)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && (
            <div className="text-gray-400 mt-4 text-center">No contacts found.</div>
          )}
        </div>
      )}

      {/* Modal for contact details */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setSelectedContact(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Contact Details</h2>
            <div className="mb-2"><span className="font-semibold">Name:</span> {selectedContact.name}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {selectedContact.email}</div>
            <div className="mb-2"><span className="font-semibold">Phone:</span> {selectedContact.phone}</div>
            <div className="mb-2"><span className="font-semibold">Message:</span> {selectedContact.message}</div>
            <div className="mb-2"><span className="font-semibold">Date:</span> {selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
