"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const productId = (params as { id: string }).id

  type ProductType = {
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

  type UploadedImage = {
    file: File;
    preview: string;
    serverId: string | null;
  };

  type UploadedFilesType = {
    mainImage: UploadedImage | null;
    additionalImages: UploadedImage[];
  };

  const [product, setProduct] = useState<ProductType>({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    specifications: "",
    inStock: true,
    image: "",
    additionalImages: [],
  })

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesType>({
    mainImage: null,
    additionalImages: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploadStatus, setUploadStatus] = useState({
    uploading: false,
    message: "",
  })

  // Fetch the product data when the component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product?id=${productId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }

        const productData = await response.json()

        // Format specifications as a comma-separated string for the form
        const specificationsString = Array.isArray(productData.specifications)
          ? productData.specifications.join(", ")
          : productData.specifications

        setProduct({
          ...productData,
          price: productData.price.toString(),
          stock: productData.stock.toString(),
          specifications: specificationsString,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("Failed to load product data. Please try again.")
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // For checkbox, safely check if 'checked' exists
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "checkbox"
    ) {
      setProduct({
        ...product,
        [name]: e.target.checked,
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  }

  const handleMainImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFiles({
        ...uploadedFiles,
        mainImage: {
          file,
          preview: URL.createObjectURL(file),
          serverId: null
        },
      })
    }
  }

  const handleAdditionalImagesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        serverId: null
      }))

      setUploadedFiles({
        ...uploadedFiles,
        additionalImages: filesArray,
      })
    }
  }

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

  // Remove main image (existing or new)
  const handleRemoveMainImage = async () => {
    // If new image selected, just remove from uploadedFiles
    if (uploadedFiles.mainImage) {
      if (uploadedFiles.mainImage.serverId) {
        await deleteImageFromServer(uploadedFiles.mainImage.serverId);
      }
      setUploadedFiles({ ...uploadedFiles, mainImage: null });
      return;
    }
    // If existing image, remove from product and delete from server
    if (product.image) {
      await deleteImageFromServer(product.image);
      setProduct({ ...product, image: "" });
    }
  };

  // Remove additional image (existing or new)
  const handleRemoveAdditionalImage = async (index: number, isNew: boolean) => {
    if (isNew) {
      const image = uploadedFiles.additionalImages[index];
      if (image && image.serverId) {
        await deleteImageFromServer(image.serverId);
      }
      setUploadedFiles({
        ...uploadedFiles,
        additionalImages: uploadedFiles.additionalImages.filter((_, i) => i !== index),
      });
    } else {
      const imageId = product.additionalImages[index];
      await deleteImageFromServer(imageId);
      setProduct({
        ...product,
        additionalImages: product.additionalImages.filter((_, i) => i !== index),
      });
    }
  };

  const uploadImage = async (file: File, category: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", category)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to upload image")
    }

    return await response.json()
  }

  const uploadAllImages = async () => {
    setUploadStatus({ uploading: true, message: "Uploading images..." })

    try {
      // Upload main image if selected
      let mainImageId = product.image // Keep existing image ID if no new image
      if (uploadedFiles.mainImage) {
        const result = await uploadImage(uploadedFiles.mainImage.file, product.category || "products")
        mainImageId = result._id
        setUploadedFiles((prev) => ({
          ...prev,
          mainImage: prev.mainImage
            ? {
                ...prev.mainImage,
                serverId: result._id,
                file: prev.mainImage.file, // Ensure file is always present
                preview: prev.mainImage.preview // Ensure preview is always present
              }
            : null,
        }));
      }

      // Upload additional images if selected
      const additionalImageIds = [...product.additionalImages] // Keep existing image IDs
      for (let i = 0; i < uploadedFiles.additionalImages.length; i++) {
        const imageData = uploadedFiles.additionalImages[i];
        const result = await uploadImage(imageData.file, product.category || "products")
        additionalImageIds.push(result._id)
        setUploadedFiles((prev) => {
          const updated = [...prev.additionalImages];
          updated[i] = {
            ...updated[i],
            serverId: result._id,
            file: updated[i].file, // Ensure file is always present
            preview: updated[i].preview // Ensure preview is always present
          };
          return { ...prev, additionalImages: updated };
        });
      }

      setUploadStatus({ uploading: false, message: "Images uploaded successfully!" })

      return {
        mainImageId,
        additionalImageIds,
      }
    } catch (error: unknown) {
      setUploadStatus({ uploading: false, message: `Error uploading images: ${(error instanceof Error ? error.message : String(error))}` })
      throw error
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // First upload all images and get their IDs
      const { mainImageId, additionalImageIds } = await uploadAllImages()

      // Then submit the product with image IDs
      const response = await fetch(`/api/product?id=${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...product,
          price: Number.parseFloat(product.price),
          stock: Number.parseInt(product.stock, 10),
          specifications: product.specifications.split(",").map((spec) => spec.trim()),
          image: mainImageId,
          additionalImages: additionalImageIds,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Product updated successfully:", data)
        router.push("/admin/products")
      } else {
        const errorData = await response.json()
        console.error("Error updating product:", errorData)
        setError("Failed to update product. Please try again.")
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error)
      setError(`An error occurred: ${(error instanceof Error ? error.message : String(error))}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/products")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading product data...</div>
      </div>
    )
  }

  if (error && !product.name) {
    return (
      <div className="min-h-screen p-8 bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

        {error && <div className="mb-4 p-3 rounded bg-red-900">{error}</div>}

        {uploadStatus.message && (
          <div className={`mb-4 p-3 rounded ${uploadStatus.uploading ? "bg-blue-900" : "bg-green-900"}`}>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={product.inStock}
              onChange={handleChange}
              className="rounded bg-gray-800"
            />
            <label htmlFor="inStock">In Stock</label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Main Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageSelect}
                className="w-full p-3 rounded bg-gray-800"
              />
              {uploadedFiles.mainImage ? (
                <div className="mt-2 relative">
                  <p className="mb-2 text-sm">New image to upload:</p>
                  <img
                    src={uploadedFiles.mainImage.preview || "/placeholder.svg"}
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
              ) : product.image ? (
                <div className="mt-2 relative">
                  <p className="mb-2 text-sm">Current image:</p>
                  <img
                    src={`/api/file/${product.image}`}
                    alt="Current main product"
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
              ) : null}
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
                <div>
                  <p className="my-2 text-sm">New images to upload:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedFiles.additionalImages.map((image, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt={`New Product Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-700 text-white rounded px-2 py-1 text-xs"
                          onClick={() => handleRemoveAdditionalImage(index, true)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.additionalImages && product.additionalImages.length > 0 && (
                <div>
                  <p className="my-2 text-sm">Current additional images:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {product.additionalImages.map((imageId, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={`/api/file/${imageId}`}
                          alt={`Product Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-700 text-white rounded px-2 py-1 text-xs"
                          onClick={() => handleRemoveAdditionalImage(index, false)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
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
              {isSubmitting ? "Saving..." : "Update Product"}
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
  )
}
