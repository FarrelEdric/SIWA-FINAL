import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  CreditCard,
  Receipt,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import "./styles/global.css";

import perumahanImage from "./assets/perumahan.png";
import siwaLogo from "./assets/siwa logo.png";

// Pages (to be created)
import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Houses from "./pages/Houses";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import BillingSummary from "./pages/BillingSummary";

const SidebarLink = ({ to, icon: Icon, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        color: isActive ? "var(--primary)" : "var(--text-secondary)",
        textDecoration: "none",
        borderRadius: "0.5rem",
        background: isActive ? "var(--primary-soft)" : "transparent",
        transition: "all 0.3s",
      }}
    >
      <Icon size={20} />
      <span>{children}</span>
    </Link>
  );
};

const SidebarLogo = () => (
  <img
    src={siwaLogo}
    alt="SIWA"
    style={{
      height: "28px",
      width: "auto",
      display: "block",
      objectFit: "contain",
    }}
  />
);

const Navbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <nav
      className="glass-card"
      style={{
        margin: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.82), rgba(255,255,255,0.82)), url(${perumahanImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          background:
            "linear-gradient(to right, var(--primary), var(--secondary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        SIWA
      </h1>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            justifyContent: "center",
          }}
        >
          RT
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    let link = document.querySelector('link[rel="icon"]');

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.type = "image/png";
    link.href = siwaLogo;
  }, []);

  return (
    <Router>
      <div
        style={{ display: "flex", minHeight: "100vh", position: "relative" }}
      >
        {/* Sidebar Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            className="mobile-only"
          />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <SidebarLogo />
            <button
              className="mobile-only"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div
            style={{
              padding: "0 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <SidebarLink
              to="/"
              icon={LayoutDashboard}
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </SidebarLink>
            <SidebarLink
              to="/residents"
              icon={Users}
              onClick={() => setSidebarOpen(false)}
            >
              Penghuni
            </SidebarLink>
            <SidebarLink
              to="/houses"
              icon={Home}
              onClick={() => setSidebarOpen(false)}
            >
              Rumah
            </SidebarLink>
            <SidebarLink
              to="/payments"
              icon={CreditCard}
              onClick={() => setSidebarOpen(false)}
            >
              Pembayaran
            </SidebarLink>
            <SidebarLink
              to="/billing"
              icon={ClipboardList}
              onClick={() => setSidebarOpen(false)}
            >
              Laporan Tagihan
            </SidebarLink>
            <SidebarLink
              to="/expenses"
              icon={Receipt}
              onClick={() => setSidebarOpen(false)}
            >
              Pengeluaran
            </SidebarLink>
          </div>
        </aside>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <nav
            className="glass-card"
            style={{
              margin: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "80px", // Aligned with sidebar header
              padding: "0 2rem",
              backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${perumahanImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                className="mobile-only"
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  cursor: "pointer",
                }}
              >
                <Menu size={24} />
              </button>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  margin: 0,
                  background:
                    "linear-gradient(to right, var(--primary), var(--secondary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SIWA
              </h1>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                }}
              >
                RT
              </div>
            </div>
          </nav>

          <div
            className="main-content-wrapper"
            style={{ padding: "2rem", flex: 1 }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/houses" element={<Houses />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/billing" element={<BillingSummary />} />
              <Route path="/expenses" element={<Expenses />} />
            </Routes>
          </div>
        </main>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .main-content-wrapper {
            padding: 1rem !important;
          }
          nav {
            margin: 0.5rem !important;
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;
