import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/App.css";

// Lazy load pages for performance
const Home = lazy(() => import("./pages/Home"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));

/**
 * ErrorBoundary Component
 * Catches runtime errors and shows fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Error caught in ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <h2>Something went wrong 😢</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * App Component
 */
export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchQuery, selectedPackage]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          {/* Navbar */}
          <Navbar onSearch={(q) => setSearchQuery(q)} />

          {/* Routes with animation */}
          <main style={{ minHeight: "80vh" }}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center", marginTop: "3rem" }}>
                  <h3>Loading...</h3>
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <motion.div
                        key="home"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Home
                          searchQuery={searchQuery}
                          setSelectedPackage={setSelectedPackage}
                        />
                      </motion.div>
                    }
                  />

                  <Route
                    path="/search"
                    element={
                      <motion.div
                        key="search"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <SearchResults
                          searchQuery={searchQuery}
                          setSelectedPackage={setSelectedPackage}
                        />
                      </motion.div>
                    }
                  />

                  <Route
                    path="/booking-confirmation"
                    element={
                      <motion.div
                        key="booking"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <BookingConfirmation selectedPackage={selectedPackage} />
                      </motion.div>
                    }
                  />

                  {/* Redirect unknown routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}





