'use client';

import { useState } from 'react';

interface Product {
  id?: number;
  name: string;
  price: string;
  stock: number;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => void;
}

export default function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || '');
  const [stock, setStock] = useState(product?.stock || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: product?.id || Date.now(), name, price, stock });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          className="w-full px-4 py-2 bg-gray-800 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Price"
          className="w-full px-4 py-2 bg-gray-800 rounded-lg"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          className="w-full px-4 py-2 bg-gray-800 rounded-lg"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          required
        />
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700"
            onClick={() => history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
