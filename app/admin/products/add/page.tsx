'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type UploadedImage = {
  file: File;
  preview: string;
  serverId: string | null;
};

type ProductState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  specifications: string;
  inStock: boolean;
  image: string;
  additionalImages: string[];
};

type UploadedFilesState = {
  mainImage: UploadedImage | null;
  additionalImages: UploadedImage[];
};

type UploadStatus = {
  uploading: boolean;
  message: string;
};

export default function EditProduct() {
  const router = useRouter();
  const [product, setProduct] = useState<ProductState>({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    specifications: '',
    inStock: true,
    image: '',
    additionalImages: []
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesState>({
    mainImage: null,
    additionalImages: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    message: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleMainImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles({
        ...uploadedFiles,
        mainImage: {
          file,
          preview: URL.createObjectURL(file),
          serverId: null // Will be set after upload
        }
      });
    }
  };

  const handleAdditionalImagesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray: UploadedImage[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        serverId: null // Will be set after upload
      }));

      setUploadedFiles({
        ...uploadedFiles,
        additionalImages: filesArray
      });
    }
  };

  // Delete uploaded image from server by fileId
  const deleteImageFromServer = async (fileId: string | null) => {
    if (!fileId) return;
    try {
      const url = `/api/upload?fileId=${fileId}`;
      await fetch(url, { method: 'DELETE' });
    } catch (err) {
      // Optionally handle error
    }
  };

  // Remove main image (if uploaded, delete from server)
  const handleRemoveMainImage = async () => {
    if (uploadedFiles.mainImage && uploadedFiles.mainImage.serverId) {
      await deleteImageFromServer(uploadedFiles.mainImage.serverId);
    }
    setUploadedFiles({ ...uploadedFiles, mainImage: null });
  };

  // Remove additional image by index (if uploaded, delete from server)
  const handleRemoveAdditionalImage = async (index: number) => {
    const image = uploadedFiles.additionalImages[index];
    if (image && image.serverId) {
      await deleteImageFromServer(image.serverId);
    }
    setUploadedFiles({
      ...uploadedFiles,
      additionalImages: uploadedFiles.additionalImages.filter((_, i) => i !== index),
    });
  };

  const uploadImage = async (file: File, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    return await response.json();
  };

  const uploadAllImages = async () => {
    setUploadStatus({ uploading: true, message: 'Uploading images...' });

    try {
      // Upload main image if selected
      let mainImageId: string | null = null;
      if (uploadedFiles.mainImage) {
        const result = await uploadImage(uploadedFiles.mainImage.file, product.category || 'products');
        mainImageId = result._id;
        // Save serverId for possible deletion before submit
        setUploadedFiles((prev) => ({
          ...prev,
          mainImage: prev.mainImage ? { ...prev.mainImage, serverId: result._id } : null
        }));
      }

      // Upload additional images if selected
      const additionalImageIds: string[] = [];
      for (let i = 0; i < uploadedFiles.additionalImages.length; i++) {
        const imageData = uploadedFiles.additionalImages[i];
        const result = await uploadImage(imageData.file, product.category || 'products');
        additionalImageIds.push(result._id);
        // Save serverId for possible deletion before submit
        setUploadedFiles((prev) => {
          const updated = [...prev.additionalImages];
          updated[i] = { ...updated[i], serverId: result._id };
          return { ...prev, additionalImages: updated };
        });
      }

      setUploadStatus({ uploading: false, message: 'Images uploaded successfully!' });

      return {
        mainImageId,
        additionalImageIds
      };
    } catch (error: any) {
      setUploadStatus({ uploading: false, message: `Error uploading images: ${error.message}` });
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First upload all images and get their IDs
      const { mainImageId, additionalImageIds } = await uploadAllImages();

      // Then submit the product with image IDs
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          price: parseFloat(product.price),
          stock: parseInt(product.stock, 10),
          specifications: product.specifications.split(',').map((spec) => spec.trim()),
          image: mainImageId,
          additionalImages: additionalImageIds
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Product added successfully:', data);
        router.push('/admin/products');
      } else {
        const errorData = await response.json();
        console.error('Error adding product:', errorData);
        alert('Failed to add product. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Add Product</h1>

        {uploadStatus.message && (
          <div className={`mb-4 p-3 rounded ${uploadStatus.uploading ? 'bg-blue-900' : 'bg-green-900'}`}>
            {uploadStatus.message}
          </div>
        )}

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

          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            placeholder="Stock Quantity"
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

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Main Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageSelect}
                className="w-full p-3 rounded bg-gray-800"
              />
              {uploadedFiles.mainImage && (
                <div className="mt-2 relative">
                  <img
                    src={uploadedFiles.mainImage.preview}
                    alt="Main product preview"
                    className="w-full h-40 object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-700 text-white rounded px-2 py-1 text-xs"
                    onClick={handleRemoveMainImage}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Additional Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesSelect}
                className="w-full p-3 rounded bg-gray-800"
              />

              {uploadedFiles.additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {uploadedFiles.additionalImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Product Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-700 text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleRemoveAdditionalImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full p-3 bg-red-600 rounded hover:bg-red-700"
              disabled={isSubmitting || uploadStatus.uploading}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full p-3 bg-gray-600 rounded hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
