"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setScanComplete(false);
      setIsScanning(true);

      // --- Fast API Integration Example ---
      // try {
      //   const formData = new FormData();
      //   formData.append('file', file);
      //   const response = await fetch('http://localhost:8000/analyze', {
      //     method: 'POST',
      //     body: formData,
      //   });
      //   const data = await response.json();
      //   // Assume data returns suggested product IDs
      //   const recommendations = products.filter(p => data.suggested_ids.includes(p.id));
      //   setRecommendedProducts(recommendations);
      // } catch (error) {
      //   console.error("AI Analysis failed:", error);
      // } finally {
      //   setIsScanning(false);
      //   setScanComplete(true);
      // }

      // Simulate AI analysis delay for demo purposes
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
        // Mock recommendation: just pick first 3 products for display
        setRecommendedProducts(products.slice(0, 3));
      }, 3000);
    }
  };

  const handleAiCardClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setIsScanning(false);
    setScanComplete(false);
    setRecommendedProducts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-card px-8 py-4 flex justify-between items-center top-0 border-b border-gray-100">
        <div className="text-2xl font-bold tracking-widest text-azzivone-green">
          AZZIVONE
        </div>
        <div className="space-x-8 text-sm font-medium text-gray-600">
          <a href="#hero" className="hover:text-azzivone-gold transition-colors block md:inline">HOME</a>
          <a href="#marketplace" className="hover:text-azzivone-gold transition-colors block md:inline">MARKETPLACE</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen pt-24 px-8 pb-16 flex flex-col justify-center items-center bg-[url('https://images.unsplash.com/photo-1556228578-831e50529944?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative z-10 text-center max-w-3xl mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-azzivone-green mb-6 tracking-tight">Clinical Luxury</h1>
          <p className="text-xl text-gray-800 font-medium">Experience personalized skincare driven by advanced AI analysis and premium formulations.</p>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* AI Card */}
          <div 
            onClick={handleAiCardClick}
            className="glass-card hover:bg-white/80 p-8 rounded-3xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="h-16 w-16 rounded-full bg-azzivone-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-azzivone-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-azzivone-green mb-3">Analyze Skin with AI</h2>
            <p className="text-gray-600">Upload a selfie for an instant, medical-grade robotic analysis of your skin concerns.</p>
          </div>

          {/* Marketplace Card */}
          <a href="#marketplace" className="block glass-card hover:bg-white/80 p-8 rounded-3xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="h-16 w-16 rounded-full bg-azzivone-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-azzivone-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-azzivone-green mb-3">Explore Marketplace</h2>
            <p className="text-gray-600">Discover our curated collection of luxury skincare serums, cleansers, and treatments.</p>
          </a>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-24 px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-azzivone-green mb-4">Curated Collection</h2>
            <div className="w-24 h-1 bg-azzivone-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                <div className="relative h-64 w-full mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-contain" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-semibold text-azzivone-gold uppercase tracking-wider mb-2">{product.brand}</p>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <p>Ideal for: <span className="font-medium text-gray-700">{product.skinType}</span></p>
                    <p>Targets: <span className="font-medium text-gray-700">{product.concern}</span></p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="font-bold text-azzivone-green text-lg">Rs. {product.price.toLocaleString()}</span>
                  <button className="px-4 py-2 bg-azzivone-green text-white text-sm font-medium rounded-full hover:bg-[#003018] transition-colors shadow-lg shadow-azzivone-green/30">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-azzivone-green">AI Skin Analysis</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-grow flex flex-col">
              {!selectedImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-azzivone-gold transition-colors cursor-pointer bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 bg-azzivone-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-azzivone-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Upload your photo</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">Ensure good lighting and no makeup for the best clinical accuracy.</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload}
                  />
                </div>
              ) : (
                <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-black rounded-2xl overflow-hidden mb-8 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedImage} alt="Uploaded" className="object-cover w-full h-full opacity-90" />
                  
                  {isScanning && (
                    <>
                      <div className="absolute inset-0 bg-azzivone-green/20 mix-blend-overlay"></div>
                      <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-azzivone-gold/40 to-transparent animate-scan shadow-[0_4px_30px_rgba(212,175,55,0.5)] border-b-2 border-azzivone-gold"></div>
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full flex items-center">
                        <div className="w-2 h-2 rounded-full bg-azzivone-gold animate-pulse mr-2"></div>
                        <span className="text-white text-xs font-semibold tracking-wider">ANALYZING DERMIS...</span>
                      </div>
                    </>
                  )}

                  {scanComplete && (
                    <div className="absolute top-4 left-4 bg-azzivone-green/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center">
                      <svg className="w-3 h-3 text-white mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white text-xs font-semibold tracking-wider">ANALYSIS COMPLETE</span>
                    </div>
                  )}
                </div>
              )}

              {scanComplete && (
                <div className="animate-slide-up mt-4">
                  <h4 className="text-xl font-bold text-azzivone-green mb-6 text-center">Recommended Protocol</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {recommendedProducts.map((product) => (
                      <div key={`rec-${product.id}`} className="bg-white border text-center p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-24 w-full mb-3">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-contain" />
                        </div>
                        <p className="text-[10px] font-bold text-azzivone-gold uppercase mb-1">{product.brand}</p>
                        <h5 className="text-xs font-bold text-gray-900 line-clamp-2">{product.name}</h5>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <button onClick={closeModal} className="px-8 py-3 bg-azzivone-green text-white font-medium rounded-full hover:bg-[#003018] transition-colors shadow-lg shadow-azzivone-green/30">
                      View Protocol Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
