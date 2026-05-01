"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import WelcomePopup from "@/components/WelcomePopup";

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 nav-glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="p-2 text-white hover:text-electric-blue transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-[0.3em] font-montserrat text-white cursor-pointer hover:text-electric-blue transition-all duration-500">
            AZZIVONE
          </Link>

          <div className="hidden md:flex space-x-8">
             <Link href="/ai-consultant" className="text-white hover:text-electric-blue text-xs font-bold tracking-widest uppercase transition-colors">Ask AI</Link>
             <Link href="/marketplace" className="text-white hover:text-electric-blue text-xs font-bold tracking-widest uppercase transition-colors">Marketplace</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/bg-hero.png" 
            alt="AI Skincare" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-azzivone-navy/60 via-azzivone-navy/40 to-azzivone-navy/80"></div>
        </div>

        <div className="relative z-10 max-w-4xl animate-slide-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat text-white mb-6 leading-tight text-glow">
            Pakistan’s First Innovative <br/>
            <span className="text-electric-blue">AI Skincare Marketplace</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/90 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of personalized beauty through <br className="hidden md:block"/> medical-grade AI analysis.
          </p>
          <Link 
            href="/ai-consultant"
            className="glow-button px-12 py-4 rounded-full text-lg font-bold tracking-widest text-white uppercase inline-block"
          >
            ASK AI
          </Link>
        </div>
      </section>

      {/* Science of Beauty Card */}
      <section className="px-6 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="glass-container rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 transform hover:scale-[1.02] transition-transform duration-500">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white tracking-wide">
                Explore the Science of Beauty
              </h2>
              <p className="text-blue-200/70 text-lg md:max-w-lg">
                Discover clinically-backed products tailored precisely to your unique skin profile.
              </p>
            </div>
            <Link 
              href="/marketplace" 
              className="px-10 py-4 border border-electric-blue/40 rounded-xl text-white font-semibold hover:bg-electric-blue/10 transition-all duration-300 backdrop-blur-sm"
            >
              See Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Founder's Blog Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Founder Image */}
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-electric-blue/20 rounded-3xl blur-2xl group-hover:bg-electric-blue/30 transition-all duration-700"></div>
              <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-white/10 glass-container p-2">
                <Image 
                  src="/founder.png" 
                  alt="Founder Hadi" 
                  fill 
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
            
            {/* Story Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-4">
                <span className="text-electric-blue font-bold tracking-[0.3em] text-xs uppercase italic">Behind the Brand</span>
                <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-white leading-tight">The Visionary <br/><span className="text-glow">Behind Azzivone</span></h2>
              </div>
              
              <div className="space-y-6 text-blue-100/70 leading-relaxed text-lg">
                <p>
                  As an entrepreneur in Pakistan, my journey wasn't just about building a business; it was about solving a deep-rooted problem in my family and community. Growing up, I saw how accessible clinical skincare was a luxury many couldn't afford or even understand.
                </p>
                <p>
                  Charged with family responsibility from a young age, I realized that technology was the only bridge that could democratize luxury healthcare. I spent countless nights teaching myself AI, diving deep into neural networks and machine learning, envisioning a future where every Pakistani could have access to an expert dermatologist in their pocket.
                </p>
                <p>
                  Azzivone is the result of that relentless pursuit. It's more than a marketplace; it's a testament to the fact that innovation doesn't always come from massive labs—it comes from necessity, grit, and the courage to build something that truly matters.
                </p>
              </div>

              <div className="pt-8 flex items-center gap-6">
                 <div className="h-px flex-1 bg-white/10"></div>
                 <div className="text-white font-bold font-montserrat italic tracking-wider">Hadi, Founder of Azzivone</div>
                 <div className="h-px flex-1 bg-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collection (Top 4) */}
      <section id="marketplace" className="py-32 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-electric-blue font-bold tracking-[0.2em] text-xs uppercase">Curated For You</span>
              <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-white">Best Sellers</h2>
            </div>
            <Link href="/marketplace" className="text-blue-300 hover:text-electric-blue text-sm font-bold flex items-center gap-2 group transition-colors">
              Explore All Products
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="glass-container group rounded-2xl p-6 flex flex-col hover:bg-white/5 transition-all duration-500">
                <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-electric-blue/30 transition-colors">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow space-y-2">
                  <p className="text-xs font-bold text-electric-blue uppercase tracking-widest">{product.brand}</p>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{product.name}</h3>
                  <div className="text-xs text-blue-200/50 flex flex-wrap gap-x-3">
                    <span>{product.skinType}</span>
                    <span>•</span>
                    <span>{product.concern}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <span className="font-bold text-white text-xl">Rs. {product.price.toLocaleString()}</span>
                  <button className="px-5 py-2 bg-electric-blue/20 hover:bg-electric-blue text-white text-sm font-bold rounded-lg transition-all duration-300 border border-electric-blue/30">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WelcomePopup />
    </main>
  );
}
