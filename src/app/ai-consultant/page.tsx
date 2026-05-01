"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithRetries } from "@/lib/fetchWithRetries";
import ProductRecommendations from "@/components/ProductRecommendations";

const QUESTIONS = [
  { key: "skinType", q: "How would you describe your skin type?", options: ["Oily", "Dry", "Combination", "Normal"] },
  { key: "tone", q: "What is your primary skin concern today?", options: ["Acne", "Dark Spots", "Wrinkles", "Dullness"] },
  { key: "sensitivity", q: "Is your skin sensitive to new products?", options: ["Highly Sensitive", "Somewhat", "Not at all", "Unsure"] },
  { key: "routine", q: "How many steps are in your current routine?", options: ["0-1 (Basic)", "2-3 (Standard)", "4+ (Advance)"] },
];

type Message = {
  id: string;
  sender: "user" | "bot";
  type: "text" | "image" | "questions" | "analysis" | "report";
  content?: string;
  imageUrl?: string;
  options?: string[];
  data?: any;
};

export default function AiConsultantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      type: "text",
      content: "Welcome to Azzivone AI Console. I am your advanced dermatological assistant. Please upload a clear photo of your skin to begin the medical-grade analysis.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1: waiting for image, 0-3: questions
  const [answers, setAnswers] = useState<any>({});
  const [userImage, setUserImage] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(file);
      const imageUrl = URL.createObjectURL(file);
      addMessage({ sender: "user", type: "image", imageUrl });
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentStep(0);
        addMessage({ 
          sender: "bot", 
          type: "questions", 
          content: QUESTIONS[0].q, 
          options: QUESTIONS[0].options 
        });
      }, 1000);
    }
  };

  const handleOptionClick = (option: string) => {
    const question = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [question.key]: option };
    setAnswers(newAnswers);
    
    addMessage({ sender: "user", type: "text", content: option });
    
    if (currentStep < QUESTIONS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({ 
          sender: "bot", 
          type: "questions", 
          content: QUESTIONS[nextStep].q, 
          options: QUESTIONS[nextStep].options 
        });
      }, 800);
    } else {
      performAnalysis(newAnswers);
    }
  };

  const performAnalysis = async (finalAnswers: any) => {
    setCurrentStep(-2); // Analyzing state
    setIsTyping(true);
    addMessage({ sender: "bot", type: "analysis", content: "Initializing neural engines... Analyzing surface texture and pigmentation patterns." });

    try {
      const formData = new FormData();
      if (userImage) formData.append("image", userImage);
      formData.append("answers", JSON.stringify(finalAnswers));

      const response = await fetchWithRetries("https://azzivone-api.onrender.com/predict", {
        method: "POST",
        body: formData,
      }, 3, 1000);

      const data = await response.json();
      
      setIsTyping(false);
      addMessage({
        sender: "bot",
        type: "report",
        data: data.report || {
          profile: { skinType: finalAnswers.skinType, exposure: "Standard" },
          concerns: [finalAnswers.tone, "Early signs of oxidative stress"],
          advice: "Maintain a consistent hydration barrier. Use a broad-spectrum SPF daily and consider integrating our Vitamin C serum in the morning.",
        }
      });
      
      setTimeout(() => {
        addMessage({
          sender: "bot",
          type: "text",
          content: "Analysis complete. You can now ask me any specific questions about your routine or the recommended products."
        });
      }, 500);

    } catch (error) {
      setIsTyping(false);
      addMessage({ sender: "bot", type: "text", content: "I encountered a minor data synchronization error. However, based on your inputs, I recommend focusing on hydration and barrier repair." });
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText("");
    addMessage({ sender: "user", type: "text", content: text });

    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      let reply = "That's a great question. Based on your profile, I'd suggest being consistent with the routine. Consistency is the key to medical-grade results.";
      if (text.toLowerCase().includes("night")) reply = "For your nighttime routine, focus on repair. Cleanse thoroughly to remove environmental pollutants before applying your active serums.";
      if (text.toLowerCase().includes("sun")) reply = "Sun protection is non-negotiable. Even indoors, UV rays can impact skin health. Apply SPF 30+ every morning.";
      
      addMessage({ sender: "bot", type: "text", content: reply });
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-azzivone-navy overflow-hidden font-sans">
      {/* Sidebar - Sessions */}
      <aside className="w-80 border-r border-white/10 flex-col hidden lg:flex bg-black/20 backdrop-blur-xl shrink-0">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold tracking-[0.3em] text-white block mb-8">AZZIVONE</Link>
          <button onClick={() => window.location.reload()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-all mb-8 text-sm">
            <svg className="w-5 h-5 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </button>
          
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Recent History</div>
            <div className="space-y-2">
              <div className="px-4 py-3 rounded-lg bg-electric-blue/10 border border-electric-blue/30 text-white text-sm flex items-center justify-between">
                <span>Dermatology Scan #012</span>
                <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/10 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
             <Link href="/" className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </Link>
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-white font-bold text-sm md:text-base tracking-wide">Live AI Consultant</span>
             </div>
          </div>
          <Link href="/" className="text-white text-xs font-bold uppercase tracking-widest hover:text-electric-blue transition-colors hidden sm:block">Exit</Link>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 scroll-smooth custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[90%] md:max-w-[85%] ${msg.sender === "user" ? "ml-auto" : ""}`}>
                    {msg.type === "text" && (
                      <div className={`p-4 rounded-2xl text-[13px] md:text-sm leading-relaxed ${msg.sender === "user" ? "bg-electric-blue text-white shadow-lg shadow-electric-blue/20" : "glass-container text-blue-100"}`}>
                        {msg.content}
                      </div>
                    )}

                    {msg.type === "image" && (
                      <div className="rounded-2xl overflow-hidden border-2 border-electric-blue/40 shadow-2xl">
                        <img src={msg.imageUrl} alt="Skin Upload" className="max-w-full sm:max-w-sm w-full object-cover" />
                      </div>
                    )}

                    {msg.type === "questions" && (
                      <div className="space-y-4">
                        <div className="glass-container p-4 rounded-2xl text-blue-100 text-[13px] md:text-sm">{msg.content}</div>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          {msg.options?.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleOptionClick(opt)}
                              className="px-3 py-2.5 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-electric-blue/20 hover:border-electric-blue/40 transition-all text-xs md:text-sm font-medium"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.type === "analysis" && (
                      <div className="flex items-center gap-4 glass-container p-4 md:p-6 rounded-2xl border border-electric-blue/20">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-t-electric-blue border-white/5 animate-spin"></div>
                        <div className="text-blue-100 text-[13px] md:text-sm italic">{msg.content}</div>
                      </div>
                    )}

                    {msg.type === "report" && (
                      <div className="space-y-6 md:space-y-8">
                        <div className="glass-container p-6 md:p-8 rounded-3xl border border-electric-blue/20">
                          <h4 className="text-lg md:text-xl font-bold text-white mb-6 font-montserrat">Dermatological Analysis Report</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
                             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[9px] text-blue-300 uppercase font-bold tracking-widest block mb-1">Profile</span>
                                <div className="text-white text-xs md:text-sm font-bold">{msg.data.profile.skinType} • {msg.data.profile.exposure}</div>
                             </div>
                             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[9px] text-blue-300 uppercase font-bold tracking-widest block mb-1">Status</span>
                                <div className="text-white text-xs md:text-sm font-bold text-green-400">Clinical Validated</div>
                             </div>
                          </div>
                          
                          <div className="space-y-4 mb-6 md:mb-8">
                            <span className="text-[10px] font-bold text-white/60">Detected Constraints:</span>
                            <div className="flex flex-wrap gap-2">
                              {msg.data.concerns.map((c: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-electric-blue/10 border border-electric-blue/20 rounded-full text-electric-blue text-[9px] font-bold uppercase tracking-wider">{c}</span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                             <span className="text-[10px] font-bold text-white/60">AI Specialist Advice:</span>
                             <div className="text-blue-100/80 text-[13px] md:text-sm leading-relaxed border-l-2 border-electric-blue pl-4 py-1 italic">
                                {msg.data.advice}
                             </div>
                          </div>
                        </div>

                        <ProductRecommendations profile={msg.data} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="glass-container px-5 py-3 md:px-6 md:py-4 rounded-2xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-azzivone-navy to-transparent relative z-30 shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3 glass-container p-1 md:p-2 rounded-[1.5rem] md:rounded-[2rem] border-white/10 shadow-2xl focus-within:border-electric-blue/30 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 md:p-4 text-blue-300 hover:text-white hover:bg-white/5 rounded-full transition-all group"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={currentStep >= 0}
            />

            <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentStep >= 0 ? "Analying..." : "Message Consultant..."}
                disabled={currentStep >= 0}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 py-3 md:py-4 px-2 text-[13px] md:text-sm"
              />
              <button 
                type="submit"
                className={`p-3 md:p-4 rounded-full transition-all ${inputText.trim() ? "text-electric-blue hover:bg-electric-blue/10" : "text-white/10"}`}
                disabled={!inputText.trim() || currentStep >= 0}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
          <div className="text-[8px] md:text-[10px] text-center mt-3 text-white/20 uppercase tracking-[0.2em] font-bold">Neural Engine v4.0.1</div>
        </div>
      </main>
    </div>
  );
}
