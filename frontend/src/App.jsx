import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:5000";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const typeIcon = (type) =>
  ({ Bus: "🚌", Train: "🚆", Flight: "✈️", Cab: "🚕", Hotel: "🏨" }[type] || "🚀");

const typeBadge = (type) =>
  ({ Bus: "badge-bus", Train: "badge-train", Flight: "badge-flight", Cab: "badge-cab", Hotel: "badge-hotel" }[type] || "");

const hotelIcon = (hotel) => {
  if (hotel?.image) return hotel.image;
  if (hotel?.stars >= 5) return "🏰";
  if (hotel?.stars === 4) return "🏨";
  return "🏢";
};

const stars = (n) => "⭐".repeat(Math.max(1, Math.min(5, n || 3)));

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP-LEVEL APPLICATION ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    const s = window.location.search.toLowerCase();
    return p.startsWith("/admin") || h.startsWith("#admin") || s.includes("admin=true");
  });

  useEffect(() => {
    const checkRoute = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      const s = window.location.search.toLowerCase();
      setIsAdminRoute(p.startsWith("/admin") || h.startsWith("#admin") || s.includes("admin=true"));
    };
    window.addEventListener("popstate", checkRoute);
    window.addEventListener("hashchange", checkRoute);
    return () => {
      window.removeEventListener("popstate", checkRoute);
      window.removeEventListener("hashchange", checkRoute);
    };
  }, []);

  // Separate Admin Interface (Completely isolated at /admin or #admin)
  if (isAdminRoute) {
    return (
      <AdminPortal
        onExit={() => {
          window.history.pushState(null, "", "/");
          window.location.hash = "";
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // Regular Customer Application (Zero admin presence)
  return <CustomerApp />;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGULAR CUSTOMER APPLICATION (Public User View)
// ─────────────────────────────────────────────────────────────────────────────
function CustomerApp() {
  const [page, setPage] = useState("home"); // home | bookings | auth
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("smarttrip_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [cities, setCities] = useState([]);
  const [prefill, setPrefill] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);

  // Save/clear user in localStorage
  const handleAuth = (u) => {
    setUser(u);
    if (u) {
      localStorage.setItem("smarttrip_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("smarttrip_user");
    }
    setPage("home");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smarttrip_user");
    setPage("home");
  };

  useEffect(() => {
    // Load platform stats
    fetch(`${API}/api/stats`)
      .then((r) => r.json())
      .then((d) => d.success && setStats(d.stats))
      .catch(() => {});

    // Load popular routes
    fetch(`${API}/api/popular-routes`)
      .then((r) => r.json())
      .then((d) => d.success && setPopularRoutes(d.routes || []))
      .catch(() => {});

    // Load Karnataka cities list for autocomplete
    fetch(`${API}/api/cities`)
      .then((r) => r.json())
      .then((d) => d.success && setCities(d.cities || []))
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      {/* City Autocomplete Datalist */}
      <datalist id="karnataka-cities">
        {cities.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* ── CUSTOMER NAVBAR (Strictly Public User Only) ── */}
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => setPage("home")}>
          <span className="logo-icon">✈️</span>
          <h2>Smart<span>Trip</span></h2>
        </div>
        <div className="navbar-links">
          <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>
            🏠 Home
          </button>
          <button className={`nav-btn ${page === "bookings" ? "active" : ""}`} onClick={() => setPage("bookings")}>
            📋 My Bookings
          </button>
          {user ? (
            <>
              <button className="nav-btn" style={{ color: "#fbbf24", fontWeight: 600 }}>
                👤 {user.name.split(" ")[0]}
              </button>
              <button className="nav-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-btn login-btn" onClick={() => setPage("auth")}>
              Login / Register
            </button>
          )}
        </div>
      </nav>

      {/* ── CUSTOMER PAGES ── */}
      {page === "home" && (
        <HomePage
          user={user}
          stats={stats}
          popularRoutes={popularRoutes}
          prefill={prefill}
          setPrefill={setPrefill}
          onTicketCreated={(ticket) => setViewTicket(ticket)}
        />
      )}
      {page === "bookings" && (
        <BookingsPage user={user} onViewTicket={(ticket) => setViewTicket(ticket)} />
      )}
      {page === "auth" && <AuthPage onAuth={handleAuth} />}

      {/* ── GLOBAL E-TICKET CONFIRMATION MODAL ── */}
      {viewTicket && (
        <ConfirmationModal booking={viewTicket} onClose={() => setViewTicket(null)} />
      )}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p>
          © 2026 <span>SmartTrip</span> — Transportation & Hotel Booking Platform
        </p>
        <p style={{ marginTop: 6, fontSize: 13, color: "#9ca3af" }}>
          Safe, reliable, and convenient travel and stay bookings across Karnataka
        </p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ user, stats, popularRoutes, prefill, setPrefill, onTicketCreated }) {
  const [activeTab, setActiveTab] = useState("transport");

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <h1>Your Complete <span>Travel & Stay Companion</span></h1>
        <p>Search & book Buses, Trains, Flights, Cabs and Hotels across Karnataka — all in one unified platform</p>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num">{stats.totalTransportOptions || 74}+</div>
            <div className="stat-label">Transport Options</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.totalHotels || 26}+</div>
            <div className="stat-label">Hotels Listed</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.totalCities || stats.cities?.length || 30}</div>
            <div className="stat-label">Cities Covered</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.totalBookings || 0}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Tabs */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "transport" ? "active" : ""}`}
            onClick={() => setActiveTab("transport")}
          >
            🚀 Transportation
          </button>
          <button
            className={`tab-btn ${activeTab === "hotels" ? "active" : ""}`}
            onClick={() => setActiveTab("hotels")}
          >
            🏨 Hotels & Stays
          </button>
        </div>

        {activeTab === "transport" && (
          <TransportSection
            user={user}
            prefill={prefill}
            onPrefillUsed={() => setPrefill(null)}
            onTicketCreated={onTicketCreated}
          />
        )}
        {activeTab === "hotels" && (
          <HotelsSection user={user} onTicketCreated={onTicketCreated} />
        )}

        {/* Popular Routes */}
        {popularRoutes.length > 0 && (
          <div className="popular-routes">
            <h3>✨ Popular Karnataka Routes</h3>
            <div className="routes-grid">
              {popularRoutes.map((r, i) => {
                const typesList = r.types || (r.topTransport ? [r.topTransport] : ["Bus"]);
                return (
                  <div
                    key={i}
                    className="route-chip"
                    onClick={() => {
                      setPrefill(r);
                      setActiveTab("transport");
                      window.scrollTo({ top: 320, behavior: "smooth" });
                    }}
                  >
                    <div className="route-arrow">{r.from} → {r.to}</div>
                    <div className="route-name">{r.from} to {r.to}</div>
                    <div className="route-types">
                      {typesList.map((t) => typeIcon(t)).join(" ")} {typesList.join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPORT SECTION
// ─────────────────────────────────────────────────────────────────────────────
function TransportSection({ user, prefill, onPrefillUsed, onTicketCreated }) {
  const [from, setFrom] = useState("Hassan");
  const [to, setTo] = useState("Bengaluru");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [transport, setTransport] = useState("All");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [sortBy, setSortBy] = useState("price-asc");
  const [amenityFilter, setAmenityFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  // Apply prefill from popular routes click
  useEffect(() => {
    if (prefill) {
      if (prefill.from) setFrom(prefill.from);
      if (prefill.to) setTo(prefill.to);
      if (prefill.types?.length) setTransport(prefill.types[0]);
      onPrefillUsed();
    }
  }, [prefill]);

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const search = async () => {
    if (!from.trim() || !to.trim() || !date) {
      setError("Please fill in From, To, and Travel Date.");
      return;
    }
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const modeParam = transport === "All" ? "" : transport;
      const res = await fetch(
        `${API}/api/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&transport=${encodeURIComponent(modeParam)}`
      );
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        if (!data.results || data.results.length === 0) {
          setError(`No options found directly from ${from} to ${to}. Try selecting "All" modes or choosing major hubs like Bengaluru/Mysuru/Hassan.`);
        }
      } else {
        setError("Search failed. Please try again.");
      }
    } catch {
      setError("Cannot connect to server. Ensure the backend server is running on port 5000.");
    }
    setLoading(false);
  };

  // Filter & Sort
  const processedResults = [...results]
    .filter((item) => {
      if (amenityFilter === "all") return true;
      return (item.amenities || []).some((a) => a.toLowerCase().includes(amenityFilter.toLowerCase()));
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating-desc") return b.rating - a.rating;
      if (sortBy === "dep-asc") return a.departure.localeCompare(b.departure);
      return 0;
    });

  return (
    <>
      <div className="search-card">
        <h3>🔍 Search Transportation Across Karnataka</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>From City</label>
            <input
              list="karnataka-cities"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g. Hassan"
            />
          </div>

          <div className="city-swap-container">
            <button className="swap-btn" type="button" title="Swap cities" onClick={swapCities}>
              ⇄
            </button>
          </div>

          <div className="form-group">
            <label>To City</label>
            <input
              list="karnataka-cities"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g. Bengaluru"
            />
          </div>

          <div className="form-group">
            <label>Travel Date</label>
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Transport Mode</label>
            <select value={transport} onChange={(e) => setTransport(e.target.value)}>
              <option value="All">🌟 All Modes</option>
              <option value="Bus">🚌 Bus</option>
              <option value="Train">🚆 Train</option>
              <option value="Flight">✈️ Flight</option>
              <option value="Cab">🚕 Cab</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={search} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Searching Schedules...
            </>
          ) : (
            "🔍 Search Availability"
          )}
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {results.length > 0 && (
        <div className="results-section">
          {/* Sorting & Filtering Toolbar */}
          <div className="filter-sort-bar">
            <div className="filter-pills">
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", alignSelf: "center", marginRight: 4 }}>
                Filter:
              </span>
              <button
                className={`filter-pill ${amenityFilter === "all" ? "active" : ""}`}
                onClick={() => setAmenityFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-pill ${amenityFilter === "ac" ? "active" : ""}`}
                onClick={() => setAmenityFilter("ac")}
              >
                ❄️ AC
              </button>
              <button
                className={`filter-pill ${amenityFilter === "sleeper" ? "active" : ""}`}
                onClick={() => setAmenityFilter("sleeper")}
              >
                🛏️ Sleeper
              </button>
              <button
                className={`filter-pill ${amenityFilter === "wifi" ? "active" : ""}`}
                onClick={() => setAmenityFilter("wifi")}
              >
                📶 WiFi
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="dep-asc">Earliest Departure</option>
                <option value="rating-desc">Highest Rating</option>
              </select>
            </div>
          </div>

          <div className="results-header">
            <h3>Available Travel Options</h3>
            <span className="results-count">
              {processedResults.length} option{processedResults.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {processedResults.map((item) => (
            <div className="transport-card" key={item.id}>
              <div className="card-left">
                <span className={`card-type-badge ${typeBadge(item.type)}`}>
                  {typeIcon(item.type)} {item.type}
                </span>
                <div className="card-name">{item.name}</div>
                <div className="card-route">
                  {item.from} → {item.to}
                </div>
                <div className="card-times">
                  ⏰ {item.departure} → {item.arrival} · ⏱ {item.duration}
                </div>
                <div className="card-amenities">
                  {(item.amenities || []).map((a) => (
                    <span key={a} className="amenity-tag">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card-right">
                <div className="card-rating">
                  {"⭐".repeat(Math.floor(item.rating || 4))} {item.rating}
                </div>
                <div className="card-price">₹{item.price.toLocaleString("en-IN")}</div>
                <div className="card-price-label">per passenger</div>
                <div className="card-seats">
                  🪑 {item.seats} seats available
                  {item.seats <= 5 && <span className="badge-low-seats">⚡ Fast Filling</span>}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedTransport({ ...item, travelDate: date })}
                >
                  Book Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking & Payment Flow Modal */}
      {selectedTransport && (
        <BookingModal
          item={selectedTransport}
          user={user}
          onClose={() => setSelectedTransport(null)}
          onSuccess={(ticket) => {
            setSelectedTransport(null);
            onTicketCreated(ticket);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING & PAYMENT MODAL (Transport)
// ─────────────────────────────────────────────────────────────────────────────
function BookingModal({ item, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = Details, 2 = Payment
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bank, setBank] = useState("SBI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const baseFare = seats * item.price;
  const taxes = Math.round(baseFare * 0.05); // 5% GST
  const grandTotal = baseFare + taxes;

  const goToPayment = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !seats) {
      setError("Please fill in passenger name, phone, email and seats.");
      return;
    }
    setError("");
    setStep(2);
  };

  const processBookingAndPayment = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create Booking
      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName: name,
          phone,
          email,
          seats: Number(seats),
          transportationId: item.id,
          travelDate: item.travelDate,
          userId: user?.id || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Booking creation failed.");
        setLoading(false);
        return;
      }

      const newBooking = data.booking;

      // 2. Process Simulated Payment
      const payRes = await fetch(`${API}/api/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: newBooking.bookingId,
          paymentMethod,
          amount: grandTotal,
          paymentDetails: {
            upiId: paymentMethod === "UPI" ? upiId || "user@okaxis" : null,
            bank: paymentMethod === "Net Banking" ? bank : null,
          },
        }),
      });
      const payData = await payRes.json();
      const finalizedBooking = payData.success && payData.booking ? payData.booking : newBooking;

      onSuccess(finalizedBooking);
    } catch {
      setError("Connection error while processing booking/payment. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2>{step === 1 ? "🎫 Book Transport Ticket" : "💳 Secure Payment Checkout"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Journey Summary Box */}
        <div className="booking-summary">
          <h4>{typeIcon(item.type)} {item.name}</h4>
          <p>📍 {item.from} → {item.to}</p>
          <p>⏰ Departure: {item.departure} | Arrival: {item.arrival} ({item.duration})</p>
          <p>📅 Travel Date: {formatDate(item.travelDate)}</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {step === 1 ? (
          /* STEP 1: TRAVELER DETAILS */
          <div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Passenger Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name of primary passenger" />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-ticket will be sent here" />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Number of Passengers / Seats</label>
              <input
                type="number"
                min="1"
                max={item.seats}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, Math.min(item.seats, Number(e.target.value))))}
              />
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Base Fare (₹{item.price} × {seats} seat{seats > 1 ? "s" : ""})</span>
                <span>₹{baseFare.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row">
                <span>GST & Service Charges (5%)</span>
                <span>₹{taxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row total">
                <span>Total Amount Due</span>
                <span style={{ color: "#4f46e5" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={goToPayment}>
              Proceed to Payment (₹{grandTotal.toLocaleString("en-IN")}) →
            </button>
          </div>
        ) : (
          /* STEP 2: PAYMENT METHOD */
          <div>
            <div className="payment-tabs">
              <button
                className={`payment-tab-btn ${paymentMethod === "UPI" ? "active" : ""}`}
                onClick={() => setPaymentMethod("UPI")}
              >
                📱 UPI / QR
              </button>
              <button
                className={`payment-tab-btn ${paymentMethod === "Card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Card")}
              >
                💳 Card
              </button>
              <button
                className={`payment-tab-btn ${paymentMethod === "Net Banking" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Net Banking")}
              >
                🏦 NetBanking
              </button>
              <button
                className={`payment-tab-btn ${paymentMethod === "Pay Later" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Pay Later")}
              >
                💵 On Board
              </button>
            </div>

            {paymentMethod === "UPI" && (
              <div className="payment-panel">
                <div className="qr-box">
                  <div className="qr-visual"></div>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Scan with GPay / PhonePe / Paytm</span>
                </div>
                <div className="form-group">
                  <label>Or Enter UPI ID</label>
                  <input
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "Card" && (
              <div className="payment-panel">
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label>Card Number</label>
                  <input
                    placeholder="4532 •••• •••• 8892"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-group">
                    <label>Expiry (MM/YY)</label>
                    <input
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      maxLength="3"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "Net Banking" && (
              <div className="payment-panel">
                <div className="form-group">
                  <label>Select Bank</label>
                  <select value={bank} onChange={(e) => setBank(e.target.value)}>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Karnataka Bank">Karnataka Bank</option>
                  </select>
                </div>
              </div>
            )}

            {paymentMethod === "Pay Later" && (
              <div className="payment-panel" style={{ textAlign: "center", padding: "20px 10px" }}>
                <span style={{ fontSize: 32 }}>💵</span>
                <p style={{ marginTop: 8, fontSize: 14, color: "#475569" }}>
                  You can pay <strong>₹{grandTotal.toLocaleString("en-IN")}</strong> in cash or card directly to the conductor/driver upon boarding.
                </p>
              </div>
            )}

            <div className="price-breakdown">
              <div className="price-row total">
                <span>Total Payable</span>
                <span style={{ color: "#059669" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={loading}>
                ← Back
              </button>
              <button
                className="btn btn-success"
                style={{ flex: 2 }}
                onClick={processBookingAndPayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Processing Payment...
                  </>
                ) : (
                  `Pay ₹${grandTotal.toLocaleString("en-IN")} & Confirm Ticket ✓`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOTEL SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HotelsSection({ user, onTicketCreated }) {
  const [city, setCity] = useState("Hassan");
  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [rooms, setRooms] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [sortBy, setSortBy] = useState("price-asc");
  const [starFilter, setStarFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const search = async () => {
    if (!city.trim() || !checkIn || !checkOut) {
      setError("Please fill City, Check-in and Check-out dates.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out date must be strictly after check-in date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/hotels?city=${encodeURIComponent(city.trim())}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}`
      );
      const data = await res.json();
      if (data.success) {
        const hotelList = data.results || data.hotels || [];
        setResults(hotelList);
        if (hotelList.length === 0) {
          setError(`No hotels found in "${city}". Try searching cities like Hassan, Bengaluru, Mysuru, Mangaluru, or Hubli.`);
        }
      } else {
        setError("Failed to search hotels.");
      }
    } catch {
      setError("Cannot connect to server. Ensure backend is running on port 5000.");
    }
    setLoading(false);
  };

  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
      : 1;

  // Filter & Sort
  const processedHotels = [...results]
    .filter((h) => {
      if (starFilter === "all") return true;
      return h.stars === Number(starFilter);
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.pricePerNight - b.pricePerNight;
      if (sortBy === "price-desc") return b.pricePerNight - a.pricePerNight;
      if (sortBy === "rating-desc") return b.rating - a.rating;
      if (sortBy === "stars-desc") return b.stars - a.stars;
      return 0;
    });

  return (
    <>
      <div className="search-card">
        <h3>🏨 Search Hotels Across Karnataka</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>City / Location</label>
            <input
              list="karnataka-cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Hassan, Bengaluru..."
            />
          </div>
          <div className="form-group">
            <label>Check-in Date</label>
            <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Check-out Date</label>
            <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Rooms Required</label>
            <input
              type="number"
              min="1"
              max="10"
              value={rooms}
              onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={search} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Searching Hotels...
            </>
          ) : (
            "🔍 Search Hotels"
          )}
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {results.length > 0 && (
        <div className="results-section">
          <div className="filter-sort-bar">
            <div className="filter-pills">
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", alignSelf: "center", marginRight: 4 }}>
                Stars:
              </span>
              <button className={`filter-pill ${starFilter === "all" ? "active" : ""}`} onClick={() => setStarFilter("all")}>
                All
              </button>
              <button className={`filter-pill ${starFilter === "5" ? "active" : ""}`} onClick={() => setStarFilter("5")}>
                5 ⭐
              </button>
              <button className={`filter-pill ${starFilter === "4" ? "active" : ""}`} onClick={() => setStarFilter("4")}>
                4 ⭐
              </button>
              <button className={`filter-pill ${starFilter === "3" ? "active" : ""}`} onClick={() => setStarFilter("3")}>
                3 ⭐
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Guest Rating</option>
                <option value="stars-desc">Star Rating</option>
              </select>
            </div>
          </div>

          <div className="results-header">
            <h3>Hotels in {city}</h3>
            <span className="results-count">
              {processedHotels.length} hotel{processedHotels.length !== 1 ? "s" : ""} found · {nights} night{nights !== 1 ? "s" : ""}
            </span>
          </div>

          {processedHotels.map((hotel) => (
            <div className="hotel-card" key={hotel.id}>
              <div className="hotel-image" style={{ fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {hotelIcon(hotel)}
              </div>
              <div className="hotel-info">
                <div className="card-type-badge badge-hotel">🏨 {hotel.stars}-Star Hotel</div>
                <div className="hotel-name">{hotel.name}</div>
                <div className="hotel-city">📍 {hotel.city}</div>
                <div className="hotel-stars">{stars(hotel.stars)} Luxury Stay</div>
                <div className="card-amenities">
                  {(hotel.amenities || []).map((a) => (
                    <span key={a} className="amenity-tag">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hotel-right">
                <div className="card-rating">⭐ {hotel.rating} / 5.0</div>
                <div className="hotel-price">₹{hotel.pricePerNight.toLocaleString("en-IN")}</div>
                <div className="hotel-price-label">per room / night</div>
                <div className="card-seats" style={{ marginBottom: 8 }}>
                  🛏️ {hotel.rooms} rooms available
                  {hotel.rooms <= 3 && <span className="badge-low-seats">⚡ Rare Find</span>}
                </div>
                <div style={{ marginBottom: 12, fontSize: 14, color: "#4f46e5", fontWeight: 700 }}>
                  Total: ₹{(hotel.pricePerNight * rooms * nights).toLocaleString("en-IN")} ({nights}N)
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedHotel({ ...hotel, checkIn, checkOut, rooms, nights })}
                >
                  Reserve Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hotel Reservation Modal */}
      {selectedHotel && (
        <HotelBookingModal
          hotel={selectedHotel}
          user={user}
          onClose={() => setSelectedHotel(null)}
          onSuccess={(ticket) => {
            setSelectedHotel(null);
            onTicketCreated(ticket);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOTEL BOOKING & PAYMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function HotelBookingModal({ hotel, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const basePrice = hotel.pricePerNight * hotel.rooms * hotel.nights;
  const taxes = Math.round(basePrice * 0.12); // 12% Hotel GST
  const grandTotal = basePrice + taxes;

  const goToPayment = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in primary guest name, phone and email.");
      return;
    }
    setError("");
    setStep(2);
  };

  const processReservation = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create Hotel Booking
      const res = await fetch(`${API}/api/hotel-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          phone,
          email,
          hotelId: hotel.id,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut,
          rooms: hotel.rooms,
          userId: user?.id || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Hotel reservation failed.");
        setLoading(false);
        return;
      }

      const newBooking = data.booking;

      // 2. Process Simulated Payment
      const payRes = await fetch(`${API}/api/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: newBooking.bookingId,
          paymentMethod,
          amount: grandTotal,
          paymentDetails: { upiId },
        }),
      });
      const payData = await payRes.json();
      const finalized = payData.success && payData.booking ? payData.booking : newBooking;

      onSuccess(finalized);
    } catch {
      setError("Connection error while securing reservation.");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2>{step === 1 ? "🏨 Hotel Reservation" : "💳 Secure Payment Checkout"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="booking-summary">
          <h4>{hotelIcon(hotel)} {hotel.name}</h4>
          <p>📍 {hotel.city} · {stars(hotel.stars)}</p>
          <p>📅 Check-in: {formatDate(hotel.checkIn)} → Check-out: {formatDate(hotel.checkOut)}</p>
          <p>🛏️ {hotel.rooms} room{hotel.rooms > 1 ? "s" : ""} · {hotel.nights} night{hotel.nights > 1 ? "s" : ""}</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {step === 1 ? (
          <div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Primary Guest Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name of guest" />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hotel voucher will be sent here" />
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Room Charges (₹{hotel.pricePerNight} × {hotel.rooms}R × {hotel.nights}N)</span>
                <span>₹{basePrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row">
                <span>Hospitality GST & Luxury Tax (12%)</span>
                <span>₹{taxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row total">
                <span>Total Amount Due</span>
                <span style={{ color: "#4f46e5" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={goToPayment}>
              Proceed to Payment (₹{grandTotal.toLocaleString("en-IN")}) →
            </button>
          </div>
        ) : (
          <div>
            <div className="payment-tabs">
              <button
                className={`payment-tab-btn ${paymentMethod === "UPI" ? "active" : ""}`}
                onClick={() => setPaymentMethod("UPI")}
              >
                📱 UPI / QR
              </button>
              <button
                className={`payment-tab-btn ${paymentMethod === "Card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Card")}
              >
                💳 Card
              </button>
              <button
                className={`payment-tab-btn ${paymentMethod === "Net Banking" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Net Banking")}
              >
                🏦 NetBanking
              </button>
              <button
                className={`payment-tab-btn ${paymentMethod === "Pay at Hotel" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Pay at Hotel")}
              >
                🏨 At Hotel
              </button>
            </div>

            {paymentMethod === "UPI" && (
              <div className="payment-panel">
                <div className="qr-box">
                  <div className="qr-visual"></div>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Scan with GPay / PhonePe / Paytm</span>
                </div>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    placeholder="user@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "Card" && (
              <div className="payment-panel">
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label>Card Number</label>
                  <input placeholder="4532 •••• •••• 1029" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-group">
                    <label>Expiry (MM/YY)</label>
                    <input placeholder="08/29" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="password" maxLength="3" placeholder="•••" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "Net Banking" && (
              <div className="payment-panel">
                <div className="form-group">
                  <label>Select Bank</label>
                  <select>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Canara Bank</option>
                  </select>
                </div>
              </div>
            )}

            {paymentMethod === "Pay at Hotel" && (
              <div className="payment-panel" style={{ textAlign: "center", padding: "20px 10px" }}>
                <span style={{ fontSize: 32 }}>🏨</span>
                <p style={{ marginTop: 8, fontSize: 14, color: "#475569" }}>
                  Pay <strong>₹{grandTotal.toLocaleString("en-IN")}</strong> at the hotel front desk during check-in.
                </p>
              </div>
            )}

            <div className="price-breakdown">
              <div className="price-row total">
                <span>Total Payable</span>
                <span style={{ color: "#059669" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={loading}>
                ← Back
              </button>
              <button
                className="btn btn-success"
                style={{ flex: 2 }}
                onClick={processReservation}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Confirming...
                  </>
                ) : (
                  `Pay ₹${grandTotal.toLocaleString("en-IN")} & Confirm ✓`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMATION MODAL (Authentic Printable E-Ticket)
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmationModal({ booking, onClose }) {
  const isHotel = booking.type === "hotel";
  const hotelObj = booking.hotel || booking.hotelDetails || {};
  const transportObj = booking.transportation || booking.transportDetails || {};

  const printTicket = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="confirmation-card">
        <div className="confirm-icon">🎉</div>
        <div className="confirm-title">Booking Confirmed!</div>
        <div className="confirm-subtitle">
          Your official SmartTrip {isHotel ? "hotel voucher" : "e-ticket"} is ready.
        </div>

        <div className="ticket-print-wrapper">
          <div className="ticket-top-banner">
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>
                Smart<span style={{ color: "#4f46e5" }}>Trip</span> {isHotel ? "Hotel Voucher" : "E-Boarding Pass"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Official Verified Booking Voucher</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="ticket-pnr">{booking.bookingId}</div>
              <div className="ticket-stamp" style={{ marginTop: 4 }}>
                {booking.paymentStatus === "Paid" ? "PAID & VERIFIED" : "CONFIRMED"}
              </div>
            </div>
          </div>

          <div className="ticket-box" style={{ background: "transparent", padding: 0 }}>
            {isHotel ? (
              <>
                <div className="ticket-row">
                  <span className="label">Hotel Name</span>
                  <span className="value">{hotelIcon(hotelObj)} {hotelObj.name || "Karnataka Hotel"}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Location</span>
                  <span className="value">📍 {hotelObj.city || "Karnataka"}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Guest Name</span>
                  <span className="value">{booking.guestName}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Check-in</span>
                  <span className="value">{formatDate(booking.checkIn)}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Check-out</span>
                  <span className="value">{formatDate(booking.checkOut)}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Rooms & Nights</span>
                  <span className="value">{booking.rooms} Room(s) · {booking.nights} Night(s)</span>
                </div>
              </>
            ) : (
              <>
                <div className="ticket-row">
                  <span className="label">Passenger</span>
                  <span className="value">{booking.passengerName}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Route</span>
                  <span className="value">
                    {transportObj.from || "From"} ➔ {transportObj.to || "To"}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="label">Transport Service</span>
                  <span className="value">
                    {typeIcon(transportObj.type)} {transportObj.name || "KSRTC Service"}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="label">Timings</span>
                  <span className="value">
                    ⏰ {transportObj.departure || "Scheduled"} → {transportObj.arrival || "Estimated"}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="label">Travel Date</span>
                  <span className="value">📅 {formatDate(booking.travelDate)}</span>
                </div>
                <div className="ticket-row">
                  <span className="label">Reserved Seats</span>
                  <span className="value">{booking.seats} Seat(s)</span>
                </div>
              </>
            )}

            <div className="ticket-row">
              <span className="label">Payment Method</span>
              <span className="value">{booking.paymentMethod || "Online (Verified)"}</span>
            </div>
            {booking.paymentRef && (
              <div className="ticket-row">
                <span className="label">Payment Ref</span>
                <span className="value" style={{ fontFamily: "monospace", color: "#4f46e5" }}>
                  {booking.paymentRef}
                </span>
              </div>
            )}
            <div className="ticket-row">
              <span className="label">Total Paid</span>
              <span className="value" style={{ color: "#059669", fontSize: 18, fontWeight: 800 }}>
                ₹{booking.totalPrice?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="barcode-strip">
            <div className="barcode-lines"></div>
            <div className="barcode-text">{booking.bookingId} - SMARTTRIP - CONFIRMED</div>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          📧 E-ticket sent to <strong>{booking.email || "registered email"}</strong> · Keep this ID handy for travel.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={printTicket}>
            🖨️ Print Ticket / Save PDF
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
            Done ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function BookingsPage({ user, onViewTicket }) {
  const [email, setEmail] = useState(user?.email || "");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all | transport | hotel

  const fetchBookings = async (targetEmail) => {
    const e = targetEmail || email;
    if (!e.trim()) {
      setError("Please enter your email address to find bookings.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/bookings?email=${encodeURIComponent(e.trim())}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
        setSearched(true);
      } else {
        setError(data.message || "Failed to fetch bookings.");
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend server is running.");
    }
    setLoading(false);
  };

  // Auto-fetch if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      fetchBookings(user.email);
    }
  }, [user]);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Reserved seats/rooms will be released.")) {
      return;
    }
    try {
      const res = await fetch(`${API}/api/bookings/${bookingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === bookingId ? { ...b, status: "Cancelled" } : b))
        );
      } else {
        alert(data.message || "Cancellation failed.");
      }
    } catch {
      alert("Failed to connect to server for cancellation.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "transport") return b.type !== "hotel";
    if (activeFilter === "hotel") return b.type === "hotel";
    return true;
  });

  return (
    <div className="main-content">
      <div className="bookings-page">
        <h2>📋 My Bookings & E-Tickets</h2>
        <p className="subtitle">View, download tickets, or manage your transport and hotel reservations</p>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            className="filter-input"
            style={{ margin: 0, flex: 1, minWidth: 260 }}
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchBookings()}
          />
          <button className="btn btn-primary" onClick={() => fetchBookings()} disabled={loading}>
            {loading ? <span className="spinner"></span> : "🔍 Find Bookings"}
          </button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {searched && (
          <div className="filter-sort-bar">
            <div className="filter-pills">
              <button
                className={`filter-pill ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Bookings ({bookings.length})
              </button>
              <button
                className={`filter-pill ${activeFilter === "transport" ? "active" : ""}`}
                onClick={() => setActiveFilter("transport")}
              >
                🚀 Transport ({bookings.filter((b) => b.type !== "hotel").length})
              </button>
              <button
                className={`filter-pill ${activeFilter === "hotel" ? "active" : ""}`}
                onClick={() => setActiveFilter("hotel")}
              >
                🏨 Hotels ({bookings.filter((b) => b.type === "hotel").length})
              </button>
            </div>
          </div>
        )}

        {searched && filteredBookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No Bookings Found</h3>
            <p>No bookings found under {email}. Book your first Karnataka journey today!</p>
          </div>
        )}

        {filteredBookings.map((booking) => {
          const isHotel = booking.type === "hotel";
          const hotelObj = booking.hotel || booking.hotelDetails || {};
          const transportObj = booking.transportation || booking.transportDetails || {};

          return (
            <div
              key={booking.bookingId}
              className={`booking-history-card ${isHotel ? "hotel" : ""} ${
                booking.status === "Cancelled" ? "cancelled" : ""
              }`}
            >
              <div>
                <span className="booking-id">{booking.bookingId}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>
                  {booking.paymentRef ? `Ref: ${booking.paymentRef}` : ""}
                </span>
                <br />

                {isHotel ? (
                  <>
                    <strong style={{ fontSize: 16 }}>{hotelIcon(hotelObj)} {hotelObj.name || "Hotel Stay"}</strong>
                    <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0" }}>
                      📍 {hotelObj.city || "Karnataka"} · 🛏️ {booking.rooms} room{booking.rooms > 1 ? "s" : ""} · {booking.nights} night{booking.nights > 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 14, color: "#475569" }}>
                      📅 Check-in: {formatDate(booking.checkIn)} → Check-out: {formatDate(booking.checkOut)}
                    </p>
                  </>
                ) : (
                  <>
                    <strong style={{ fontSize: 16 }}>
                      {typeIcon(transportObj.type)} {transportObj.name || "Transport Booking"}
                    </strong>
                    <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0" }}>
                      📍 {transportObj.from || "From"} ➔ {transportObj.to || "To"} ({transportObj.type || "Bus"})
                    </p>
                    <p style={{ fontSize: 14, color: "#475569" }}>
                      📅 {formatDate(booking.travelDate)} · ⏰ {transportObj.departure || "On Time"} · 🪑 {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                    </p>
                  </>
                )}

                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  Booked on: {formatDate(booking.createdAt || booking.bookedAt)} · Primary Contact: {booking.passengerName || booking.guestName} ({booking.phone})
                </p>
              </div>

              <div style={{ textAlign: "right", minWidth: 160 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#4f46e5", marginBottom: 6 }}>
                  ₹{booking.totalPrice?.toLocaleString("en-IN")}
                </div>
                <div>
                  <span
                    className={`booking-status ${
                      booking.status === "Confirmed" ? "status-confirmed" : "status-cancelled"
                    }`}
                  >
                    {booking.status === "Confirmed" ? "✅ Confirmed" : "❌ Cancelled"}
                  </span>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "6px 12px", fontSize: 13 }}
                    onClick={() => onViewTicket(booking)}
                  >
                    🎫 View Ticket
                  </button>
                  {booking.status === "Confirmed" && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: "6px 12px", fontSize: 13 }}
                      onClick={() => cancelBooking(booking.bookingId)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PAGE (Login / Register)
// ─────────────────────────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = () => {
    setEmail("demo@smarttrip.com");
    setPassword("demo123");
    setError("");
  };

  const submit = async () => {
    if (mode === "register" && (!name.trim() || !phone.trim())) {
      setError("Please provide your Name and Phone Number to register.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Email and Password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const body = mode === "login" ? { email, password } : { name, email, phone, password };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onAuth(data.user);
      } else {
        setError(data.message || "Authentication failed.");
      }
    } catch {
      setError("Cannot connect to server. Ensure backend is running on port 5000.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode === "login" ? "👋 Welcome to SmartTrip" : "🚀 Create Your Account"}</h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to manage your bookings and access instant e-tickets."
            : "Register to unlock easy booking for buses, trains, flights, and hotels."}
        </p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {mode === "register" && (
          <>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
          </>
        )}

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@smarttrip.com"
          />
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {mode === "login" && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <button type="button" className="demo-fill-btn" onClick={fillDemo}>
              ⚡ One-Click Demo Login (demo@smarttrip.com)
            </button>
          </div>
        )}

        <button className="btn btn-primary btn-full" style={{ marginTop: 10 }} onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Please wait...
            </>
          ) : mode === "login" ? (
            "Sign In →"
          ) : (
            "Create Account →"
          )}
        </button>

        <div className="auth-toggle">
          {mode === "login" ? (
            <p>
              New to SmartTrip?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEDICATED SEPARATE ADMIN PORTAL
// (Completely isolated from Customer UI — accessed strictly via /admin or #admin)
// ─────────────────────────────────────────────────────────────────────────────
function AdminPortal({ onExit }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("smarttrip_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [viewTicket, setViewTicket] = useState(null);

  const handleAdminLogin = (adminData) => {
    setAdminUser(adminData);
    localStorage.setItem("smarttrip_admin_user", JSON.stringify(adminData));
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem("smarttrip_admin_user");
    localStorage.removeItem("smarttrip_admin_token");
  };

  if (!adminUser) {
    return (
      <AdminLoginScreen
        onLoginSuccess={handleAdminLogin}
        onBackToSite={onExit}
      />
    );
  }

  return (
    <div className="admin-portal-wrapper">
      {/* ── SEPARATE ADMIN TOPBAR ── */}
      <header className="admin-topbar">
        <div className="admin-brand">
          <span style={{ fontSize: 24 }}>🛡️</span>
          <h2>Smart<span>Trip</span></h2>
          <span className="admin-tag">ADMIN CONSOLE</span>
        </div>

        <div className="admin-topbar-actions">
          <div className="admin-user-pill">
            <span>● API Server: Online</span> ·
            <span>Operator: <strong>{adminUser.email}</strong></span>
          </div>
          <button className="btn btn-outline btn-sm" style={{ borderColor: "#64748b", color: "#e2e8f0" }} onClick={onExit}>
            🌐 View Public Site
          </button>
          <button className="admin-logout-btn" onClick={handleAdminLogout}>
            🚪 Sign Out
          </button>
        </div>
      </header>

      {/* ── ADMIN MANAGEMENT DASHBOARD ── */}
      <AdminDashboard onViewTicket={(ticket) => setViewTicket(ticket)} />

      {/* E-Ticket Modal for Admin Verification */}
      {viewTicket && (
        <ConfirmationModal booking={viewTicket} onClose={() => setViewTicket(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEDICATED ADMIN SECURITY LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AdminLoginScreen({ onLoginSuccess, onBackToSite }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitAdminAuth = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide administrator credentials.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) localStorage.setItem("smarttrip_admin_token", data.token);
        onLoginSuccess(data.admin);
      } else {
        setError(data.message || "Invalid administrative credentials.");
      }
    } catch {
      setError("Cannot reach API server. Ensure backend is running on port 5000.");
    }
    setLoading(false);
  };

  const fillAdminDemo = () => {
    setEmail("admin@smarttrip.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="admin-security-tag">
            🔒 Restricted Area • Authorized Personnel Only
          </div>
          <span style={{ fontSize: 44 }}>🛡️</span>
          <h2>SmartTrip Central Admin</h2>
          <p className="admin-subtitle">
            Enter authorized administrator credentials to manage fleet schedules, customer bookings, and platform properties.
          </p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        <form onSubmit={submitAdminAuth}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Admin ID / Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smarttrip.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Admin Security Key / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <button
              type="button"
              className="demo-fill-btn"
              style={{ background: "rgba(59, 130, 246, 0.15)", borderColor: "#3b82f6", color: "#60a5fa" }}
              onClick={fillAdminDemo}
            >
              🔑 Fill Admin Credentials (admin@smarttrip.com)
            </button>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Authenticate & Open Console →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={onBackToSite}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}
          >
            ← Return to Customer Website
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard({ onViewTicket }) {
  const [activeTab, setActiveTab] = useState("bookings"); // bookings | fleet | hotels | users
  const [bookings, setBookings] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [usersList, setUsersList] = useState([]);
  const [transportList, setTransportList] = useState([]);
  const [hotelsList, setHotelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddTransport, setShowAddTransport] = useState(false);
  const [showAddHotel, setShowAddHotel] = useState(false);

  // New transport form state
  const [newTrans, setNewTrans] = useState({
    type: "Bus",
    name: "",
    from: "Hassan",
    to: "Bengaluru",
    departure: "09:00",
    arrival: "12:30",
    duration: "3.5h",
    price: 350,
    seats: 40,
    amenities: "AC, WiFi, Charging Point"
  });

  // New hotel form state
  const [newHtl, setNewHtl] = useState({
    name: "",
    city: "Hassan",
    stars: 3,
    pricePerNight: 2000,
    rooms: 25,
    amenities: "WiFi, Restaurant, Parking, AC"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. All bookings & revenue
      const bRes = await fetch(`${API}/api/admin/bookings`);
      const bData = await bRes.json();
      if (bData.success) {
        setBookings(bData.bookings || []);
        setTotalRevenue(bData.totalRevenue || 0);
      }

      // 2. All users
      const uRes = await fetch(`${API}/api/admin/users`);
      const uData = await uRes.json();
      if (uData.success) {
        setUsersList(uData.users || []);
      }

      // 3. All transport options
      const tRes = await fetch(`${API}/api/search`);
      const tData = await tRes.json();
      if (tData.success) {
        setTransportList(tData.results || []);
      }

      // 4. All hotels
      const hRes = await fetch(`${API}/api/hotels`);
      const hData = await hRes.json();
      if (hData.success) {
        setHotelsList(hData.hotels || hData.results || []);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cancel booking action
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Cancel booking ${bookingId} and release reserved inventory?`)) return;
    try {
      const res = await fetch(`${API}/api/bookings/${bookingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === bookingId ? { ...b, status: "Cancelled" } : b))
        );
        fetchData();
      }
    } catch {
      alert("Failed to cancel booking.");
    }
  };

  // Add Transport Schedule
  const handleCreateTransport = async (e) => {
    e.preventDefault();
    if (!newTrans.name.trim() || !newTrans.from.trim() || !newTrans.to.trim() || !newTrans.price) {
      alert("Please fill all required transport fields.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/admin/transport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrans)
      });
      const data = await res.json();
      if (data.success) {
        alert("Transport schedule created successfully!");
        setShowAddTransport(false);
        setNewTrans({
          type: "Bus",
          name: "",
          from: "Hassan",
          to: "Bengaluru",
          departure: "09:00",
          arrival: "12:30",
          duration: "3.5h",
          price: 350,
          seats: 40,
          amenities: "AC, WiFi"
        });
        fetchData();
      } else {
        alert(data.message || "Failed to add transport.");
      }
    } catch {
      alert("Failed to connect to server.");
    }
  };

  // Delete Transport Schedule
  const handleDeleteTransport = async (id) => {
    if (!window.confirm(`Delete transport service ${id}?`)) return;
    try {
      const res = await fetch(`${API}/api/admin/transport/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTransportList((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      alert("Failed to delete transport.");
    }
  };

  // Add Hotel Property
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    if (!newHtl.name.trim() || !newHtl.city.trim() || !newHtl.pricePerNight) {
      alert("Please fill all required hotel fields.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/admin/hotels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHtl)
      });
      const data = await res.json();
      if (data.success) {
        alert("Hotel added successfully!");
        setShowAddHotel(false);
        setNewHtl({
          name: "",
          city: "Hassan",
          stars: 3,
          pricePerNight: 2000,
          rooms: 25,
          amenities: "WiFi, Restaurant, Parking, AC"
        });
        fetchData();
      } else {
        alert(data.message || "Failed to add hotel.");
      }
    } catch {
      alert("Failed to connect to server.");
    }
  };

  // Delete Hotel
  const handleDeleteHotel = async (id) => {
    if (!window.confirm(`Delete hotel ${id}?`)) return;
    try {
      const res = await fetch(`${API}/api/admin/hotels/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setHotelsList((prev) => prev.filter((h) => h.id !== id));
      }
    } catch {
      alert("Failed to delete hotel.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "confirmed") return b.status === "Confirmed";
    if (statusFilter === "cancelled") return b.status === "Cancelled";
    if (statusFilter === "transport") return b.type !== "hotel";
    if (statusFilter === "hotel") return b.type === "hotel";
    return true;
  });

  return (
    <div className="creator-dashboard">
      <div className="creator-header">
        <div>
          <h2>🛡️ SmartTrip Administrative Console</h2>
          <p style={{ color: "#64748b", marginTop: 4 }}>
            System-level control: real-time platform revenue, fleet route management, hotel inventory, and customer orders.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="creator-badge">⚡ Live Database Mode</span>
          <button className="btn btn-primary" onClick={fetchData} disabled={loading}>
            {loading ? <span className="spinner"></span> : "🔄 Refresh Console"}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card revenue">
          <div className="stat-title">Platform Revenue</div>
          <div className="stat-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="stat-sub">From confirmed bookings</div>
        </div>

        <div className="admin-stat-card bookings">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-sub">
            {bookings.filter((b) => b.status === "Confirmed").length} Confirmed · {bookings.filter((b) => b.status === "Cancelled").length} Cancelled
          </div>
        </div>

        <div className="admin-stat-card fleet">
          <div className="stat-title">Transport Fleet</div>
          <div className="stat-value">{transportList.length}</div>
          <div className="stat-sub">Buses, Trains, Flights, Cabs</div>
        </div>

        <div className="admin-stat-card hotels">
          <div className="stat-title">Hotel Network</div>
          <div className="stat-value">{hotelsList.length}</div>
          <div className="stat-sub">Across 15+ Karnataka cities</div>
        </div>

        <div className="admin-stat-card users">
          <div className="stat-title">Registered Users</div>
          <div className="stat-value">{usersList.length}</div>
          <div className="stat-sub">Customer accounts</div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="creator-tabs-bar">
        <button
          className={`creator-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          📋 Master Bookings Ledger ({bookings.length})
        </button>
        <button
          className={`creator-tab-btn ${activeTab === "fleet" ? "active" : ""}`}
          onClick={() => setActiveTab("fleet")}
        >
          🚀 Fleet & Routes ({transportList.length})
        </button>
        <button
          className={`creator-tab-btn ${activeTab === "hotels" ? "active" : ""}`}
          onClick={() => setActiveTab("hotels")}
        >
          🏨 Hotel Properties ({hotelsList.length})
        </button>
        <button
          className={`creator-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Registered Users ({usersList.length})
        </button>
      </div>

      {/* ── TAB 1: ALL CUSTOMER BOOKINGS ── */}
      {activeTab === "bookings" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h3>All Customer Bookings</h3>
            <div className="filter-pills">
              <button className={`filter-pill ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>
                All ({bookings.length})
              </button>
              <button className={`filter-pill ${statusFilter === "confirmed" ? "active" : ""}`} onClick={() => setStatusFilter("confirmed")}>
                ✅ Confirmed ({bookings.filter((b) => b.status === "Confirmed").length})
              </button>
              <button className={`filter-pill ${statusFilter === "cancelled" ? "active" : ""}`} onClick={() => setStatusFilter("cancelled")}>
                ❌ Cancelled ({bookings.filter((b) => b.status === "Cancelled").length})
              </button>
              <button className={`filter-pill ${statusFilter === "transport" ? "active" : ""}`} onClick={() => setStatusFilter("transport")}>
                🚀 Transport ({bookings.filter((b) => b.type !== "hotel").length})
              </button>
              <button className={`filter-pill ${statusFilter === "hotel" ? "active" : ""}`} onClick={() => setStatusFilter("hotel")}>
                🏨 Hotels ({bookings.filter((b) => b.type === "hotel").length})
              </button>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No bookings found</h3>
              <p>When customers make a booking on the public website, it will be listed here in real time.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Service / Destination</th>
                    <th>Date</th>
                    <th>Total (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => {
                    const isHotel = b.type === "hotel";
                    const hotelObj = b.hotel || b.hotelDetails || {};
                    const transportObj = b.transportation || b.transportDetails || {};

                    return (
                      <tr key={b.bookingId}>
                        <td>
                          <strong>{b.bookingId}</strong>
                          {b.paymentRef && <div style={{ fontSize: 11, color: "#64748b" }}>{b.paymentRef}</div>}
                        </td>
                        <td>
                          <strong>{b.passengerName || b.guestName}</strong>
                        </td>
                        <td>
                          <div>{b.phone}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{b.email}</div>
                        </td>
                        <td>
                          {isHotel ? (
                            <>
                              <div>🏨 {hotelObj.name || "Hotel"}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{hotelObj.city} · {b.rooms}R ({b.nights}N)</div>
                            </>
                          ) : (
                            <>
                              <div>{typeIcon(transportObj.type)} {transportObj.name}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{transportObj.from} → {transportObj.to} · {b.seats} seats</div>
                            </>
                          )}
                        </td>
                        <td>{formatDate(b.travelDate || b.checkIn)}</td>
                        <td>
                          <strong style={{ color: "#059669" }}>₹{b.totalPrice?.toLocaleString("en-IN")}</strong>
                        </td>
                        <td>
                          <span className={`booking-status ${b.status === "Confirmed" ? "status-confirmed" : "status-cancelled"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button className="btn btn-outline btn-sm" onClick={() => onViewTicket(b)}>
                              🎫 Ticket
                            </button>
                            {b.status === "Confirmed" && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(b.bookingId)}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FLEET & TRANSPORT SCHEDULES ── */}
      {activeTab === "fleet" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Transport Fleet Management</h3>
            <button className="btn btn-primary" onClick={() => setShowAddTransport(!showAddTransport)}>
              {showAddTransport ? "✕ Cancel" : "➕ Add New Transport Schedule"}
            </button>
          </div>

          {showAddTransport && (
            <div className="admin-form-box">
              <h4>Add New Schedule</h4>
              <form onSubmit={handleCreateTransport} style={{ marginTop: 14 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mode</label>
                    <select value={newTrans.type} onChange={(e) => setNewTrans({ ...newTrans, type: e.target.value })}>
                      <option value="Bus">🚌 Bus</option>
                      <option value="Train">🚆 Train</option>
                      <option value="Flight">✈️ Flight</option>
                      <option value="Cab">🚕 Cab</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Service / Operator Name</label>
                    <input
                      required
                      placeholder="e.g. KSRTC Club Class"
                      value={newTrans.name}
                      onChange={(e) => setNewTrans({ ...newTrans, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>From City</label>
                    <input
                      required
                      list="karnataka-cities"
                      value={newTrans.from}
                      onChange={(e) => setNewTrans({ ...newTrans, from: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>To City</label>
                    <input
                      required
                      list="karnataka-cities"
                      value={newTrans.to}
                      onChange={(e) => setNewTrans({ ...newTrans, to: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Departure Time</label>
                    <input
                      required
                      placeholder="e.g. 07:30"
                      value={newTrans.departure}
                      onChange={(e) => setNewTrans({ ...newTrans, departure: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time</label>
                    <input
                      required
                      placeholder="e.g. 11:00"
                      value={newTrans.arrival}
                      onChange={(e) => setNewTrans({ ...newTrans, arrival: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={newTrans.price}
                      onChange={(e) => setNewTrans({ ...newTrans, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Seats</label>
                    <input
                      required
                      type="number"
                      value={newTrans.seats}
                      onChange={(e) => setNewTrans({ ...newTrans, seats: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">
                  Save Transport Schedule ✓
                </button>
              </form>
            </div>
          )}

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Operator Name</th>
                  <th>Route</th>
                  <th>Timings</th>
                  <th>Price</th>
                  <th>Seats Left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transportList.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.id}</strong></td>
                    <td>
                      <span className={`card-type-badge ${typeBadge(t.type)}`}>
                        {typeIcon(t.type)} {t.type}
                      </span>
                    </td>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.from} → {t.to}</td>
                    <td>{t.departure} - {t.arrival} ({t.duration})</td>
                    <td>₹{t.price}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: t.seats <= 5 ? "#dc2626" : "#059669" }}>
                        {t.seats}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTransport(t.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: HOTEL PROPERTIES ── */}
      {activeTab === "hotels" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Hotel Network Management</h3>
            <button className="btn btn-primary" onClick={() => setShowAddHotel(!showAddHotel)}>
              {showAddHotel ? "✕ Cancel" : "➕ Add New Hotel Listing"}
            </button>
          </div>

          {showAddHotel && (
            <div className="admin-form-box">
              <h4>Add New Hotel Property</h4>
              <form onSubmit={handleCreateHotel} style={{ marginTop: 14 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Hotel Name</label>
                    <input
                      required
                      placeholder="e.g. Hotel Mayura Residency"
                      value={newHtl.name}
                      onChange={(e) => setNewHtl({ ...newHtl, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      required
                      list="karnataka-cities"
                      value={newHtl.city}
                      onChange={(e) => setNewHtl({ ...newHtl, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Star Rating (1-5)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="5"
                      value={newHtl.stars}
                      onChange={(e) => setNewHtl({ ...newHtl, stars: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price per Night (₹)</label>
                    <input
                      required
                      type="number"
                      value={newHtl.pricePerNight}
                      onChange={(e) => setNewHtl({ ...newHtl, pricePerNight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Rooms</label>
                    <input
                      required
                      type="number"
                      value={newHtl.rooms}
                      onChange={(e) => setNewHtl({ ...newHtl, rooms: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amenities (comma separated)</label>
                    <input
                      value={newHtl.amenities}
                      onChange={(e) => setNewHtl({ ...newHtl, amenities: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">
                  Save Hotel Property ✓
                </button>
              </form>
            </div>
          )}

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hotel Property</th>
                  <th>City</th>
                  <th>Rating</th>
                  <th>Price / Night</th>
                  <th>Rooms Left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hotelsList.map((h) => (
                  <tr key={h.id}>
                    <td><strong>{h.id}</strong></td>
                    <td>
                      <strong>{hotelIcon(h)} {h.name}</strong>
                    </td>
                    <td>📍 {h.city}</td>
                    <td>{stars(h.stars)} ({h.rating || 4.0})</td>
                    <td>₹{h.pricePerNight?.toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: h.rooms <= 3 ? "#dc2626" : "#059669" }}>
                        {h.rooms}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteHotel(h.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: USERS DIRECTORY ── */}
      {activeTab === "users" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Registered User Directory</h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>{usersList.length} Accounts in system</span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span className={`booking-status ${u.role === "creator" ? "status-confirmed" : "status-cancelled"}`} style={{ textTransform: "uppercase" }}>
                        {u.role === "creator" ? "🛡️ Administrator" : "👤 Customer"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
