import React, { useEffect, useState } from "react";
import { billingService } from "../services/api";
import { ClipboardList, Calendar, CheckCircle, XCircle, AlertCircle, FileDown, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from 'xlsx';

const BillingSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    total_wajib: 0,
    total_lunas: 0,
    total_tunggakan: 0
  });

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, searchTerm]);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await billingService.getSummary({ month, year, page, search: searchTerm });
      setSummary(res.data.data);
      setMeta(res.data.meta);
      setStats(res.data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'lunas':
        return <CheckCircle size={18} style={{ color: "var(--success)" }} />;
      case 'belum':
        return <XCircle size={18} style={{ color: "var(--danger)" }} />;
      default:
        return <AlertCircle size={18} style={{ color: "var(--text-secondary)" }} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lunas':
        return <span className="badge badge-success">Lunas</span>;
      case 'belum':
        return <span className="badge badge-danger">Belum</span>;
      default:
        return <span className="badge" style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>N/A</span>;
    }
  };



  const handleDownloadExcel = () => {
    const monthName = new Date(0, month - 1).toLocaleString('id-ID', { month: 'long' });
    const fileName = `${monthName} ${year}.xlsx`;

    const data = summary.map(item => ({
      'Nomor Rumah': item.house_number,
      'Nama Penghuni': item.resident_name,
      'Status Hunian': item.resident_status || 'Kosong',
      'Status Satpam': item.satpam.toUpperCase(),
      'Status Kebersihan': item.kebersihan.toUpperCase(),
      'Keterangan': item.must_pay ? (item.satpam === 'lunas' && item.kebersihan === 'lunas' ? 'LUNAS' : 'TUNGGAKAN') : 'TIDAK ADA TAGIHAN'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Tagihan");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header
        className="glass-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          padding: "1.5rem 2rem",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/rumah.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ minWidth: "250px" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "900", letterSpacing: "-0.025em" }}>
            Laporan Tagihan
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "0.25rem" }}>
            Ringkasan status iuran warga periode ini.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            flex: "1 1 auto",
            justifyContent: "flex-end"
          }}
        >
          <div
            className="glass-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0 1.25rem",
              borderRadius: "1rem",
              flex: "1 1 300px",
              maxWidth: "400px",
              height: "52px",
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
            }}
          >
            <Search size={20} style={{ color: "var(--primary)" }} />
            <input
              type="text"
              placeholder="Cari nomor rumah, nama, atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                fontSize: "1rem",
                color: "var(--text-primary)",
                fontWeight: "500"
              }}
            />
          </div>

          <div
            className="glass-card"
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0 1.25rem",
              alignItems: "center",
              borderRadius: "1rem",
              height: "52px",
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid var(--glass-border)"
            }}
          >
            <Calendar size={20} style={{ color: "var(--primary)" }} />
            <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{
                  padding: "0 0.5rem",
                  border: "none",
                  background: "transparent",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  outline: "none",
                  width: "auto",
                  height: "100%"
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
              <span style={{ color: "var(--glass-border)", margin: "0 0.25rem" }}>|</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  padding: "0 0.5rem",
                  border: "none",
                  background: "transparent",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  outline: "none",
                  width: "auto",
                  height: "100%"
                }}
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleDownloadExcel}
            disabled={summary.length === 0}
            style={{
              height: "52px",
              padding: "0 1.75rem",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 10px 20px rgba(79, 139, 101, 0.2)",
              fontSize: "1rem",
              fontWeight: "700"
            }}
          >
            <FileDown size={22} />
            <span>Export Excel</span>
          </button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive" style={{ borderRadius: "1rem" }}>
          <table className="summary-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "1.5rem" }}>Rumah</th>
                <th>Penghuni</th>
                <th>Status Hunian</th>
                <th style={{ textAlign: "center" }}>Iuran Satpam</th>
                <th style={{ textAlign: "center" }}>Iuran Kebersihan</th>
                <th style={{ paddingRight: "1.5rem" }}>Status Akhir</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} style={{ padding: "1.25rem" }}>
                      <div className="skeleton" style={{ height: "30px", width: "100%", borderRadius: "0.5rem" }}></div>
                    </td>
                  </tr>
                ))
              ) : summary.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                    <div style={{ opacity: 0.5, marginBottom: "1rem" }}>
                      <Search size={48} strokeWidth={1} />
                    </div>
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                summary.map((item) => (
                  <tr key={item.house_id} style={{ cursor: "default" }}>
                    <td style={{ fontWeight: "700", paddingLeft: "1.5rem", color: "var(--text-strong)" }}>{item.house_number}</td>
                    <td>{item.resident_name}</td>
                    <td>
                      {item.resident_status ? (
                        <span className={`badge ${item.resident_status === 'tetap' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.025em" }}>
                          {item.resident_status === 'tetap' ? 'Tetap' : 'Kontrak'}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                        {getStatusIcon(item.satpam)}
                        {getStatusBadge(item.satpam)}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                        {getStatusIcon(item.kebersihan)}
                        {getStatusBadge(item.kebersihan)}
                      </div>
                    </td>
                    <td style={{ paddingRight: "1.5rem" }}>
                      {item.must_pay ? (
                        (item.satpam === 'lunas' && item.kebersihan === 'lunas') ? 
                        <span className="badge badge-success" style={{ fontWeight: "800", padding: "0.4rem 1rem" }}>LUNAS</span> : 
                        <span className="badge badge-danger" style={{ fontWeight: "800", padding: "0.4rem 1rem" }}>TUNGGAKAN</span>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontStyle: "italic" }}>Tidak Ada Tagihan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.last_page > 1 && (
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginTop: "1.5rem",
            padding: "0 0.5rem"
          }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Menampilkan <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{summary.length}</span> dari <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{meta.total}</span> rumah
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-outline"
                style={{ padding: "0.5rem", minWidth: "40px" }}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === meta.last_page || (p >= page - 1 && p <= page + 1))
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span style={{ color: "var(--text-secondary)" }}>...</span>}
                    <button
                      className={`btn ${page === p ? 'btn-primary' : 'btn-outline'}`}
                      style={{ 
                        minWidth: "40px", 
                        padding: "0.5rem",
                        background: page === p ? "var(--primary)" : "transparent",
                        borderColor: page === p ? "var(--primary)" : "var(--glass-border)",
                        color: page === p ? "white" : "var(--text-primary)"
                      }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))
              }

              <button
                className="btn btn-outline"
                style={{ padding: "0.5rem", minWidth: "40px" }}
                disabled={page === meta.last_page}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", borderLeft: "4px solid var(--primary)", background: "rgba(255, 255, 255, 0.8)" }}>
          <div style={{ padding: "1rem", background: "var(--primary-soft)", borderRadius: "1.25rem", color: "var(--primary)" }}>
            <ClipboardList size={32} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem" }}>Wajib Iuran</p>
            {loading ? (
              <div className="skeleton" style={{ height: "2.5rem", width: "100px", borderRadius: "0.5rem" }}></div>
            ) : (
              <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-strong)" }}>
                {stats.total_wajib} <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-secondary)" }}>Unit</span>
              </h3>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", borderLeft: "4px solid var(--success)", background: "rgba(255, 255, 255, 0.8)" }}>
          <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "1.25rem", color: "var(--success)" }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem" }}>Lunas Semua</p>
            {loading ? (
              <div className="skeleton" style={{ height: "2.5rem", width: "100px", borderRadius: "0.5rem" }}></div>
            ) : (
              <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--success)" }}>
                {stats.total_lunas} <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-secondary)" }}>Unit</span>
              </h3>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", borderLeft: "4px solid var(--danger)", background: "rgba(255, 255, 255, 0.8)" }}>
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "1.25rem", color: "var(--danger)" }}>
            <XCircle size={32} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem" }}>Tunggakan</p>
            {loading ? (
              <div className="skeleton" style={{ height: "2.5rem", width: "100px", borderRadius: "0.5rem" }}></div>
            ) : (
              <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--danger)" }}>
                {stats.total_tunggakan} <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-secondary)" }}>Unit</span>
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
