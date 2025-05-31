"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ChevronLeft, ChevronRight, Star, ArrowRight, Zap, Shield, Truck } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/productcard"
import { useRouter } from "next/navigation"

export default function Home() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 100])
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8])
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const ySpring = useSpring(y, springConfig)

  const [currentImage, setCurrentImage] = useState(0)

  const images = [
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80",
  ]

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/product")
        if (!res.ok) return
        const products = await res.json()
        setFeaturedProducts(products.slice(0, 3))
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoadingFeatured(false)
      }
    }
    fetchProducts()
  }, [])

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [featuredRef, featuredInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [testimonialRef, testimonialInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const router = useRouter()

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)

  const features = [
    {
      title: "Premium Quality",
      description: "Only the finest materials and craftsmanship",
      icon: <Shield className="w-8 h-8" />,
    },
    {
      title: "Fast Performance",
      description: "Engineered for maximum speed and efficiency",
      icon: <Zap className="w-8 h-8" />,
    },
    {
      title: "Quick Delivery",
      description: "Get your parts delivered in 2-3 business days",
      icon: <Truck className="w-8 h-8" />,
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        className="h-screen relative flex items-center justify-center"
      >
        <motion.div style={{ y: ySpring, opacity, scale }} className="absolute inset-0 z-0">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[currentImage] || "/placeholder.svg"}
              alt="Motorcycle parts background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </motion.div>
        </motion.div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        <div className="max-w-7xl mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            <Badge variant="secondary" className="mb-6 bg-red-600/20 text-red-400 border-red-600/30">
              Premium Collection 2024
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-wider text-white">
              PREMIUM BIKE PARTS
            </h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Elevate your ride with precision-engineered components designed for performance and style
            </motion.p>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold group transition-all duration-300"
              >
                Explore Products
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-semibold transition-all duration-300"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Built for Performance</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every component is crafted with precision and tested for durability
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 h-full">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="text-red-500 mb-6 flex justify-center"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-red-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section ref={featuredRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">
              Best Sellers
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-wide text-white">Featured Products</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our most popular and highest-rated motorcycle parts
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingFeatured
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-800/40 border border-gray-700 rounded-xl h-[400px] flex flex-col"
                  >
                    <div className="h-48 bg-gray-700 rounded-t-xl" />
                    <div className="flex-1 p-6 flex flex-col gap-4">
                      <div className="h-6 bg-gray-700 rounded w-2/3" />
                      <div className="h-4 bg-gray-700 rounded w-1/2" />
                      <div className="h-4 bg-gray-700 rounded w-1/3" />
                      <div className="mt-auto h-10 bg-gray-700 rounded w-full" />
                    </div>
                  </div>
                ))
              : featuredProducts.map((product, index) => {
                  // If product.image looks like a file id, use /api/file/{id}
                  let imageUrl = product.image;
                  if (
                    typeof product.image === "string" &&
                    product.image.match(/^[0-9a-fA-F]{24}$/)
                  ) {
                    imageUrl = `/api/file/${product.image}`;
                  }
                  // Pass the resolved imageUrl to ProductCard
                  return (
                    <motion.div
                      key={product.id || product._id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <ProductCard product={{ ...product, image: imageUrl }} index={index} />
                    </motion.div>
                  );
                })}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300"
              onClick={() => router.push("/products")}
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialRef} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">What Our Customers Say</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Real feedback from riders who trust our products</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "John Doe",
                feedback: "The best brakes I have ever used! The quality and performance are top-notch.",
                image: "https://randomuser.me/api/portraits/men/1.jpg",
                rating: 5,
              },
              {
                name: "Sarah Lee",
                feedback: "The wheels transformed my ride. Super smooth and stylish!",
                image: "https://randomuser.me/api/portraits/women/1.jpg",
                rating: 5,
              },
              {
                name: "Mike Johnson",
                feedback: "Amazing exhaust system! My bike runs better and sounds incredible.",
                image: "https://randomuser.me/api/portraits/men/2.jpg",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative w-12 h-12 rounded-full overflow-hidden mr-4"
                      >
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">"{testimonial.feedback}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
