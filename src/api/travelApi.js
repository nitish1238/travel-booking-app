// src/api/travelApi.js
// Simple mock API to work with packages.json
import packages from "../data/packages.json";

/**
 * Get all travel packages.
 */
export async function getPackages() {
  return packages;
}

/**
 * Search travel packages by query.
 * It checks name, location, tags, and description.
 */
export async function searchPackages(query) {
  if (!query) return packages;

  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/);

  // Score packages based on query tokens
  const scored = packages.map((p) => {
    const text = `${p.name} ${p.location} ${p.tags.join(" ")} ${p.description}`.toLowerCase();
    let score = 0;

    tokens.forEach((t) => {
      if (text.includes(t)) score += 10; // full match
      if (t.length > 2 && text.split(/\W+/).some(w => w.startsWith(t))) score += 2; // partial match
    });

    return { pkg: p, score };
  });

  const filtered = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.pkg);

  // fallback if no results
  if (filtered.length === 0) {
    return packages.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Recommend similar packages based on tags + price similarity.
 */
export async function recommendSimilar(packageId, limit = 3) {
  const base = packages.find(p => p.id === Number(packageId));
  if (!base) return [];

  const scored = packages
    .filter(p => p.id !== base.id)
    .map(p => {
      const overlap = p.tags.filter(tag => base.tags.includes(tag)).length;
      const priceDiff = Math.abs(p.price - base.price);
      const priceScore = Math.max(0, 30 - Math.floor(priceDiff / 1000));
      const score = overlap * 20 + priceScore;
      return { pkg: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.pkg);

  return scored;
}
