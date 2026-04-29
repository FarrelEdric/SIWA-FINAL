import React, { useEffect, useState } from "react";
import { billingService } from "../services/api";
import { ClipboardList, Calendar, CheckCircle, XCircle, AlertCircle, FileDown, Search } from "lucide-react";
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

  const filteredSummary = summary.filter(item => 
    item.house_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resident_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem" }}>
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input 
              type="text" 
              placeholder="Cari rumah / penghuni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "180px" }}
            />
          </div>

          <div className="glass-card" style={{ display: "flex", gap: "1rem", padding: "0.75rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={18} style={{ color: "var(--primary)" }} />
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{ padding: "0.25rem", border: "none", background: "transparent", fontWeight: "600" }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <select 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ padding: "0.25rem", border: "none", background: "transparent", fontWeight: "600" }}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleDownloadExcel} disabled={filteredSummary.length === 0}>
            <FileDown size={18} />
            Download Excel
          </button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Rumah</th>
                <th>Penghuni</th>
                <th>Status Hunian</th>
                <th style={{ textAlign: "center" }}>Iuran Satpam</th>
                <th style={{ textAlign: "center" }}>Iuran Kebersihan</th>
                <th>Status Akhir</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading summary...</td>
                </tr>
              ) : filteredSummary.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Data tidak ditemukan.</td>
                </tr>
              ) : (
                filteredSummary.map((item) => (
                  <tr key={item.house_id}>
                    <td style={{ fontWeight: "700" }}>{item.house_number}</td>
                    <td>{item.resident_name}</td>
                    <td>
                      {item.resident_status ? (
                        <span className={`badge ${item.resident_status === 'tetap' ? 'badge-success' : 'badge-warning'}`}>
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
                    <td>
                      {item.must_pay ? (
                        (item.satpam === 'lunas' && item.kebersihan === 'lunas') ? 
                        <span style={{ color: "var(--success)", fontWeight: "600" }}>LUNAS</span> : 
                        <span style={{ color: "var(--danger)", fontWeight: "600" }}>TUNGGAKAN</span>
                      ) : (
                        <span style={{ color: "var(--text-secondary)" }}>Tidak Ada Tagihan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div className="glass-card" style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", background: "var(--primary-soft)", borderRadius: "0.5rem", color: "var(--primary)" }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Total Rumah Wajib Iuran</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
              {summary.filter(s => s.must_pay).length} Rumah
            </h3>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "0.5rem", color: "var(--success)" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Sudah Lunas Semua</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
              {summary.filter(s => s.must_pay && s.satpam === 'lunas' && s.kebersihan === 'lunas').length} Rumah
            </h3>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "0.5rem", color: "var(--danger)" }}>
            <XCircle size={24} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Belum Bayar</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
              {summary.filter(s => s.must_pay && (s.satpam === 'belum' || s.kebersihan === 'belum')).length} Rumah
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
