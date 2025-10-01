import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Navbar with brand, compact search, responsive menu, profile placeholder,
 * keyboard-accessible focus-ring, and small UX features (recent searches)
 *
 * Note: keeps logic local so it remains a single-file component for easier editing.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  // keep a tiny recent searches in-memory (could be replaced with localStorage)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("recentSearches");
      if (raw) setRecent(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  function onSearchNavigate(q) {
    // store recent
    const n = q && q.trim();
    if (!n) return;
    const next = [n, ...recent.filter(r => r !== n)].slice(0, 6);
    setRecent(next);
    try { window.localStorage.setItem("recentSearches", JSON.stringify(next)); } catch {}
    navigate(`/search?q=${encodeURIComponent(n)}`);
  }

  return (
    <header
      className={`navbar ${isScrolled ? "nav-elevated" : ""}`}
      role="banner"
      aria-label="Top navigation"
    >
      <div className="nav-left" onClick={() => navigate("/")} tabIndex={0} role="button" aria-label="Go to home">
        <div className="brand-wrap">
          <h1 className="brand">OnMyWay <span aria-hidden>✈️</span></h1>
          <p className="tagline">Pack. Go. Repeat.</p>
        </div>
      </div>

      <div className="nav-center" style={{ flex: 1, maxWidth: 640 }}>
        {/* Compact search in navbar: clicking a suggestion will call onSearchNavigate */}
        <SearchBar compact onNavigate={onSearchNavigate} />
        {/* recent list (keyboard accessible) */}
        <div className="recent-shortcut" aria-hidden>
          {recent.length > 0 && (
            <div className="recent-pill">
              <strong>Recent:</strong>
              {recent.slice(0, 3).map((r, i) => (
                <button key={i} className="recent-btn" onClick={() => onSearchNavigate(r)} title={`Search ${r}`}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="nav-right" aria-label="Primary">
        <div className="desktop-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Explore</Link>
          <a href="#contact" onClick={(e) => e.preventDefault()} className="nav-link">Contact</a>
        </div>

        <div className="profile-area" ref={menuRef}>
          <button
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="profile-btn"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span className="avatar" aria-hidden>👤</span>
            <span className="sr-only">Open user menu</span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="profile-pop"
                role="menu"
                aria-label="User menu"
              >
                <button role="menuitem" className="pop-item" onClick={() => { setMenuOpen(false); navigate("/profile"); }}>
                  Profile
                </button>
                <button role="menuitem" className="pop-item" onClick={() => { setMenuOpen(false); navigate("/bookings"); }}>
                  My Bookings
                </button>
                <hr />
                <button role="menuitem" className="pop-item" onClick={() => { setMenuOpen(false); alert("Demo: sign out"); }}>
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* mobile menu toggle */}
          <button
            className="hamburger"
            aria-label="Toggle menu"
            aria-pressed={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            <span aria-hidden>{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      {/* mobile slide-out menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            className="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            aria-hidden={!menuOpen}
          >
            <div className="drawer-content">
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/search" onClick={() => setMenuOpen(false)}>Explore</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
              <hr />
              <div className="drawer-footer muted">© {new Date().getFullYear()} OnMyWay</div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* small styles for keyboard-only users */}
      <style>{`
        .sr-only { position: absolute !important; width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
      `}</style>
    </header>
  );
}

