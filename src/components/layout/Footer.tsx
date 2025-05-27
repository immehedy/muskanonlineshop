import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary mt-16">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
          <Link href="/" className="flex items-center mb-4">
            <Image
              src="/muskan-logo.png"
              alt="Muskan Online Shop Logo"
              width={120}
              height={50}
              className="object-contain"
              priority={true}
            />
          </Link>
            <p className="text-muted-foreground">
              Your one-stop shop for premium kitchen products and cookware in Bangladesh.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-[#247a95] button-hover">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-muted-foreground">
              <p>Block B South mandail, Zinzira</p>
              <p>Keranigonj Model Dhaka, Bangladesh</p>
              <p className="mt-2">Email: info@muskanonlineshop.com</p>
              <p>Phone: 01799804899</p>
            </address>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Muskanonlineshop. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Payment Methods:</span>

            {/* bKash */}
            <span className="w-8 h-8 p-1 bg-white rounded shadow-sm flex items-center justify-center">
              <img src="/bkash.svg" alt="bKash" className="h-6 w-auto" />
            </span>

            {/* Nagad */}
            <span className="w-8 h-8 p-1 bg-white rounded shadow-sm flex items-center justify-center">
              <img src="/nagad.svg" alt="Nagad" className="h-6 w-auto" />
            </span>

            {/* COD (Cash on Delivery) */}
            <span className="w-8 h-8 p-1 bg-white rounded shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#247a95]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 7c0-1.1.9-2 2-2h16a2 2 0 012 2v2H2V7zm0 4h20v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6zm6 3a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </span>

            {/* Card Payment */}
            <span className="w-8 h-8 p-1 bg-white rounded shadow-sm flex items-center justify-center">
              <img src="/visa.svg" alt="Visa" className="h-6 w-auto" />
            </span>
          </div>


        </div>
      </div>
    </footer>
  );
};

export default Footer;
