"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const defaultCategories = ["All"];
const priceRanges = ["All", "$0-$100", "$100-$500", "$500-$1000", "$1000+"];

// Add a Product type
type Product = {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  specifications?: string[];
  additionalImages?: string[];
  [key: string]: any;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(defaultCategories);
  const [addedId, setAddedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        const data: Product[] = await res.json();
        setProducts(data);

        // Extract unique categories from products, fallback to empty string if undefined
        const cats = Array.from(new Set(data.map((p) => p.category ?? "").filter(Boolean)));
        setCategories(["All", ...cats]);
      } catch (err) {
        setProducts([]);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || (product.category ?? "") === selectedCategory;
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesPrice = true;

    if (selectedPrice !== "All") {
      const [min, max] = selectedPrice
        .replace("$", "")
        .split("-")
        .map((price) => (price === "+" ? Infinity : Number(price)));
      matchesPrice = product.price >= min && product.price <= max;
    }

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Add to Cart handler
  const handleAddToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => (item._id || item.id) === (product._id || product.id));
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1,
        inStock: true,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setAddedId(product._id || product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Our Products
        </motion.h1>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {priceRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-800/40 border border-gray-700 rounded-lg h-[400px] flex flex-col"
                >
                  <div className="h-64 bg-gray-700 rounded-t-lg" />
                  <div className="flex-1 p-6 flex flex-col gap-4">
                    <div className="h-6 bg-gray-700 rounded w-2/3" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="mt-auto h-10 bg-gray-700 rounded w-full" />
                  </div>
                </div>
              ))
            : filteredProducts.map((product) => (
                <motion.div
                  key={product._id || product.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="bg-gray-900 rounded-lg overflow-hidden transform-gpu cursor-pointer"
                  onClick={() => router.push(`/products/${product._id || product.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/products/${product._id || product.id}`);
                    }
                  }}
                >
                  <div className="relative h-64">
                    <Image
                      src={
                        product.image
                          ? (product.image.startsWith("http") ? product.image : `/api/file/${product.image}`)
                          : "/placeholder.svg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-red-500 font-medium">Rs {product.price?.toFixed(2)}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      {addedId === (product._id || product.id) ? "Added!" : "Add to Cart"}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </div>
  );
}
