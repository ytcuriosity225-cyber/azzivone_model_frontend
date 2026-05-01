"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkinType, setSelectedSkinType] = useState("All");

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((p) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedSkinType !== "All") {
      result = result.filter((p) => p.skinType.includes(selectedSkinType));
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, selectedSkinType, products]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const skinTypes = ["All", "Dry", "Oily", "Combination", "Normal", "Sensitive"];

  return (
    <main className="min-h-screen bg-azzivone-navy flex flex-col pt-24 px-6 md:px-12 pb-20">
       {/* Navigation Bar */}
       <nav className="fixed top-0 left-0 w-full z-50 nav-glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 text-white hover:text-electric-blue transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-[0.3em] font-montserrat text-white cursor-pointer">
            AZZIVONE
          </Link>

          <div className="hidden md:flex space-x-8">
             <Link href="/ai-consultant" className="text-white hover:text-electric-blue text-xs font-bold tracking-widest uppercase transition-colors">Ask AI</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-electric-blue font-bold tracking-[0.2em] text-xs uppercase italic">Azzivone Clinical</span>
              <h1 className="text-4xl md:text-6xl font-bold font-montserrat text-white tracking-tight">Full Marketplace</h1>
            </div>
            <div className="relative w-full md:w-96">
               <input 
                 type="text" 
                 placeholder="Search clinical products..."
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-electric-blue/50 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Category:</span>
               <div className="flex gap-2">
                 {categories.map((cat) => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/40' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'}`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Skin Type:</span>
               <div className="flex gap-2">
                 {skinTypes.map((type) => (
                   <button 
                     key={type}
                     onClick={() => setSelectedSkinType(type)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedSkinType === type ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/40' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'}`}
                   >
                     {type}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product.id} 
                className="glass-container group rounded-2xl p-6 flex flex-col hover:bg-white/5 transition-all duration-500"
              >
                <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-electric-blue/30 transition-colors">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow space-y-2">
                  <p className="text-xs font-bold text-electric-blue uppercase tracking-widest">{product.brand}</p>
                  <h3 className="text-lg font-bold text-white line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                  <div className="pt-2 text-[10px] text-blue-200/50 uppercase font-bold tracking-widest flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded border border-white/5">{product.skinType}</span>
                    <span className="px-2 py-0.5 rounded border border-white/5">{product.category}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <span className="font-bold text-white text-xl">Rs. {product.price.toLocaleString()}</span>
                  <button className="px-5 py-2 bg-electric-blue/20 hover:bg-electric-blue text-white text-sm font-bold rounded-lg transition-all duration-300 border border-electric-blue/30">
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
           </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-40">
             <div className="text-white/20 text-xl font-bold">No products match your criteria.</div>
             <button onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedSkinType("All");}} className="mt-4 text-electric-blue hover:underline">Reset Filters</button>
          </div>
        )}
      </div>
    </main>
  );
}
