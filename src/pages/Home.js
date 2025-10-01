import React, { useEffect, useState } from "react";
import { getPackages } from "../api/travelApi";
import PackageCard from "../components/PackageCard";
import SearchBar from "../components/SearchBar";
import { motion } from "framer-motion";

export default function Home() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlight, setHighlight] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getPackages();
      setPackages(data);
      setHighlight(data[Math.floor(Math.random() * data.length)]);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <motion.section
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <h1>Discover Your Next Adventure 🌍</h1>
          <p>Find amazing destinations, curated packages, and the best travel deals.</p>
          <SearchBar />
        </div>
      </motion.section>

      {/* Highlight Section */}
      {highlight && (
        <motion.section
          className="highlight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2>🌟 Featured Destination</h2>
          <PackageCard pkg={highlight} />
        </motion.section>
      )}

      {/* All Packages */}
      <section className="packages">
        <h2>Popular Packages</h2>
        {loading ? (
          <p>Loading packages...</p>
        ) : (
          <div className="grid">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <motion.section
        className="testimonials"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2>What Travelers Say</h2>
        <div className="testimonial-list">
          <blockquote>
            “Booking my Kerala trip was effortless. Highly recommended!” – Aditi
          </blockquote>
          <blockquote>
            “Best adventure deals for Manali, had a great trek.” – Rahul
          </blockquote>
        </div>
      </motion.section>
    </div>
  );
}

