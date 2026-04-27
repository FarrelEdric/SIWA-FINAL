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
} from "lucide-react";
import "./styles/global.css";

import perumahanImage from "./assets/perumahan.png";

// Pages (to be created)
import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Houses from "./pages/Houses";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";

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

  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
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
        <aside
          style={{
            width: "280px",
            padding: "1rem",
            borderRight: "1px solid var(--glass-border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            background: "var(--bg-gradient)",
            transition: "all 0.3s",
            zIndex: 1001,
            position: window.innerWidth <= 768 ? "fixed" : "static",
            left: sidebarOpen ? 0 : "-280px",
            height: "100vh",
          }}
        >
          <div style={{ padding: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Menu Utama
            </h2>
            <button 
              className="mobile-only" 
              onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
          </div>
          <SidebarLink to="/" icon={LayoutDashboard} onClick={() => setSidebarOpen(false)}>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/residents" icon={Users} onClick={() => setSidebarOpen(false)}>
            Penghuni
          </SidebarLink>
          <SidebarLink to="/houses" icon={Home} onClick={() => setSidebarOpen(false)}>
            Rumah
          </SidebarLink>
          <SidebarLink to="/payments" icon={CreditCard} onClick={() => setSidebarOpen(false)}>
            Pembayaran
          </SidebarLink>
          <SidebarLink to="/expenses" icon={Receipt} onClick={() => setSidebarOpen(false)}>
            Pengeluaran
          </SidebarLink>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button 
                className="mobile-only"
                onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer" }}
              >
                <Menu size={24} />
              </button>
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
                  justifyItems: "center",
                  justifyContent: "center",
                }}
              >
                RT
              </div>
            </div>
          </nav>

          <div style={{ padding: window.innerWidth <= 768 ? "1rem" : "2rem", flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/houses" element={<Houses />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/expenses" element={<Expenses />} />
            </Routes>
          </div>
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          aside {
            position: fixed !important;
            box-shadow: 10px 0 30px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </Router>
  );
}

export default App;
