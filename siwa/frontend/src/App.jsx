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

// Pages (to be created)
import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Houses from "./pages/Houses";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
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

const Navbar = () => (
  <nav
    className="glass-card"
    style={{
      margin: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 2rem",
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

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: "280px",
            padding: "1rem",
            borderRight: "1px solid var(--glass-border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ padding: "1rem", marginBottom: "1rem" }}>
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
          </div>
          <SidebarLink to="/" icon={LayoutDashboard}>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/residents" icon={Users}>
            Penghuni
          </SidebarLink>
          <SidebarLink to="/houses" icon={Home}>
            Rumah
          </SidebarLink>
          <SidebarLink to="/payments" icon={CreditCard}>
            Pembayaran
          </SidebarLink>
          <SidebarLink to="/expenses" icon={Receipt}>
            Pengeluaran
          </SidebarLink>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Navbar />
          <div style={{ padding: "2rem", flex: 1 }}>
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
    </Router>
  );
}

export default App;
