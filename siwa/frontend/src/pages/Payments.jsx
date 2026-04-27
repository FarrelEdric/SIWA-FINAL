import React, { useEffect, useState } from 'react';
import { paymentService, houseService } from '../services/api';
import { CreditCard, Search, Calendar } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    house_id: '',
    resident_id: '',
    payment_type: 'satpam',
    amount: 0,
    payment_period_start: '',
    payment_period_end: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchHouses();
  }, []);

  const fetchPayments = async () => {
    const res = await paymentService.getAll();
    setPayments(res.data);
  };

  const fetchHouses = async () => {
    const res = await houseService.getAll();
    setHouses(res.data.filter(h => h.status === 'dihuni'));
  };

  const handleHouseChange = async (houseId) => {
    const house = houses.find(h => h.id == houseId);
    if (house) {
      const res = await paymentService.calculate({ house_id: houseId, payment_type: formData.payment_type });
      setFormData({
        ...formData,
        house_id: houseId,
        resident_id: house.current_resident.id,
        amount: res.data.amount
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.create(formData);
      fetchPayments();
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Pembayaran Iuran</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Catat dan pantau pembayaran iuran satpam & kebersihan.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <CreditCard size={20} />
          Input Pembayaran
        </button>
      </header>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Tanggal Bayar</th>
              <th>Rumah</th>
              <th>Penghuni</th>
              <th>Jenis</th>
              <th>Periode</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                <td>{p.house.house_number}</td>
                <td>{p.resident.full_name}</td>
                <td><span className="badge badge-success">{p.payment_type}</span></td>
                <td>{p.payment_period_start} s/d {p.payment_period_end}</td>
                <td>Rp {p.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '500px', background: '#1e1b4b' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Input Pembayaran Baru</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Pilih Rumah (Hanya yang berpenghuni)</label>
                <select required value={formData.house_id} onChange={e => handleHouseChange(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {houses.map(h => (
                    <option key={h.id} value={h.id}>{h.house_number} - {h.current_resident.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Jenis Iuran</label>
                <select value={formData.payment_type} onChange={e => setFormData({...formData, payment_type: e.target.value})}>
                  <option value="satpam">Satpam (Rp 100.000)</option>
                  <option value="kebersihan">Kebersihan (Rp 15.000)</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Periode Mulai</label>
                  <input type="date" required value={formData.payment_period_start} onChange={e => setFormData({...formData, payment_period_start: e.target.value})} />
                </div>
                <div>
                  <label>Periode Selesai</label>
                  <input type="date" required value={formData.payment_period_end} onChange={e => setFormData({...formData, payment_period_end: e.target.value})} />
                </div>
              </div>
              <div>
                <label>Total Bayar (Otomatis)</label>
                <input type="number" readOnly value={formData.amount} style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Proses Pembayaran</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
