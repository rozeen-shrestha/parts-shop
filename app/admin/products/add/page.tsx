'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProduct() {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    specifications: '',
    inStock: true,
    image: '',
    additionalImages: [] as string[], // Explicitly type as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((file: File) =>
        URL.createObjectURL(file)
      );
      setProduct({ ...product, additionalImages: files });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Product updated:', product);
    router.push('/admin/products');
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full p-3 rounded bg-gray-800"
            required
          />

          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            placeholder="Type of Part"
            className="w-full p-3 rounded bg-gray-800"
            required
          />

          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-3 rounded bg-gray-800"
            required
          />

          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-3 rounded bg-gray-800"
            required
          ></textarea>

          <textarea
            name="specifications"
            value={product.specifications}
            onChange={handleChange}
            placeholder="Specifications (comma-separated)"
            className="w-full p-3 rounded bg-gray-800"
            required
          ></textarea>

          <input
            type="number"
            name="inStock"
            value={product.inStock ? 1 : 0}
            onChange={(e) =>
              setProduct({ ...product, inStock: e.target.value === '1' })
            }
            placeholder="Stock"
            className="w-full p-3 rounded bg-gray-800"
            required
          />

          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="w-full p-3 rounded bg-gray-800"
          />

          <div className="grid grid-cols-3 gap-4 mt-4">
            {product.additionalImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Product Image ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full p-3 bg-red-600 rounded hover:bg-red-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full p-3 bg-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
