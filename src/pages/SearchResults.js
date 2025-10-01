import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchPackages } from "../api/travelApi";
import PackageCard from "../components/PackageCard";
import { motion } from "framer-motion";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery().get("q") || "";
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({ maxPrice: 50000, duration: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const data = await searchPackages(query);
      setResults(data);
      setLoading(false);
    }
    fetchResults();
  }, [query]);

  const filteredResults = results.filter((pkg) => {
    const withinPrice = pkg.price <= filters.maxPrice;
    const durationMatch =
      !filters.duration || pkg.duration.includes(filters.duration);
    return withinPrice && durationMatch;
  });

  return (
    <div className="search-page">
      <header className="search-header">
        <h1>Results for: "{query}"</h1>
        <div className="filters">
          <label>
            Max Price ₹
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Duration
            <select
              value={filters.duration || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  duration: e.target.value || null,
                })
              }
            >
              <option value="">Any</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
            </select>
          </label>
        </div>
      </header>

      {loading ? (
        <p>Searching...</p>
      ) : filteredResults.length > 0 ? (
        <motion.div
          className="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {filteredResults.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </motion.div>
      ) : (
        <p>No matching packages found 😢</p>
      )}
    </div>
  );
}
