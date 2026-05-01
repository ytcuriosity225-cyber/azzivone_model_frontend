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
        className="glass-card p-6 w-full max-w-2xl mx-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Analyze Skin</h3>
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => { setOpen(false); onClose?.(); }}
            >
              Close
            </button>
          </div>
        </div>

        {!imageFile && !report && (
          <div className="mt-6">
            <p className="text-sm text-gray-700">Start by uploading a clear photo of your face.</p>
            <div className="mt-4 flex items-center gap-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f) setImageFile(f);
              }} />
              <button className="glassy-pill" onClick={() => fileRef.current?.click()}>Upload Photo</button>
              <span className="text-sm text-gray-500">or drag & drop (coming soon)</span>
            </div>
          </div>
        )}

        {imageFile && !report && (
          <div className="mt-6">
            <div className="flex gap-6 items-start">
              <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-28 h-28 object-cover rounded-md" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">We will ask a few quick questions to personalize the analysis.</p>
                <div className="mt-4">
                  <div className="mb-3 text-gray-600">{QUESTIONS[step].q}</div>
                  <div className="flex flex-wrap gap-3">
                    {QUESTIONS[step].options.map((opt) => (
                      <button key={opt} onClick={() => handlePick(opt)} className="glassy-pill">{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">Question {step + 1} of {QUESTIONS.length}</div>
              </div>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="mt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 analyzing-spinner animate-spin"></div>
            <div>
              <div className="text-lg font-medium">Analyzing...</div>
              <div className="text-sm text-gray-500">Our AI is preparing a detailed skin report.</div>
            </div>
          </div>
        )}

        {report && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="bg-white/60 glass-card p-4">
              <h4 className="text-lg font-semibold">Your Skin Profile</h4>
              <div className="text-sm text-gray-700 mt-2">Skin Type: {report.profile?.skinType || 'Unknown'}</div>
              <div className="text-sm text-gray-700">Sun Exposure: {report.profile?.exposure || 'Unknown'}</div>

              <h4 className="mt-4 text-lg font-semibold">Identified Concerns</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                {(report.concerns || []).map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>

              <h4 className="mt-4 text-lg font-semibold">Expert Advice</h4>
              <p className="text-sm text-gray-700 mt-2">{report.advice}</p>

              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 rounded-md bg-amber-400 text-amber-900 font-semibold shadow-md" onClick={() => {/* show recommendations below */}}>
                  View Recommended Routine
                </button>
                <button className="px-4 py-2 rounded-md border" onClick={() => { setReport(null); setImageFile(null); setStep(0); setAnswers({}); }}>
                  Start Over
                </button>
              </div>

              <div className="mt-6">
                <ProductRecommendations profile={report} />
              </div>

              {/* Interactive Skin Consultant Chat */}
              <div className="mt-6">
                <h5 className="text-md font-semibold mb-2">Interactive Skin Consultant</h5>
                <div ref={chatRef} className="border rounded-xl p-3 bg-white/60 glass-card max-h-56 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="text-sm text-gray-600">Ask a question about your routine or products, e.g., "Can I use this at night?"</div>
                  )}
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`my-2 flex ${m.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`px-3 py-2 max-w-[78%] ${m.sender === 'assistant' ? 'glass-card' : 'bg-white/90 border'} rounded-xl`}>{m.text}</div>
                    </div>
                  ))}
                  {isAssistantTyping && (
                    <div className="my-2 flex justify-start">
                      <div className="px-3 py-2 glass-card rounded-xl text-sm text-gray-600">Azzivone Specialist is typing…</div>
                    </div>
                  )}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); const q = (f.get('q') as string) || ''; (e.currentTarget as HTMLFormElement).reset(); handleChatSubmit(q); }} className="mt-3 flex gap-3">
                  <input name="q" placeholder="Ask the specialist…" className="flex-1 px-4 py-2 rounded-full border bg-white/70 focus:outline-none" />
                  <button type="submit" className="px-4 py-2 bg-azzivone-gold text-white rounded-full">Send</button>
                </form>
              </div>

            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
