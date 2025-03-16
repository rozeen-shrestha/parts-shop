"use client";

import { motion } from "framer-motion";
import { Bike, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

// Define the type for footer items
type FooterItem = {
  text: string;
  icon?: JSX.Element; // Optional icon property
};

export function Footer() {
  const footerSections = [
    {
      title: "Contact",
      items: [
        { icon: <Mail className="w-4 h-4" />, text: "info@bikeparts.com" },
        { icon: <Phone className="w-4 h-4" />, text: "+1 (555) 123-4567" },
        { icon: <MapPin className="w-4 h-4" />, text: "123 Bike Street, NY" },
      ] as FooterItem[], // Explicitly type the items array
    },
    {
      title: "Quick Links",
      items: [
        { text: "About Us" },
        { text: "Products" },
        { text: "Services" },
        { text: "Support" },
      ] as FooterItem[],
    },
    {
      title: "Legal",
      items: [
        { text: "Privacy Policy" },
        { text: "Terms of Service" },
        { text: "Shipping Policy" },
        { text: "Returns" },
      ] as FooterItem[],
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#" },
    { icon: <Instagram className="w-5 h-5" />, href: "#" },
    { icon: <Twitter className="w-5 h-5" />, href: "#" },
  ];

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Bike className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold tracking-wider">BIKE PARTS</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Premium motorcycle parts and accessories for enthusiasts and professionals.
            </p>
          </div>

          {/* Other Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.icon && item.icon} {/* Only render icon if it exists */}
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Bike Parts. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  whileHover={{ scale: 1.2 }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
