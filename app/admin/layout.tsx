'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  {
    icon: Package,
    label: 'Products',
    href: '/admin/products',
    children: [
      { label: 'All Products', href: '/admin/products' },
      { label: 'Add Product', href: '/admin/products/add' },
      { label: 'Edit Product', href: '/admin/products/edit' },
    ],
  },
  { icon: Users, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Contacts', href: '/admin/contacts' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);
  const pathname = usePathname();

  const handleItemClick = () => {
    // Close the mobile navbar when an item is clicked
    setIsMobileNavbarOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Sidebar (hidden on mobile) */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: 240 }}
        className="bg-gray-900 h-screen fixed left-0 top-0 z-40 hidden md:block md:w-60"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-xl"
          >
            Admin Panel
          </motion.span>
        </div>

        <nav className="p-4 space-y-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isParentActive = pathname.startsWith(item.href);

            return (
              <div key={item.href}>
                <Link href={item.href} onClick={handleItemClick}>
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer border-b border-gray-700 ${
                      isParentActive ? 'bg-red-600' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.label}
                    </motion.span>
                  </div>
                </Link>

                {/* Child items for the Products section */}
                {item.children && isParentActive && (
                  <div className="pl-6 space-y-2 mt-2">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link key={child.href} href={child.href} onClick={handleItemClick}>
                          <motion.div
                            whileHover={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer border-b border-gray-700 ${
                              isChildActive ? 'bg-red-600' : ''
                            }`}
                          >
                            <span className="text-sm">{child.label}</span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            className="flex items-center space-x-2 w-full p-3 rounded-lg text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Logout
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Navbar for Mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 z-50 p-4">
        <button
          onClick={() => setIsMobileNavbarOpen(!isMobileNavbarOpen)}
          className="text-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        {isMobileNavbarOpen && (
          <div className="absolute top-16 left-0 w-full bg-gray-900 p-4 space-y-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.href}>
                  <Link href={item.href} onClick={handleItemClick}>
                    <div
                      className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer border-b border-gray-700`}
                    >
                      <Icon className="w-5 h-5" />
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {item.label}
                      </motion.span>
                    </div>
                  </Link>

                  {/* Child items for the Products section */}
                  {item.children && (
                    <div className="pl-6 space-y-2 mt-2">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} onClick={handleItemClick}>
                          <motion.div
                            whileHover={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer border-b border-gray-700`}
                          >
                            <span className="text-sm">{child.label}</span>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main content */}
      <main
        className={`flex-1 p-8 transition-all duration-300 md:ml-60`}
      >
        {children}
      </main>
    </div>
  );
}
