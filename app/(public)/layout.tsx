import '../globals.css';
import type { Metadata } from 'next';
import { Rajdhani } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/components/footer';
import { CartBubbleWrapper } from '@/components/cart-bubble-wrapper';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Bike Parts',
  description: 'Premium motorcycle parts and accessories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={rajdhani.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <CartBubbleWrapper>
          {children}
          </CartBubbleWrapper>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
