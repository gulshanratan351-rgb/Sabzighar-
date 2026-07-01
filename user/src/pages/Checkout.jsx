import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import Loader from '../components/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr } from '../utils/format.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refresh } = useCart();
  const { user, loadUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [payment, setPayment] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, s] = await Promise.all([api.get('/users/addresses'), api.get('/settings')]);
      setAddresses(a.data.addresses);
      const def = a.data.addresses.find((x) => x.isDefault) || a.data.addresses[0];
      setSelected(def?._id || null);
      setSettings(s.data.settings);
      if (!s.data.settings.codEnabled && s.data.settings.upiEnabled) setPayment('UPI');
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Loader full />;
  if (!cart.items.length) {
    navigate('/cart');
    return null;
  }

  const placeOrder = async () => {
    if (!selected) {
      toast.error('Please select a delivery address');
      return;
    }
    if (payment === 'UPI' && !upiId.trim()) {
      toast.error('Enter your UPI ID');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/orders', { addressId: selected, paymentMethod: payment, upiId });
      await refresh();
      await loadUser();
      toast.success('Order placed!');
      navigate(`/order-success/${data.order._id}`, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <BackHeader title="Checkout" />
      <div className="page">
        <div className="section-title" style={{ marginTop: 0 }}>
          Delivery Address <a onClick={() => navigate('/addresses')}><FiPlus /> Add</a>
        </div>
        {addresses.length === 0 ? (
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <FiMapPin size={30} color="var(--green)" />
            <p className="muted mt">No address added yet</p>
            <button className="btn btn-sm mt" onClick={() => navigate('/addresses')}>Add Address</button>
          </div>
        ) : (
          addresses.map((a) => (
            <div key={a._id} className={`addr-card ${selected === a._id ? 'selected' : ''}`} onClick={() => setSelected(a._id)}>
              <div className="addr-label">{a.label} · {a.fullName}</div>
              <div className="addr-text">
                {a.house}, {a.area}, {a.city}, {a.state} - {a.pincode}
                {a.landmark ? ` (${a.landmark})` : ''}
              </div>
              <div className="addr-text">📞 {a.phone}</div>
            </div>
          ))
        )}

        <div className="section-title">Payment Method</div>
        {settings?.codEnabled && (
          <div className={`pay-option ${payment === 'COD' ? 'selected' : ''}`} onClick={() => setPayment('COD')}>
            <span className="p-ic">💵</span>
            <div style={{ flex: 1 }}>
              <b>Cash on Delivery</b>
              <div className="muted">Pay when your order arrives</div>
            </div>
            <input type="radio" checked={payment === 'COD'} readOnly />
          </div>
        )}
        {settings?.upiEnabled && (
          <div className={`pay-option ${payment === 'UPI' ? 'selected' : ''}`} onClick={() => setPayment('UPI')}>
            <span className="p-ic">📱</span>
            <div style={{ flex: 1 }}>
              <b>UPI Payment</b>
              <div className="muted">Pay via UPI ({settings.upiId})</div>
            </div>
            <input type="radio" checked={payment === 'UPI'} readOnly />
          </div>
        )}
        {payment === 'UPI' && (
          <div className="field mt">
            <label>Your UPI ID</label>
            <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
          </div>
        )}

        <div className="card mt" style={{ padding: 16 }}>
          <div className="bill-row"><span>Item Total</span><span>{inr(cart.subtotal)}</span></div>
          {cart.discount > 0 && <div className="bill-row"><span>Discount</span><span className="free">− {inr(cart.discount)}</span></div>}
          <div className="bill-row">
            <span>Delivery</span>
            {cart.deliveryCharge > 0 ? <span>{inr(cart.deliveryCharge)}</span> : <span className="free">FREE</span>}
          </div>
          <div className="bill-row total"><span>To Pay</span><span>{inr(cart.total)}</span></div>
        </div>
      </div>

      <div className="sticky-checkout">
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{payment}</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{inr(cart.total)}</div>
        </div>
        <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={placeOrder}>
          {busy ? 'Placing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
