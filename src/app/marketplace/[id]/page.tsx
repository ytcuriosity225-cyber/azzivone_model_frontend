"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";

type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category: string;
  skinType: string;
  concern: string;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: Product) => p.id === Number(id));
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-azzivone-navy flex items-center justify-center">
       <div className="w-12 h-12 border-t-2 border-electric-blue rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-azzivone-navy flex flex-col items-center justify-center p-6 text-center">
       <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
       <Link href="/marketplace" className="text-electric-blue hover:underline font-bold uppercase tracking-widest text-sm">Back to Marketplace</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-azzivone-navy pt-24 md:pt-32 pb-20 px-6 md:px-12 relative overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          {/* Product Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-1/2"
          >
            <div className="glass-container rounded-3xl p-6 md:p-8 sticky top-24 md:top-32 overflow-hidden border border-white/10 group">
              <div className="relative h-[300px] md:h-[500px] w-full">
                <Image 
                  src={product.imageUrl} 
                  alt={product.name} 
                  fill 
                  className="object-contain group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                 <span className="bg-electric-blue/10 border border-electric-blue/20 text-electric-blue px-3 md:px-4 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{product.category}</span>
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-1/2 space-y-6 md:space-y-8"
          >
            <div className="space-y-2 md:space-y-4">
              <div className="text-electric-blue font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase italic">{product.brand}</div>
              <h1 className="text-3xl md:text-5xl font-bold font-montserrat text-white leading-tight text-glow">{product.name}</h1>
              <div className="text-2xl md:text-3xl font-bold text-white pt-2 underline decoration-electric-blue/30 underline-offset-8">Rs. {product.price.toLocaleString()}</div>
            </div>

            <div className="space-y-4 md:space-y-6 text-blue-100/70 text-base md:text-lg leading-relaxed">
              <p>
                Experience professional-grade skincare with our {product.name}. Specifically formulated for {product.skinType} skin, this clinical treatment targets {product.concern} with unprecedented precision.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] md:text-[10px] text-blue-300 font-bold uppercase tracking-widest block mb-1">Target Concern</span>
                  <div className="text-white text-sm md:text-base font-bold">{product.concern}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] md:text-[10px] text-blue-300 font-bold uppercase tracking-widest block mb-1">Skin Profile</span>
                  <div className="text-white text-sm md:text-base font-bold">{product.skinType}</div>
                </div>
              </div>
            </div>

            <div className="pt-6 md:pt-10 flex flex-col sm:flex-row gap-4">
               <Link 
                 href={`/checkout?id=${product.id}`}
                 className="flex-1 bg-electric-blue hover:bg-electric-blue/90 text-white text-center py-4 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-electric-blue/20 transition-all transform hover:-translate-y-1"
               >
                 Buy Now
               </Link>
               <Link 
                 href="/ai-consultant"
                 className="flex-1 glass-container border border-electric-blue/40 text-white text-center py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-electric-blue/10 transition-all transform hover:-translate-y-1 hidden sm:block"
               >
                 Ask AI Assistant
               </Link>
            </div>

            <div className="pt-8 border-t border-white/5">
               <div className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-4">Specifications</div>
               <ul className="space-y-3 text-[13px] md:text-sm text-blue-100/60">
                 <li className="flex items-center gap-3">
                   <svg className="w-4 h-4 text-electric-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Dermatologically Tested
                 </li>
                 <li className="flex items-center gap-3">
                   <svg className="w-4 h-4 text-electric-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Medical-Grade Formulation
                 </li>
                 <li className="flex items-center gap-3">
                   <svg className="w-4 h-4 text-electric-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Clinically Proven Results
                 </li>
               </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile */}
      <Link 
        href="/ai-consultant"
        className="fixed bottom-6 right-6 z-[90] sm:hidden flex items-center justify-center w-14 h-14 bg-electric-blue rounded-full shadow-2xl shadow-electric-blue/40 border border-white/20 animate-bounce"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </Link>
    </main>
  );
}
