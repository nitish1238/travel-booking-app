import React, { useMemo, useState } from "react";

/**
 * BookingForm - richer booking form with:
 * - client-side validation
 * - price calculations, promo code support (simple)
 * - accessibility and keyboard handling
 *
 * Props:
 *  - pkg: required package object
 *  - onConfirm: function(booking) called when booking is confirmed
 */
export default function BookingForm({ pkg, onConfirm }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [notes, setNotes] = useState("");
  const [promo, setPromo] = useState("");
  const [applying, setApplying] = useState(false);
  const [promoOk, setPromoOk] = useState(null); // null|true|false
  const [errors, setErrors] = useState({});

  // compute base amounts
  const subtotal = useMemo(() => (pkg.price || 0) * travellers, [pkg.price, travellers]);
  const discount = useMemo(() => {
    if (promoOk === true) {
      return Math.min(2500, Math.round(subtotal * 0.12)); // max cap
    }
    return 0;
  }, [promoOk, subtotal]);
  const tax = Math.round((subtotal - discount) * 0.05); // 5% tax stub
  const total = subtotal - discount + tax;

  function validate() {
    const errs = {};
    if (!name || name.trim().length < 2) errs.name = "Enter your full name";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!travellers || travellers < 1) errs.travellers = "At least 1 traveller";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function applyPromo(e) {
    e.preventDefault();
    const code = (promo || "").trim().toUpperCase();
    setApplying(true);
    setTimeout(() => {
      // demo-only promo logic
      if (code === "TRAVEL10" || code === "WELCOME") {
        setPromoOk(true);
      } else {
        setPromoOk(false);
      }
      setApplying(false);
    }, 600);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const booking = {
      id: `BK${Date.now()}`,
      packageId: pkg.id,
      name: name.trim(),
      email: email.trim(),
      travellers,
      notes,
      subtotal,
      discount,
      tax,
      total,
      promo: promoOk ? promo.toUpperCase() : null,
      createdAt: new Date().toISOString()
    };
    // optimistic UI: persist and call parent
    try {
      const prev = JSON.parse(localStorage.getItem("bookings") || "[]");
      localStorage.setItem("bookings", JSON.stringify([booking, ...prev]));
    } catch {}
    if (typeof onConfirm === "function") onConfirm(booking);
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} aria-label="Booking form">
      <h2>Book: {pkg.name}</h2>
      <p className="muted">{pkg.location} • {pkg.duration}</p>

      <label>
        Full name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "err-name" : undefined}
          required
        />
        {errors.name && <div id="err-name" className="error small">{errors.name}</div>}
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-email" : undefined}
          required
        />
        {errors.email && <div id="err-email" className="error small">{errors.email}</div>}
      </label>

      <label>
        Travellers
        <input
          type="number"
          min="1"
          max="20"
          value={travellers}
          onChange={(e) => setTravellers(Number(e.target.value || 1))}
          aria-invalid={!!errors.travellers}
        />
        {errors.travellers && <div className="error small">{errors.travellers}</div>}
      </label>

      <label>
        Notes (optional)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        <input placeholder="Promo code (optional)" value={promo} onChange={(e) => { setPromo(e.target.value); setPromoOk(null); }} />
        <button className="btn-outline" onClick={applyPromo} disabled={applying || !promo}>
          {applying ? "Applying…" : "Apply"}
        </button>
        {promoOk === true && <small className="success">Promo applied ✓</small>}
        {promoOk === false && <small className="error">Invalid code</small>}
      </div>

      <div className="booking-summary" style={{ marginTop: 12 }}>
        <div>
          <div className="muted small">Subtotal</div>
          <div>₹{subtotal}</div>
          <div className="muted small">Discount</div>
          <div>- ₹{discount}</div>
          <div className="muted small">Taxes & fees</div>
          <div>₹{tax}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted small">Total</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>₹{total}</div>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: 14 }}>
        <button type="submit" className="btn">Confirm Booking</button>
        <button type="button" className="btn-outline" onClick={() => { setName(""); setEmail(""); setTravellers(2); setNotes(""); setPromo(""); setPromoOk(null); }}>
          Reset
        </button>
      </div>

      <style>{`
        .error{ color:#b91c1c; margin-top:6px }
        .success{ color:#065f46; margin-left:8px }
        .booking-summary div { margin-bottom: 6px }
      `}</style>
    </form>
  );
}

