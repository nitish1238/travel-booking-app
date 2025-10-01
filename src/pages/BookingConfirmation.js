import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import { recommendSimilar } from "../api/travelApi";
import PackageCard from "../components/PackageCard";
import { motion } from "framer-motion";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function BookingConfirmation() {
  const query = useQuery();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const statePkg = window.history.state?.usr?.pkg;
    if (statePkg) {
      setPkg(statePkg);
      fetchRecommendations(statePkg.id);
    }
  }, []);

  async function fetchRecommendations(id) {
    const recs = await recommendSimilar(id);
    setRecommendations(recs);
  }

  function handleConfirm(booking) {
    setConfirmedBooking(booking);
  }

  if (!pkg) return <p>No package selected.</p>;

  return (
    <div className="booking-page">
      {!confirmedBooking ? (
        <BookingForm pkg={pkg} onConfirm={handleConfirm} />
      ) : (
        <motion.section
          className="confirmation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1>🎉 Booking Confirmed!</h1>
          <p>Thank you {confirmedBooking.name}, your booking is successful.</p>
          <p>
            Package: <strong>{pkg.name}</strong> ({pkg.duration})
          </p>
          <p>Total Paid: ₹{confirmedBooking.total}</p>
          <button className="btn" onClick={() => navigate("/")}>
            Back to Home
          </button>

          <section className="recommendations">
            <h2>You may also like</h2>
            <div className="grid">
              {recommendations.map((r) => (
                <PackageCard key={r.id} pkg={r} />
              ))}
            </div>
          </section>
        </motion.section>
      )}
    </div>
  );
}

