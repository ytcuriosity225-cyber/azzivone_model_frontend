"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-azzivone-navy/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-container max-w-lg w-full rounded-[2rem] overflow-hidden relative"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-64 w-full">
              <Image 
                src="/bg-hero.png" 
                alt="AI Analysis" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-azzivone-navy via-transparent to-transparent"></div>
            </div>

            <div className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <span className="text-electric-blue font-bold tracking-[0.2em] text-xs uppercase italic">Innovation</span>
                <h2 className="text-3xl font-bold font-montserrat text-white">Try Pakistan’s First <br/> Skincare AI</h2>
                <p className="text-blue-200/70 text-sm">Get a medical-grade skin report in seconds using our advanced neural analysis.</p>
              </div>

              <Link 
                href="/ai-consultant"
                className="block w-full glow-button py-4 rounded-xl text-white font-bold tracking-widest uppercase text-sm"
              >
                Start Analysis
              </Link>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
