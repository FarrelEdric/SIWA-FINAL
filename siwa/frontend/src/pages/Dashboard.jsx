import React, { useEffect, useState } from "react";
import { dashboardService } from "../services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Users, Home } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card" style={{ flex: 1 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
      }}
    >
      <div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          {title}
        </p>
        <h3
          style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem" }}
        >
          Rp {formatCurrency(value)}
        </h3>
      </div>
      <div
        style={{
          padding: "0.75rem",
          background: `${color}20`,
          borderRadius: "0.75rem",
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getData(null, selectedYear);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Loading Skeleton Components
  const StatSkeleton = () => (
    <div className="glass-card" style={{ flex: 1, height: "100px" }}>
      <div className="skeleton" style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}></div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="glass-card">
      <div className="skeleton" style={{ height: "30px", width: "60%", marginBottom: "1rem", borderRadius: "0.4rem" }}></div>
      <div className="skeleton" style={{ height: "200px", width: "100%", borderRadius: "0.75rem" }}></div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="glass-card" style={{ height: "400px" }}>
      <div className="skeleton" style={{ height: "30px", width: "40%", marginBottom: "1.5rem", borderRadius: "0.4rem" }}></div>
      <div className="skeleton" style={{ height: "80%", width: "100%", borderRadius: "1rem" }}></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header
        className="glass-card"
        style={{
          padding: "1.5rem 2rem",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/rumah.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
          Dashboard Overview
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Welcome back, Pak RT. Pelajari laporan keuangan lingkungan Anda di sini.
        </p>
      </header>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Pemasukan Bulan Ini"
              value={data.summary.total_income}
              icon={TrendingUp}
              color="#3f8a62"
            />
            <StatCard
              title="Pengeluaran Bulan Ini"
              value={data.summary.total_expense}
              icon={TrendingDown}
              color="#b74a4a"
            />
            <StatCard
              title="Saldo Akhir"
              value={data.summary.balance}
              icon={Wallet}
              color="#4f8b65"
            />
          </>
        )}
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : (
        <div className="glass-card" style={{ height: "450px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Cashflow Bulanan</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Laporan dimulai dari Januari {selectedYear}</p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              {/* Year Filter Inside Chart Card */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                padding: "0.4rem 0.75rem", 
                background: "var(--surface-muted)", 
                borderRadius: "0.75rem",
                border: "1px solid var(--glass-border)"
              }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>Tahun:</span>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{ border: "none", background: "transparent", fontWeight: "800", outline: "none", cursor: "pointer", color: "var(--primary)" }}
                >
                  {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#4f8b65" }}></div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Pemasukan</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#b74a4a" }}></div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Pengeluaran</span>
                </div>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data.chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f8b65" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f8b65" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b74a4a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#b74a4a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-secondary)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rp ${value/1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "1rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  padding: "1rem"
                }}
                formatter={(value) => [`Rp ${formatCurrency(value)}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="#4f8b65"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="#b74a4a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {loading ? (
          <>
            <TableSkeleton />
            <TableSkeleton />
          </>
        ) : (
          <>
            <div className="glass-card">
              <h3 style={{ marginBottom: "1rem" }}>Transaksi Pemasukan Terbaru</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Rumah</th>
                      <th>Tipe</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.details.income.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.payment_date).toLocaleDateString()}</td>
                        <td>{item.house.house_number}</td>
                        <td>
                          <span className="badge badge-success">
                            {item.payment_type}
                          </span>
                        </td>
                        <td>Rp {formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass-card">
              <h3 style={{ marginBottom: "1rem" }}>
                Transaksi Pengeluaran Terbaru
              </h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Judul</th>
                      <th>Kategori</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.details.expense.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.expense_date).toLocaleDateString()}</td>
                        <td>{item.title}</td>
                        <td>
                          <span className="badge badge-warning">
                            {item.category}
                          </span>
                        </td>
                        <td>Rp {formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
