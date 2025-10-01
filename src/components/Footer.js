import React, { useEffect, useState } from "react";

/**
 * Footer component with small newsletter form, links, social icons,
 * and accessibility-friendly markup.
 *
 * Simple local validation and a small success microcopy.
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "err"
  const [year, setYear] = useState(new Date().getFullYear());
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowBackTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function validateEmail(e) {
    // lightweight validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(e).toLowerCase());
  }

  function subscribe(ev) {
    ev.preventDefault();
    if (!validateEmail(email)) {
      setStatus("err");
      return;
    }
    // pretend to send to an API
    setTimeout(() => {
      setStatus("ok");
      try {
        const stored = JSON.parse(localStorage.getItem("newsletter") || "[]");
        localStorage.setItem("newsletter", JSON.stringify([...stored, email]));
      } catch {}
      setEmail("");
      setTimeout(() => setStatus(null), 3500);
    }, 600);
  }

  function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-left">
        <strong>OnMyWay</strong>
        <p className="muted small">Make your next trip effortless. Discover, compare & book.</p>
        <div className="links-row">
          <a href="#about" onClick={(e)=>e.preventDefault()}>About</a>
          <a href="#careers" onClick={(e)=>e.preventDefault()}>Careers</a>
          <a href="#help" onClick={(e)=>e.preventDefault()}>Help</a>
        </div>
      </div>

      <div className="footer-mid">
        <form onSubmit={subscribe} className="newsletter" aria-label="Subscribe to newsletter">
          <label htmlFor="newsletter-email" className="muted">Stay updated</label>
          <div style={{display:"flex", gap:8, marginTop:8}}>
            <input
              id="newsletter-email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@domain.com"
              aria-invalid={status === "err"}
            />
            <button type="submit" className="btn">Subscribe</button>
          </div>
          {status === "ok" && <div role="status" className="small success">Subscribed — check your inbox.</div>}
          {status === "err" && <div role="alert" className="small error">Please enter a valid email.</div>}
        </form>
      </div>

      <div className="footer-right">
        <div className="socials" aria-hidden>
          <span title="Twitter">🐦</span>
          <span title="Instagram">📸</span>
          <span title="Facebook">📘</span>
        </div>
        <small className="muted">© {year} OnMyWay</small>
      </div>

      {showBackTop && (
        <button className="back-top" onClick={backToTop} aria-label="Back to top">
          ↑
        </button>
      )}

      <style>{`
        .newsletter input { padding:8px;border-radius:8px;border:1px solid #e6edf0 }
        .small { font-size:0.86rem }
        .success { color: #065f46; margin-top:6px }
        .error { color: #b91c1c; margin-top:6px }
        .back-top{ position:fixed; right:18px; bottom:18px;border-radius:10px;padding:8px 10px;border:none;background:#0ea5a4;color:white; box-shadow: 0 6px 18px rgba(0,0,0,0.12); cursor:pointer}
      `}</style>
    </footer>
  );
}

