'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
}

export default function AdminProducts() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Gaming Laptop', price: '$1,499', stock: 10 },
    { id: 2, name: 'Wireless Headphones', price: '$299', stock: 25 },
    { id: 3, name: 'Mechanical Keyboard', price: '$129', stock: 40 },
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    router.push(
      `/admin/products/edit?id=${product.id}&name=${encodeURIComponent(
        product.name
      )}&price=${encodeURIComponent(
        product.price
      )}&stock=${encodeURIComponent(product.stock)}`
    );
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Products Management
      </motion.h1>

      {/* Add Product Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        onClick={() => router.push('/admin/products/add')}
      >
        + Add New Product
      </motion.button>

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 overflow-x-auto bg-gray-900 rounded-lg p-4"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="py-3 px-4 text-left">Product Name</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Stock</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-700">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.price}</td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4 text-center space-x-3">
                    <button
                      className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
