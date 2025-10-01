import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPackages, getPackages } from "../api/travelApi";

/**
 * SearchBar - expanded variant with:
 * - debounce
 * - keyboard navigation for suggestions
 * - optional "compact" mode used in navbar
 * - small analytics hook (local)
 *
 * props:
 *  - compact: boolean (smaller input)
 *  - onNavigate: optional callback invoked when navigation occurs (for parent to store recent)
 */
export default function SearchBar({ compact = false, onNavigate }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // debounce + fetch
  useEffect(() => {
    let mounted = true;
    if (!query) {
      // show top popular items
      setLoading(true);
      getPackages().then(all => {
        if (!mounted) return;
        setSuggestions(all.slice(0, 6));
        setLoading(false);
        setShowSuggestions(true);
      });
      return () => { mounted = false; };
    }

    setLoading(true);
    const t = setTimeout(() => {
      searchPackages(query).then(res => {
        if (!mounted) return;
        setSuggestions(res.slice(0, 8));
        setLoading(false);
        setShowSuggestions(true);
      }).catch(() => {
        if (!mounted) return;
        setLoading(false);
        setSuggestions([]);
        setShowSuggestions(false);
      });
    }, 180);

    return () => { mounted = false; clearTimeout(t); };
  }, [query]);

  // keyboard nav
  function handleKey(e) {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const s = suggestions[activeIndex];
      if (s) selectSuggestion(s);
    }
  }

  function selectSuggestion(s) {
    const q = s.name || s.location || s;
    setQuery("");
    setShowSuggestions(false);
    setActiveIndex(-1);
    if (typeof onNavigate === "function") onNavigate(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function onSubmit(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setShowSuggestions(false);
    if (typeof onNavigate === "function") onNavigate(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
  }

  // click outside to hide suggestions
  useEffect(() => {
    function onClick(ev) {
      if (!listRef.current) return;
      if (!listRef.current.contains(ev.target) && ev.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const compactClass = compact ? "search-compact" : "";

  return (
    <div className={`searchbar ${compactClass}`} style={{ position: "relative" }}>
      <form onSubmit={onSubmit} className="search-form" role="search" aria-label="Search destinations">
        <label htmlFor="site-search" className="sr-only">Search</label>
        <input
          id="site-search"
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onKeyDown={handleKey}
          placeholder="Search destinations, activities, tags..."
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
          autoComplete="off"
        />
        <button type="submit" className="btn-search" aria-label="Search">🔍</button>
      </form>

      <div ref={listRef} id="search-suggestions" role="listbox" aria-label="Search suggestions">
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, i) => {
              const label = s.name || s;
              return (
                <li
                  key={s.id || i}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`suggestion ${i === activeIndex ? "active" : ""}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => selectSuggestion(s)}
                >
                  <div className="s-left">
                    <strong>{label}</strong>
                    <div className="muted small">{s.location}</div>
                  </div>
                  <div className="s-right">
                    <small className="muted">₹{s.price}</small>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {showSuggestions && !loading && suggestions.length === 0 && (
          <div className="suggestions empty">No suggestions — try broader terms like "beach" or "adventure".</div>
        )}

        {loading && <div className="suggestions empty">Searching…</div>}
      </div>

      <style>{`
        .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
        .suggestions ul{ list-style:none;margin:8px 0 0;padding:8px;border-radius:10px;background:white;box-shadow: 0 6px 18px rgba(12,12,18,0.06) }
        .suggestion{ display:flex; justify-content:space-between; padding:10px; border-radius:8px; cursor:pointer }
        .suggestion.active{ background:#f1f8f8 }
      `}</style>
    </div>
  );
}

