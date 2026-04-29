import React, { useEffect, useState } from "react";
import { paymentService, houseService } from "../services/api";
import { CreditCard, Search, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { formatCurrency } from "../utils/formatCurrency";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    house_id: "",
    resident_id: "",
    payment_type: "satpam",
    amount: "",
    payment_period_start: "",
    payment_period_end: "",
    description: "",
  });
  const [paymentOptions, setPaymentOptions] = useState({
    satpam: true,
    kebersihan: false,
    lainnya: false
  });
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      formData.house_id &&
      formData.payment_type &&
      formData.payment_type !== "lainnya"
    ) {
      calculateAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.house_id, formData.payment_type]);

  const calculateAmount = async () => {
    try {
      const res = await paymentService.calculate({
        house_id: formData.house_id,
        payment_type: formData.payment_type,
      });
      setFormData((prev) => ({
        ...prev,
        amount: res.data.amount,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, searchTerm]);

  const normalizeListResponse = (payload) => {
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          currentPage: 1,
          lastPage: 1,
          perPage: payload.length,
          total: payload.length,
        },
      };
    }

    if (payload && Array.isArray(payload.data)) {
      return {
        items: payload.data,
        meta: {
          currentPage: payload.current_page ?? 1,
          lastPage: payload.last_page ?? 1,
          perPage: payload.per_page ?? payload.data.length,
          total: payload.total ?? payload.data.length,
        },
      };
    }

    return {
      items: [],
      meta: { currentPage: 1, lastPage: 1, perPage: perPage, total: 0 },
    };
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAll({
        page,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setPayments(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data pembayaran.",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHouses = async () => {
    try {
      const res = await houseService.getAll();
      setHouses(res.data.filter((h) => h.status === "dihuni"));
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data rumah.",
        timer: 5000,
        timerProgressBar: true,
      });
    }
  };

  const handleHouseChange = (houseId) => {
    const house = houses.find((h) => h.id == houseId);
    if (house) {
      setFormData({
        ...formData,
        house_id: houseId,
        resident_id: house.current_resident.id,
      });
    } else {
      setFormData({
        ...formData,
        house_id: "",
        resident_id: "",
        amount: "",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Hapus Terpilih?",
      text: `Anda akan menghapus ${selectedIds.length} data pembayaran.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--danger)",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await paymentService.deleteBulk(selectedIds);
        await Swal.fire({
          title: "Berhasil",
          text: "Data telah dihapus.",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
        });
        setSelectedIds([]);
        fetchPayments();
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Gagal",
          text: "Tidak bisa menghapus data.",
          icon: "error",
          timer: 5000,
          timerProgressBar: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Hapus Semua?",
      text: "Seluruh data pembayaran akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--danger)",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await paymentService.deleteBulk("all");
        await Swal.fire({
          title: "Berhasil",
          text: "Semua data telah dihapus.",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
        });
        setSelectedIds([]);
        fetchPayments();
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Gagal",
          text: "Tidak bisa menghapus data.",
          icon: "error",
          timer: 5000,
          timerProgressBar: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === payments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payments.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleShowDetail = (p) => {
    Swal.fire({
      title: "Detail Pembayaran",
      html: `
        <div style="text-align: left; padding: 10px; font-family: 'Inter', sans-serif;">
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; margin-bottom: 15px;">
            <span style="color: #666">Rumah</span>
            <span style="font-weight: 600">: ${p.house.house_number}</span>
            
            <span style="color: #666">Penghuni</span>
            <span style="font-weight: 600">: ${p.resident.full_name}</span>
            
            <span style="color: #666">Jenis Iuran</span>
            <span style="font-weight: 600">: ${p.payment_type.toUpperCase()}</span>
            
            ${p.description ? `
              <span style="color: #666">Keterangan</span>
              <span style="font-weight: 600">: ${p.description}</span>
            ` : ''}
            
            <span style="color: #666">Jumlah</span>
            <span style="font-weight: 600; color: var(--primary)">: Rp ${formatCurrency(p.amount)}</span>
            
            <span style="color: #666">Periode</span>
            <span style="font-weight: 600">: ${p.payment_period_start} s/d ${p.payment_period_end}</span>
            
            <span style="color: #666">Tgl Bayar</span>
            <span style="font-weight: 600">: ${new Date(p.payment_date).toLocaleString('id-ID')}</span>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Tutup",
      confirmButtonColor: "var(--primary)"
    });
  };

  const calculateTotalAmount = () => {
    let total = 0;
    if (paymentOptions.satpam) total += 100000;
    if (paymentOptions.kebersihan) total += 15000;
    if (paymentOptions.lainnya) total += Number(formData.amount || 0);
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const selectedTypes = [];
    if (paymentOptions.satpam) selectedTypes.push('satpam');
    if (paymentOptions.kebersihan) selectedTypes.push('kebersihan');
    if (paymentOptions.lainnya) selectedTypes.push('lainnya');

    if (selectedTypes.length === 0) {
      await Swal.fire("Peringatan", "Pilih minimal satu jenis iuran.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      
      for (const type of selectedTypes) {
        let payload = { ...formData, payment_type: type };
        
        if (type === 'satpam') payload.amount = 100000;
        if (type === 'kebersihan') payload.amount = 15000;
        // 'lainnya' already has amount from formData

        await paymentService.create(payload);
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pembayaran berhasil dicatat.",
        timer: 3000,
        timerProgressBar: true,
      });
      setShowModal(false);
      fetchPayments();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menyimpan pembayaran.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
            Pembayaran Iuran
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Catat dan pantau pembayaran iuran satpam & kebersihan.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: "260px",
              flex: 1,
            }}
          >
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari rumah / penghuni / jenis / status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <CreditCard size={20} />
              <span className="desktop-only">Input</span> Pembayaran
            </button>

            <button
              className="btn btn-outline"
              style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || loading}
            >
              Hapus <span className="desktop-only">Terpilih</span> (
              {selectedIds.length})
            </button>

            <button
              className="btn btn-outline"
              style={{ background: "var(--danger)", color: "#fff" }}
              onClick={handleDeleteAll}
              disabled={loading}
              title="Hapus Semua"
            >
              <span className="desktop-only">Hapus Semua</span>
              <span className="mobile-only">Hapus All</span>
            </button>
          </div>
        </div>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      payments.length > 0 &&
                      selectedIds.length === payments.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Tanggal Bayar</th>
                <th>Rumah</th>
                <th>Penghuni</th>
                <th>Jenis</th>
                <th>Periode</th>
                <th>Jumlah</th>
                <th style={{ width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} style={{ padding: "1rem" }}>
                      <div className="skeleton" style={{ height: "30px", width: "100%", borderRadius: "0.5rem" }}></div>
                    </td>
                  </tr>
                ))
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td>{p.house.house_number}</td>
                    <td>{p.resident.full_name}</td>
                    <td>
                      <span className="badge badge-success">
                        {p.payment_type}
                      </span>
                    </td>
                    <td>
                      {p.payment_period_start} s/d {p.payment_period_end}
                    </td>
                    <td style={{ fontWeight: "700", color: "var(--primary)" }}>Rp {formatCurrency(p.amount)}</td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: "0.4rem", borderRadius: "0.5rem" }}
                        onClick={() => handleShowDetail(p)}
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Total: {total}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className="btn btn-outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              Page {page} / {lastPage}
            </div>
            <button
              className="btn btn-outline"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            >
              Next
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              Per page
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 20, 16, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "var(--glass-bg)",
              margin: "1rem",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Input Pembayaran Baru</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label>Pilih Rumah (Hanya yang berpenghuni)</label>
                <select
                  required
                  value={formData.house_id}
                  onChange={(e) => handleHouseChange(e.target.value)}
                >
                  <option value="">-- Pilih --</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.house_number} - {h.current_resident.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ marginBottom: "0.5rem", display: "block" }}>Jenis Iuran</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="glass-card" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem", 
                    padding: "0.75rem 1rem", 
                    cursor: "pointer",
                    background: paymentOptions.satpam ? "var(--primary-soft)" : "transparent",
                    borderColor: paymentOptions.satpam ? "var(--primary)" : "var(--glass-border)"
                  }}>
                    <input 
                      type="checkbox" 
                      style={{ width: "auto", marginTop: 0 }}
                      checked={paymentOptions.satpam}
                      onChange={(e) => setPaymentOptions({ ...paymentOptions, satpam: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: "600", display: "block" }}>Satpam</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Rp 100.000 / bulan</span>
                    </div>
                  </label>

                  <label className="glass-card" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem", 
                    padding: "0.75rem 1rem", 
                    cursor: "pointer",
                    background: paymentOptions.kebersihan ? "var(--primary-soft)" : "transparent",
                    borderColor: paymentOptions.kebersihan ? "var(--primary)" : "var(--glass-border)"
                  }}>
                    <input 
                      type="checkbox" 
                      style={{ width: "auto", marginTop: 0 }}
                      checked={paymentOptions.kebersihan}
                      onChange={(e) => setPaymentOptions({ ...paymentOptions, kebersihan: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: "600", display: "block" }}>Kebersihan</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Rp 15.000 / bulan</span>
                    </div>
                  </label>

                  <label className="glass-card" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem", 
                    padding: "0.75rem 1rem", 
                    cursor: "pointer",
                    background: paymentOptions.lainnya ? "var(--primary-soft)" : "transparent",
                    borderColor: paymentOptions.lainnya ? "var(--primary)" : "var(--glass-border)"
                  }}>
                    <input 
                      type="checkbox" 
                      style={{ width: "auto", marginTop: 0 }}
                      checked={paymentOptions.lainnya}
                      onChange={(e) => setPaymentOptions({ ...paymentOptions, lainnya: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: "600", display: "block" }}>Lainnya (Manual)</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Input jumlah bebas</span>
                    </div>
                  </label>
                </div>
              </div>

              {paymentOptions.lainnya && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", background: "var(--surface-muted)", borderRadius: "1rem" }}>
                  <div>
                    <label>Masukkan Jumlah (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 50000"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Keterangan</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Iuran THR, Dana Sosial, dll"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label>Periode Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_period_start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_period_start: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Periode Selesai</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_period_end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_period_end: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label>Total Bayar (Otomatis)</label>
                <div style={{ 
                  padding: "1rem", 
                  background: "var(--primary-soft)", 
                  color: "var(--primary)", 
                  fontSize: "1.5rem", 
                  fontWeight: "800", 
                  borderRadius: "0.75rem",
                  textAlign: "center",
                  border: "1px dashed var(--primary)"
                }}>
                  Rp {formatCurrency(calculateTotalAmount())}
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Proses Pembayaran"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
