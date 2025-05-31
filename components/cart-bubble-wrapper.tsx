'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function CartBubbleWrapper({ children }: { children: React.ReactNode }) {
  const [hasCart, setHasCart] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = localStorage.getItem('cart');
      try {
        const cartArr = cart ? JSON.parse(cart) : [];
        setHasCart(Array.isArray(cartArr) && cartArr.length > 0);
      } catch {
        setHasCart(false);
      }
    }
    const handleStorage = () => {
      const cart = localStorage.getItem('cart');
      try {
        const cartArr = cart ? JSON.parse(cart) : [];
        setHasCart(Array.isArray(cartArr) && cartArr.length > 0);
      } catch {
        setHasCart(false);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <>
      {children}
      {pathname !== '/cart' && (
        <Link
          href="/cart"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 50,
            background: 'var(--background, #222)',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          aria-label="View cart"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path
              d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14h9.45c.75 0 1.41-.41 1.75-1.03l3.24-5.88A1 1 0 0 0 21 6H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 16.37 5.48 18 7 18h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63z"
              fill="currentColor"
            />
          </svg>
          {hasCart && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 14,
                height: 14,
                background: '#e11d48',
                borderRadius: '50%',
                border: '2px solid #fff',
                display: 'block',
              }}
            />
          )}
        </Link>
      )}
    </>
  );
}
