"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ChatModal from "@/components/ChatModal";
import { fetchWithRetries } from "@/lib/fetchWithRetries";

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
  const [detectedConcern, setDetectedConcern] = useState<string | null>(null);
  const [isSleepMode, setIsSleepMode] = useState(false);

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
      setDetectedConcern(null);
      setRecommendedProducts([]);
      setIsSleepMode(false);

      const sleepTimer = setTimeout(() => {
        setIsSleepMode(true);
      }, 6000);

      try {
        const formData = new FormData();
        formData.append('file', file);
        let response = null;
        try {
          response = await fetchWithRetries('https://azzivone-api.onrender.com/predict', { method: 'POST', body: formData }, 4, 900);
        } catch (err) {
          setDetectedConcern('Our specialist is preparing your report — please try again in a few seconds.');
          setRecommendedProducts([]);
          return;
        }
        const data = await response.json();
        
        if (data.detected_concern) {
          setDetectedConcern(data.detected_concern);
        } else {
          setDetectedConcern("System successfully analyzed your skin.");
        }

        if (data.recommended_products && Array.isArray(data.recommended_products)) {
          setRecommendedProducts(data.recommended_products);
        } else {
          setRecommendedProducts([]);
        }
      } catch (error) {
        console.error("AI Analysis failed:", error);
        setDetectedConcern("Analysis service is currently unavailable. Please try again.");
      } finally {
        clearTimeout(sleepTimer);
        setIsScanning(false);
        setScanComplete(true);
      }
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
    setDetectedConcern(null);
    setIsSleepMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-card px-8 py-4 flex justify-between items-center top-0 border-b border-gray-100">
        <div className="text-2xl font-bold tracking-widest text-azzivone-green">
          AZZIVONE
        </div>
        <div className="space-x-8 text-sm font-medium text-gray-600">
          <button onClick={handleAiCardClick} className="hover:text-azzivone-gold transition-colors block md:inline uppercase">ASK AI</button>
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

      {isModalOpen && (
        <ChatModal onClose={closeModal} />
      )}
    </main>
  );
}
