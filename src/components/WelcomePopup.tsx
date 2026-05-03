"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Show popup immediately for "first thing" experience
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => clearTimeout(timer);
  }, []);

  const initializePlayer = () => {
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player("welcome-video", {
        events: {
          onStateChange: (event: any) => {
            // event.data === 0 means video ended
            if (event.data === 0) {
              setVideoEnded(true);
            }
          },
        },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-azzivone-navy/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="glass-container max-w-2xl w-full rounded-[2rem] overflow-hidden relative border border-white/20 shadow-2xl shadow-electric-blue/10"
          >
            {/* Close Button - Only show before video ends or if submitted */}
            {(!videoEnded || submitted) && (
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="flex flex-col">
              {/* Video Section */}
              <div className={`relative aspect-video w-full bg-black transition-all duration-700 ${videoEnded ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
                <iframe
                  id="welcome-video"
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/6Ysyr4cUO7c?enablejsapi=1&autoplay=1&mute=0"
                  title="Azzivone Intro"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Form Section */}
              <motion.div 
                className="p-8 md:p-10"
                layout
              >
                {!videoEnded ? (
                  <div className="text-center space-y-4">
                    <span className="text-electric-blue font-bold tracking-[0.4em] text-[10px] uppercase italic animate-pulse">Now Showing</span>
                    <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-white">Experience the Future</h2>
                    <p className="text-blue-200/60 text-sm italic">Watch how Azzivone is redefining skincare in Pakistan.</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {!submitted ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl md:text-3xl font-bold text-white font-montserrat">How was the experience?</h2>
                          <p className="text-blue-200/60 text-sm">Please leave your rating and thoughts below.</p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-4 py-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`text-4xl transition-all duration-300 ${rating >= star ? "text-yellow-400 scale-125 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-white/10 hover:text-white/40"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like the most?"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm focus:border-electric-blue/50 focus:outline-none transition-all placeholder:text-white/10 h-32 resize-none"
                            required
                          ></textarea>
                        </div>

                        <button 
                          type="submit"
                          disabled={rating === 0}
                          className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all duration-500 ${rating > 0 ? "glow-button text-white" : "bg-white/5 text-white/10 cursor-not-allowed"}`}
                        >
                          Submit Feedback
                        </button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-8 text-center space-y-6"
                      >
                        <div className="flex justify-center">
                          <div className="w-20 h-20 bg-electric-blue/10 rounded-full flex items-center justify-center border border-electric-blue/30 relative">
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 bg-electric-blue/20 rounded-full animate-ping"
                            />
                            <svg className="w-10 h-10 text-electric-blue z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-white font-montserrat">Feedback Received!</h3>
                          <p className="text-blue-200/60 max-w-sm mx-auto font-light">Thank you for being part of the Azzivone journey. Enjoy the marketplace!</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
