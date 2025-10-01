import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * PackageCard - rich card used across the app.
 * - supports wishlist (localStorage)
 * - shows tags and quick actions
 * - accessible button labels
 * - expandable details
 * - multiple images carousel
 */

export default function PackageCard({ pkg, compact = false }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [wish, setWish] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("wishlist") || "[]");
      return s.includes(pkg.id);
    } catch {
      return false;
    }
  });

  const [currentImg, setCurrentImg] = useState(0);

  function toggleWish(e) {
    e.stopPropagation();
    const next = !wish;
    setWish(next);
    try {
      const prev = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const updated = next
        ? [...new Set([...(prev || []), pkg.id])]
        : (prev || []).filter(id => id !== pkg.id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
    } catch {}
  }

  function openBooking(e) {
    e.stopPropagation();
    navigate(`/booking?id=${pkg.id}`, { state: { pkg } });
  }

  function prevImage(e) {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? pkg.images.length - 1 : prev - 1));
  }

  function nextImage(e) {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === pkg.images.length - 1 ? 0 : prev + 1));
  }

  return (
    <motion.article
      className={`package-card ${compact ? "card-compact" : ""}`}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -6, boxShadow: "0 12px 36px rgba(12,12,18,0.12)" }}
      transition={{ type: "spring", damping: 16, stiffness: 120 }}
      onClick={() => setExpanded(s => !s)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") setExpanded(s => !s); }}
      aria-expanded={expanded}
    >
      {/* Image Carousel */}
      <div className="card-media-wrapper">
        <div
          className="card-media"
          style={{ backgroundImage: `url(${pkg.images[currentImg] || pkg.image})` }}
          aria-hidden
        />
        {pkg.images?.length > 1 && (
          <>
            <button className="prev-btn" onClick={prevImage} aria-label="Previous image">‹</button>
            <button className="next-btn" onClick={nextImage} aria-label="Next image">›</button>
          </>
        )}
      </div>

      <div className="card-body">
        <div className="card-head">
          <h3>{pkg.name}</h3>
          <div className="card-actions">
            <button
              aria-pressed={wish}
              onClick={toggleWish}
              className="icon-btn"
              title={wish ? "Remove from wishlist" : "Add to wishlist"}
            >
              {wish ? "♥" : "♡"}
            </button>
          </div>
        </div>

        <p className="muted small">{pkg.location} • {pkg.duration}</p>

        <div className="tag-row" aria-hidden>
          {pkg.tags?.slice(0,4).map((t) => <span key={t} className="tag">{t}</span>)}
        </div>

        <p className="desc" aria-live="polite">{pkg.description}</p>

        <div className="card-footer">
          <div>
            <strong>₹{pkg.price}</strong>
            <div className="muted small">per package</div>
          </div>

          <div className="cta-row">
            <button
              className="btn-outline"
              onClick={(e) => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(pkg.location)}`); }}
            >
              Explore
            </button>
            <button className="btn" onClick={openBooking}>Book Now</button>
          </div>
        </div>

        {/* expandable details */}
        <motion.div
          layout
          initial={{ height: 0, opacity: 0 }}
          animate={expanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="expand"
          aria-hidden={!expanded}
        >
          {expanded && (
            <div className="expanded-body">
              <h4>What's included</h4>
              <ul>
                <li>Accommodation (as described)</li>
                <li>Daily breakfast</li>
                <li>Airport transfers (select packages)</li>
                <li>Guided tours & local experiences</li>
              </ul>

              <h4>Why this trip?</h4>
              <p className="muted small">
                A curated experience tailored to the destination — vetted hotels and local partners, with flexible cancellation on select packages.
              </p>

              <div style={{marginTop:12}}>
                <small className="muted">Last updated: {new Date().toLocaleDateString()}</small>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        .icon-btn{ background:transparent;border:none;font-size:1.05rem;cursor:pointer;padding:6px }
        .tag{ display:inline-block;background:#eef7f7;padding:6px 8px;border-radius:999px;margin-right:8px;font-size:0.8rem;color:#0b7285 }
        .expand{ overflow:hidden }
        .expanded-body{ padding-top:12px;border-top:1px dashed #eef2f5;margin-top:12px }
        .card-media-wrapper{ position:relative; overflow:hidden; border-radius:8px; height:180px; }
        .card-media{ background-size:cover; background-position:center; width:100%; height:100%; transition:0.3s }
        .prev-btn, .next-btn{ position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.3); color:white; border:none; font-size:1.5rem; width:30px; height:30px; cursor:pointer; border-radius:50%; }
        .prev-btn{ left:8px; }
        .next-btn{ right:8px; }
      `}</style>
    </motion.article>
  );
}

