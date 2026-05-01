"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Ask AI", href: "/ai-consultant" },
    { name: "Marketplace", href: "/marketplace" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] nav-glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={toggleMenu}
            className="p-2 text-white hover:text-electric-blue transition-colors focus:outline-none"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-[0.3em] font-montserrat text-white cursor-pointer hover:text-electric-blue transition-all duration-500">
            AZZIVONE
          </Link>

          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className="text-white hover:text-electric-blue text-xs font-bold tracking-widest uppercase transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="w-8 h-8 md:hidden"></div> {/* Placeholder to keep logo centered */}
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-azzivone-navy/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm glass-container z-[120] p-8 flex flex-col border-r border-white/10"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-bold tracking-widest text-white">MENU</span>
                <button 
                  onClick={toggleMenu}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={link.href}
                      onClick={toggleMenu}
                      className="text-2xl font-bold text-white hover:text-electric-blue transition-all block py-2"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4">Innovation by Azzivone</div>
                <Link 
                  href="/ai-consultant"
                  onClick={toggleMenu}
                  className="w-full grow-button py-4 rounded-xl text-white font-bold text-center block uppercase tracking-widest"
                >
                  Ask AI
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
