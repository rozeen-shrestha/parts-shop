'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  specifications: string[];
  inStock: boolean;
  image: string;
  additionalImages: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/product');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/product?id=${id}`, {
          method: 'DELETE',
          credentials: "include",
        });

        if (response.ok) {
          setProducts(products.filter((product) => product._id !== id));
          alert('Product deleted successfully.');
        } else {
          alert('Failed to delete product.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handleEdit = (product: Product) => {
    router.push(
      `/admin/products/edit/${product._id}`
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
        {loading ? (
          <p className="text-center text-gray-400">Loading products...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-300">
                <th className="py-3 px-4 text-left">Product Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Stock</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-700">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">${product.price}</td>
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
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
