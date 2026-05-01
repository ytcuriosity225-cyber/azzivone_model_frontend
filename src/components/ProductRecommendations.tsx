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
    <div>
      <h5 className="text-md font-semibold">Recommended Products</h5>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="glass-card p-3">
            <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-contain" />
            <div className="mt-2">
              <div className="font-medium text-sm">{p.name}</div>
              <div className="text-xs text-gray-600">{p.brand} • {p.category}</div>
              <div className="mt-2 text-sm font-semibold">PKR {p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
