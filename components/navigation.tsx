"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Bike } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  
  const height = useTransform(scrollY, [0, 100], [80, 60]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.9)"]
  );

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.header
      style={{ height, backgroundColor }}
      className="fixed w-full top-0 z-50 text-white"
    >
      <nav className="max-w-7xl mx-auto px-4 h-full flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Bike className="w-8 h-8 text-red-600" />
          <span className="text-xl font-bold tracking-wider">BIKE PARTS</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center justify-center space-x-12 mx-auto">
          {navItems.map((item) => (
            <motion.li
              key={item.name}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "black",
                borderRadius: "4px",
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-4 py-2 ${
                pathname === item.href ? "border border-white/20" : ""
              }`}
            >
              <Link
                href={item.href}
                className="text-current transition-colors text-lg font-medium"
              >
                {item.name}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-auto"
        >
          {isOpen ? <X /> : <Menu />}
        </motion.button>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isOpen ? 0 : "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 right-0 h-screen w-64 bg-black bg-opacity-95 md:hidden"
        >
          <div className="p-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(false)}
              className="mb-8"
            >
              <X />
            </motion.button>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <motion.li
                  key={item.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={pathname === item.href ? "border border-white/20" : ""}
                >
                  <Link
                    href={item.href}
                    className="text-white hover:text-red-500 transition-colors block p-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  );
}