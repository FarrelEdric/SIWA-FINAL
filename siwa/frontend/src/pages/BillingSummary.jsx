import React, { useEffect, useState } from "react";
import { billingService } from "../services/api";
import { ClipboardList, Calendar, CheckCircle, XCircle, AlertCircle, FileDown, Search, ChevronDown } from "lucide-react";
import * as XLSX from 'xlsx';

const BillingSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await billingService.getSummary(month, year);
      setSummary(res.data);
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

  const filteredSummary = summary.filter(item => {
    const s = searchTerm.toLowerCase();
    
    // Status Hunian
    const residentStatus = item.resident_status ? (item.resident_status === 'tetap' ? 'tetap' : 'kontrak') : 'kosong';
    
    // Status Akhir
    let finalStatus = "";
    if (!item.must_pay) {
      finalStatus = "tidak ada tagihan";
    } else if (item.satpam === 'lunas' && item.kebersihan === 'lunas') {
      finalStatus = "lunas";
    } else {
      finalStatus = "tunggakan";
    }

    return (
      item.house_number.toLowerCase().includes(s) ||
      item.resident_name.toLowerCase().includes(s) ||
      residentStatus.includes(s) ||
      item.satpam.toLowerCase().includes(s) ||
      item.kebersihan.toLowerCase().includes(s) ||
      finalStatus.includes(s)
    );
  });

  const handleDownloadExcel = () => {
    const monthName = new Date(0, month - 1).toLocaleString('id-ID', { month: 'long' });
    const fileName = `${monthName} ${year}.xlsx`;

    const data = filteredSummary.map(item => ({
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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Laporan Tagihan Bulanan</h1>
          <p style={{ color: "var(--text-secondary)" }}>Pantau status pembayaran warga per periode.</p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <div className="glass-card" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem", 
            padding: "0.6rem 1.25rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid var(--glass-border)",
            transition: "all 0.2s"
          }}>
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input 
              type="text" 
              placeholder="Cari data laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "180px", fontSize: "0.95rem", color: "var(--text-primary)" }}
            />
          </div>

          <div className="glass-card" style={{ 
            display: "flex", 
            gap: "0.5rem", 
            padding: "0.4rem 1.25rem", 
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid var(--glass-border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingRight: "0.75rem", borderRight: "1px solid var(--glass-border)" }}>
              <Calendar size={18} style={{ color: "var(--primary)" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <select 
                  value={month} 
                  onChange={(e) => setMonth(Number(e.target.value))}
                  style={{ 
                    padding: "0.4rem 1.5rem 0.4rem 0.5rem", 
                    border: "none", 
                    background: "transparent", 
                    fontWeight: "700",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 0, pointerEvents: "none", color: "var(--text-secondary)" }} />
              </div>
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", paddingLeft: "0.25rem" }}>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ 
                  padding: "0.4rem 1.5rem 0.4rem 0.5rem", 
                  border: "none", 
                  background: "transparent", 
                  fontWeight: "700",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 0, pointerEvents: "none", color: "var(--text-secondary)" }} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleDownloadExcel} disabled={filteredSummary.length === 0} style={{ padding: "0.75rem 1.5rem", borderRadius: "1rem" }}>
            <FileDown size={18} />
            <span>Download Excel</span>
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
              ) : filteredSummary.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                    <div style={{ opacity: 0.5, marginBottom: "1rem" }}>
                      <Search size={48} strokeWidth={1} />
                    </div>
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSummary.map((item) => (
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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ padding: "1rem", background: "var(--primary-soft)", borderRadius: "1rem", color: "var(--primary)" }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Total Rumah Wajib Iuran</p>
            {loading ? (
              <div className="skeleton" style={{ height: "2.5rem", width: "100px", borderRadius: "0.5rem" }}></div>
            ) : (
              <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-strong)" }}>
                {summary.filter(s => s.must_pay).length} <span style={{ fontSize: "1rem", fontWeight: "500", color: "var(--text-secondary)" }}>Unit</span>
              </h3>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", borderLeft: "4px solid var(--success)" }}>
          <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "1rem", color: "var(--success)" }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Sudah Lunas Semua</p>
            {loading ? (
              <div className="skeleton" style={{ height: "2.5rem", width: "100px", borderRadius: "0.5rem" }}></div>
            ) : (
              <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-strong)" }}>
                {summary.filter(s => s.must_pay && s.satpam === 'lunas' && s.kebersihan === 'lunas').length} <span style={{ fontSize: "1rem", fontWeight: "500", color: "var(--text-secondary)" }}>Unit</span>
              </h3>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "1rem", color: "var(--danger)" }}>
            <XCircle size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Belum Bayar (Tunggakan)</p>
            {loading ? (
              <div className="skeleton" style={{ height: "2.5rem", width: "100px", borderRadius: "0.5rem" }}></div>
            ) : (
              <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-strong)" }}>
                {summary.filter(s => s.must_pay && (s.satpam === 'belum' || s.kebersihan === 'belum')).length} <span style={{ fontSize: "1rem", fontWeight: "500", color: "var(--text-secondary)" }}>Unit</span>
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
