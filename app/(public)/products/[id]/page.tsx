'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/productcard';

// Add a Product type
type Product = {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  specifications?: string[];
  additionalImages?: string[];
  [key: string]: any;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/product?id=${productId}`);
      const data = await res.json();
      setProduct(data);
      // Set default selected image
      if (data?.image) {
        setSelectedImage(
          data.image.startsWith('http')
            ? data.image
            : `/api/file/${data.image}`
        );
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    // Fetch related products (same category if possible, always exclude current)
    const fetchRelated = async () => {
      const res = await fetch('/api/product');
      const all: Product[] = await res.json();
      let filtered = all.filter(
        (p: Product) =>
          product &&
          (p._id || p.id) !== (product._id || product.id)
      );
      if (product?.category) {
        const sameCategory = filtered.filter((p: Product) => p.category === product.category);
        setRelatedProducts((sameCategory.length > 0 ? sameCategory : filtered).slice(0, 6));
      } else {
        setRelatedProducts(filtered.slice(0, 6));
      }
    };
    if (product) fetchRelated();
  }, [product]);

  // Handle zoom effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return; // Guard clause to ensure imageContainerRef is not null

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Stop zoom when cursor is 8px away from the image
    if (x < -8 || x > width + 8 || y < -8 || y > height + 8) {
      setShowZoom(false);
      return;
    }

    setShowZoom(true);
    setCursorPosition({ x, y });
    setZoomPosition({
      x: Math.max(0, Math.min(100, (x / width) * 100)),
      y: Math.max(0, Math.min(100, (y / height) * 100)),
    });
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value)); // Ensure quantity is at least 1
    setQuantity(value);
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => (item._id || item.id) === (product._id || product.id));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity,
        inStock: true,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1200);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const additionalImages = Array.isArray(product.additionalImages)
    ? product.additionalImages
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 ">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Image Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              ref={imageContainerRef}
              className="relative h-96 overflow-hidden rounded-lg bg-gray-900"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowZoom(false)}
            >
              <Image
                src={
                  selectedImage.startsWith("http")
                    ? selectedImage
                    : `/api/file/${selectedImage.replace(/^\/api\/file\//, "")}`
                }
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Zoom Lens */}
              {showZoom && (
                <div
                  className="absolute w-24 h-24 border-2 border-red-500 pointer-events-none z-10"
                  style={{
                    left: Math.max(
                      0,
                      Math.min(
                        cursorPosition.x - 48,
                        imageContainerRef.current?.clientWidth ?? 0 - 96
                      ),
                    ),
                    top: Math.max(
                      0,
                      Math.min(
                        cursorPosition.y - 48,
                        imageContainerRef.current?.clientHeight ?? 0 - 96
                      )
                    ),
                  }}
                ></div>
              )}

              {/* Zoomed Image */}
              {showZoom && (
                <div
                  className="fixed bg-gray-900 w-64 h-64 border border-gray-700 rounded-lg overflow-hidden z-20 shadow-xl"
                  style={{
                    left: cursorPosition.x + 120,
                    top: cursorPosition.y - 32,
                    backgroundImage: `url(${selectedImage})`,
                    backgroundSize: '300%',
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[product.image, ...additionalImages].filter(Boolean).map((img, index) => {
                const imgSrc = img.startsWith('http') ? img : `/api/file/${img}`;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                    onClick={() => setSelectedImage(imgSrc)}
                  >
                    <div
                      className={`relative w-20 h-20 rounded-md cursor-pointer ${
                        selectedImage === imgSrc ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      <Image
                        src={
                          imgSrc.startsWith("http")
                            ? imgSrc
                            : `/api/file/${imgSrc.replace(/^\/api\/file\//, "")}`
                        }
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-2xl text-red-500 font-semibold">
              Rs {product.price?.toFixed(2)}
            </p>
            <p
              className="text-gray-300"
              style={{ whiteSpace: 'pre-line' }}
            >
              {product.description}
            </p>

            {/* Specifications */}
            <ul className="list-disc pl-5 text-gray-300">
              {(Array.isArray(product.specifications) ? product.specifications : [])
                .map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
            </ul>

            {/* Quantity Input */}
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              placeholder="Quantity"
              className="w-full p-3 bg-gray-800 rounded"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addedToCart ? "Added!" : "Add to Cart"}
            </motion.button>
          </motion.div>
        </div>

        {/* Related Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <ProductCard
                  product={{
                    ...product,
                    image: product.image && !product.image.startsWith('http')
                      ? `/api/file/${product.image}`
                      : product.image,
                    category: product.category ?? "",
                    addToCart: false
                  }}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
