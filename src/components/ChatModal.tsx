"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWithRetries } from "@/lib/fetchWithRetries";
import ProductRecommendations from "./ProductRecommendations";

type AnswerMap = { [key: string]: string };

const QUESTIONS = [
  {
    key: "skinType",
    q: "How would you describe your skin type?",
    options: ["Oily", "Dry", "Combination", "Normal"],
  },
  { key: "allergies", q: "Do you have any known skin allergies?", options: ["No", "Yes - fragrance", "Yes - preservatives", "Unsure"] },
  { key: "goal", q: "What is your primary skin goal?", options: ["Brightening", "Anti-aging", "Acne control"] },
  { key: "sun", q: "How often are you exposed to direct sunlight?", options: ["Daily", "Occasionally", "Rarely"] },
];

export default function ChatModal({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{sender: string; text: string}>>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatRef.current) {
      // scroll to bottom
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages, isAssistantTyping]);

  const handlePick = (option: string) => {
    const key = QUESTIONS[step].key;
    setAnswers((s) => ({ ...s, [key]: option }));
    if (step < QUESTIONS.length - 1) setStep((p) => p + 1);
    else handleFinish();
  };

  // Interactive assistant generator (local rule-based, can be replaced with real AI integration)
  const generateAssistantReply = async (userMessage: string) => {
    const lc = userMessage.toLowerCase();
    let reply = "";
    if (lc.includes('night') || lc.includes('use at night') || lc.includes('retinol')) {
      reply = "Generally, some active ingredients (like retinol) are recommended for nighttime use. If you're using strong exfoliants, introduce them gradually and patch-test.";
    } else if (lc.includes('sensitive') || lc.includes('allergy') || lc.includes('safe')) {
      reply = "We recommend patch testing new products and choosing gentle formulations. From your analysis, we suggest focusing on soothing and fragrance-free options. Avoid known allergens.";
    } else if (lc.includes('how often') || lc.includes('frequency')) {
      reply = "Use targeted actives 2–3 times per week to start, then increase as tolerated. Daily steps should include a gentle cleanser, active serum if suitable, moisturizer, and sunscreen in the morning.";
    } else if (lc.includes('routine') || lc.includes('order')) {
      const names = (recommendedProducts || []).slice(0,3).map(p => p.name).join(', ');
      reply = `A simple order: cleanse → treat (${names || 'serum'}) → hydrate → protect (sunscreen). Apply lighter textures first and layer heavier creams last.`;
    } else {
      const st = report?.profile?.skinType || 'your skin type';
      reply = `Based on your analysis (${st}), I recommend products that target ${((report?.concerns||[]).slice(0,3)).join(', ') || 'hydration and balance'}. Feel free to ask about any specific product.`;
    }

    if (recommendedProducts && recommendedProducts.length) {
      reply += ` Recommended picks include: ${recommendedProducts.slice(0,3).map(p=>p.name).join('; ')}.`;
    }
    await new Promise(r => setTimeout(r, 700 + Math.random()*500));
    return reply;
  }

  const handleChatSubmit = async (text: string) => {
    if (!text?.trim()) return;
    setChatMessages(m => [...m, { sender: 'user', text }]);
    setIsAssistantTyping(true);
    const assistantReply = await generateAssistantReply(text);
    setChatMessages(m => [...m, { sender: 'assistant', text: assistantReply }]);
    setIsAssistantTyping(false);
  }

  const handleFinish = async () => {
    setAnalyzing(true);
    // Show analyzing animation for at least 900ms while calling backend
    try {
      const payload = new FormData();
      if (imageFile) payload.append("image", imageFile);
      payload.append("answers", JSON.stringify(answers));
      let data = null;
      let res = null;
      try {
        res = await fetchWithRetries("https://azzivone-api.onrender.com/predict", { method: "POST", body: payload }, 4, 900);
      } catch (err) {
        // backend might be sleeping — show specialist message
        setReport({ profile: { skinType: answers.skinType || 'Unknown' }, concerns: ['Service temporarily sleeping'], advice: 'Our specialist is preparing your report. Please try again in a few seconds.' });
        setAnalyzing(false);
        return;
      }
      try { data = await res.json(); } catch(e){ data = null; }
      // If backend returns nothing or fails, synthesize a report locally
      if (!data || !data.report) {
        data = {
          report: {
            profile: {
              skinType: answers.skinType || "Unknown",
              exposure: answers.sun || "Unknown",
            },
            concerns: ["Dehydration", "Uneven tone"],
            advice: "Use a gentle vitamin C in the morning, sunscreen daily, and a retinol at night (gradual).",
            matchTags: [answers.goal || "Brightening"],
          },
        };
      }
      // small delay for UX
      await new Promise((r) => setTimeout(r, 900));
      setReport(data.report || data);
      // initialize chat context and fetch recommended products for context
      try {
        const pRes = await fetch('/products.json');
        const pData = await pRes.json();
        const tags = (data.report?.matchTags || []).map((t: string) => t.toLowerCase());
        const concerns = (data.report?.concerns || []).map((c: string) => c.toLowerCase());
        const match = pData.filter((p: any) => {
          const c = (p.concern || '').toLowerCase();
          const s = (p.skinType || '').toLowerCase();
          return tags.some((t: string) => c.includes(t) || s.includes(t)) || concerns.some((t: string) => c.includes(t) || s.includes(t));
        });
        setRecommendedProducts(match.length ? match : pData.slice(0,6));
      } catch (e) { setRecommendedProducts([]); }
    } catch (err) {
      setReport({ profile: { skinType: answers.skinType }, concerns: ["Unable to analyze (network)"], advice: "Please try again later." });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="glass-container p-8 w-full max-w-2xl mx-4 rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-2xl font-bold font-montserrat text-white tracking-wide">AI Skin Analysis</h3>
          <button
            className="text-blue-300 hover:text-white transition-colors"
            onClick={() => { setOpen(false); onClose?.(); }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!imageFile && !report && (
          <div className="mt-8">
            <p className="text-blue-100/80 mb-6">Start by uploading a clear photo of your face for our AI to analyze.</p>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 hover:border-electric-blue/40 transition-colors group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f) setImageFile(f);
              }} />
              <div className="w-16 h-16 rounded-full bg-electric-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <button className="px-6 py-2 bg-electric-blue/20 text-white font-semibold rounded-full border border-electric-blue/30 transition-all">Upload Photo</button>
            </div>
          </div>
        )}

        {imageFile && !report && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative w-32 h-32">
                <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-cover rounded-2xl border-2 border-electric-blue/30" />
                <div className="absolute -bottom-2 -right-2 bg-electric-blue p-1 rounded-full border-2 border-azzivone-navy">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-4">Step {step + 1} of {QUESTIONS.length}</p>
                <div className="mb-6 text-xl font-bold text-white">{QUESTIONS[step].q}</div>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <button key={opt} onClick={() => handlePick(opt)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-electric-blue/20 hover:border-electric-blue/40 transition-all text-sm font-medium">{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="mt-12 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-t-2 border-electric-blue animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full bg-electric-blue/20 animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">Analyzing Skin Data</div>
              <div className="text-blue-200/60">Our medical-grade AI is processing your specific concerns...</div>
            </div>
          </div>
        )}

        {report && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <div className="text-xs text-blue-300 font-bold uppercase mb-1">Skin Type</div>
                   <div className="text-white font-bold">{report.profile?.skinType || 'Unknown'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <div className="text-xs text-blue-300 font-bold uppercase mb-1">Exposure</div>
                   <div className="text-white font-bold">{report.profile?.exposure || 'Unknown'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
                  Identified Concerns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(report.concerns || []).map((c: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-electric-blue/10 border border-electric-blue/20 rounded-full text-blue-100 text-sm">{c}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">Expert Advice</h4>
                <div className="bg-electric-blue/10 border-l-4 border-electric-blue p-4 rounded-r-2xl text-blue-100/90 italic leading-relaxed">
                   "{report.advice}"
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button className="flex-1 glow-button py-3 rounded-xl font-bold text-white">
                  Get Routine
                </button>
                <button 
                  className="px-6 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                  onClick={() => { setReport(null); setImageFile(null); setStep(0); setAnswers({}); }}
                >
                  Reset
                </button>
              </div>

              <div className="pt-8 border-t border-white/10">
                <ProductRecommendations profile={report} />
              </div>

              <div className="pt-8 border-t border-white/10">
                <h5 className="text-lg font-bold text-white mb-4">Interactive Consultant</h5>
                <div ref={chatRef} className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.length === 0 && (
                    <div className="text-sm text-blue-200/50 italic text-center py-4">
                      Ask any question about your personalized routine...
                    </div>
                  )}
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${m.sender === 'assistant' ? 'bg-white/10 text-white' : 'bg-electric-blue text-white'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isAssistantTyping && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2 bg-white/5 rounded-2xl text-xs text-blue-300 animate-pulse">
                        Azzivone Specialist is typing...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); const q = (f.get('q') as string) || ''; (e.currentTarget as HTMLFormElement).reset(); handleChatSubmit(q); }} className="flex gap-2">
                  <input name="q" placeholder="Ask a question..." className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-electric-blue/50 transition-colors" />
                  <button type="submit" className="p-3 bg-electric-blue rounded-xl text-white hover:bg-electric-blue/80 transition-colors shadow-lg shadow-electric-blue/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
