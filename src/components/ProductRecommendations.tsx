"use client";

import React, { useEffect, useState } from "react";

export default function ProductRecommendations({ profile }: { profile: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/products.json');
        const data = await res.json();
        // Simple matching logic based on report.matchTags or concerns
        const tags = (profile?.matchTags || []).map((t: string) => t.toLowerCase());
        const concerns = (profile?.concerns || []).map((c: string) => c.toLowerCase());
        const match = data.filter((p: any) => {
          const c = (p.concern || '').toLowerCase();
          const s = (p.skinType || '').toLowerCase();
          // If any tag or concern appears in product concern or skinType
          return tags.some((t: string) => c.includes(t) || s.includes(t)) || concerns.some((t: string) => c.includes(t) || s.includes(t));
        });
        // If nothing matched, fallback to gentle / popular
        setProducts(match.length ? match : data.slice(0, 6));
      } catch (err) {
        setProducts([]);
      } finally { setLoading(false); }
    }
    load();
  }, [profile]);

  if (loading) return <div className="text-sm text-gray-600">Loading recommended products…</div>;
  if (!products.length) return <div className="text-sm text-gray-600">No recommendations available.</div>;

  return (
    <div className="space-y-4">
      <h5 className="text-lg font-bold font-montserrat text-white">Recommended Products</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="glass-container p-4 rounded-2xl flex flex-col hover:border-electric-blue/40 transition-all group">
            <div className="relative h-40 w-full mb-4 rounded-xl overflow-hidden bg-white/5 p-2">
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-grow">
              <div className="text-xs font-bold text-electric-blue uppercase tracking-widest mb-1">{p.brand}</div>
              <div className="text-white font-bold text-sm line-clamp-1 mb-2">{p.name}</div>
              <div className="text-blue-100/50 text-xs">{p.category}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-white font-bold">Rs. {p.price.toLocaleString()}</div>
              <button className="px-3 py-1 bg-electric-blue/20 hover:bg-electric-blue text-white text-xs font-bold rounded-lg transition-all border border-electric-blue/30">
                Shop
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
