"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  skinType?: string;
  concern?: string;
};

// Create a separate component for the checkout logic to be wrapped in Suspense
function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (productId) {
      fetch("/products.json")
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((p: Product) => p.id === Number(productId));
          setProduct(found);
        });
    }
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-azzivone-navy pt-24 md:pt-32 pb-20 px-4 md:px-12 flex items-center justify-center overflow-x-hidden">
      <Navbar />

      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 md:space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-2 text-center md:text-left">
              <span className="text-electric-blue font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase italic">Clinical Checkout</span>
              <h1 className="text-3xl md:text-5xl font-bold font-montserrat text-white text-glow">Secure Payment</h1>
            </div>

            {product && (
              <div className="glass-container p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="flex gap-4 md:gap-6">
                  <div className="h-20 w-20 md:h-24 md:w-24 bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-2 shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-electric-blue uppercase tracking-widest">{product.brand}</p>
                    <h3 className="text-white font-bold text-sm md:text-lg line-clamp-2">{product.name}</h3>
                    <p className="text-blue-300 font-bold mt-1 text-sm md:text-base">Rs. {product.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                   <div className="flex justify-between text-blue-100/60 text-[10px] md:text-sm">
                      <span>Subtotal</span>
                      <span>Rs. {product.price.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-blue-100/60 text-[10px] md:text-sm">
                      <span>Shipping</span>
                      <span className="text-green-400 uppercase font-bold text-[10px]">Free</span>
                   </div>
                   <div className="flex justify-between text-white font-bold text-lg md:text-xl pt-3">
                      <span>Total Amount</span>
                      <span className="text-glow text-electric-blue">Rs. {product.price.toLocaleString()}</span>
                   </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2"
          >
            <form onSubmit={handleSubmit} className="glass-container p-6 md:p-8 rounded-3xl border border-white/5 space-y-4 md:space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-1">Full Name</label>
                  <input type="text" required placeholder="Hadi ..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white focus:outline-none focus:border-electric-blue/50 transition-all text-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-1">Email Address</label>
                  <input type="email" required placeholder="hadi@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white focus:outline-none focus:border-electric-blue/50 transition-all text-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-1">Shipping Address</label>
                  <textarea required rows={3} placeholder="Full address in Pakistan..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white focus:outline-none focus:border-electric-blue/50 transition-all text-sm resize-none tracking-tight"></textarea>
               </div>

               <div className="pt-4 md:pt-6">
                  <button 
                    disabled={isProcessing}
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white font-bold py-4 rounded-xl tracking-widest uppercase shadow-lg shadow-electric-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3 overflow-hidden text-sm md:text-base relative"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Complete Secure Order"
                    )}
                  </button>
               </div>

               <p className="text-[8px] md:text-[10px] text-white/20 text-center uppercase tracking-widest italic font-bold">Encrypted Secure Transaction</p>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-azzivone-navy/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-container max-w-sm md:max-w-md w-full p-8 md:p-10 rounded-3xl text-center space-y-6 border border-electric-blue/30 relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-electric-blue/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-electric-blue/10 rounded-full blur-3xl"></div>
              
              <div className="w-16 h-16 md:w-20 md:h-20 bg-electric-blue rounded-full mx-auto flex items-center justify-center shadow-lg shadow-electric-blue/40 border-4 border-white/10 animate-bounce">
                 <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-montserrat tracking-tight">Order Received</h2>
                <p className="text-blue-100/70 text-xs md:text-sm">Thank you for choosing clinical innovation. <br className="hidden md:block"/> We are preparing your shipment.</p>
              </div>
              <Link href="/" className="block w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 md:py-4 rounded-xl border border-white/10 transition-all uppercase tracking-widest text-[10px] md:text-xs">
                Back to Innovation
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Main page component wrapped in Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-azzivone-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue/20 border-t-electric-blue rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
