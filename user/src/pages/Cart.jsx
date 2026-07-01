import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import BackHeader from '../components/BackHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { inr, FALLBACK_IMG } from '../utils/format.js';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');

  if (!cart.items.length) {
    return (
      <>
        <BackHeader title="My Cart" />
        <EmptyState icon="🛒" title="Your cart is empty" text="Add some fresh produce!" actionLabel="Start Shopping" actionTo="/home" />
      </>
    );
  }

  return (
    <div>
      <BackHeader title={`My Cart (${cart.items.length})`} />
      <div className="page">
        <div className="card">
          {cart.items.map((it) => (
            <div key={it._id} className="cart-item">
              <img src={it.product.image || FALLBACK_IMG} alt={it.product.name} onError={(e)=>{e.target.src=FALLBACK_IMG;}} />
              <div style={{ flex: 1 }}>
                <div className="ci-name">{it.product.name}</div>
                <div className="ci-unit">{it.label} · {inr(it.unitPrice)}</div>
                {!it.inStock && <div className="oos-tag">Out of stock</div>}
                <div className="qty-stepper" style={{ width: 100, marginTop: 6 }}>
                  <button onClick={() => updateItem(it._id, it.quantity - 1)}>−</button>
                  <span>{it.quantity}</span>
                  <button onClick={() => updateItem(it._id, it.quantity + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{inr(it.lineTotal)}</div>
                <button onClick={() => removeItem(it._id)} style={{ color: 'var(--red)', marginTop: 8 }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">Apply Coupon</div>
        {cart.couponCode ? (
          <div className="coupon-item flex">
            <FiTag color="var(--green)" />
            <div style={{ flex: 1 }}>
              <span className="code">{cart.couponCode}</span> applied
              <div className="muted">You saved {inr(cart.discount)}</div>
            </div>
            <button onClick={removeCoupon} style={{ color: 'var(--red)' }}><FiX size={20} /></button>
          </div>
        ) : (
          <div className="coupon-box">
            <input className="field" style={{ margin: 0 }} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" />
            <button className="btn btn-sm" onClick={() => code && applyCoupon(code)}>Apply</button>
          </div>
        )}

        <div className="card mt" style={{ padding: 16 }}>
          <div className="section-title" style={{ marginTop: 0 }}>Bill Details</div>
          <div className="bill-row"><span>Item Total</span><span>{inr(cart.subtotal)}</span></div>
          {cart.discount > 0 && <div className="bill-row"><span>Coupon Discount</span><span className="free">− {inr(cart.discount)}</span></div>}
          <div className="bill-row">
            <span>Delivery Charge</span>
            {cart.deliveryCharge > 0 ? <span>{inr(cart.deliveryCharge)}</span> : <span className="free">FREE</span>}
          </div>
          <div className="bill-row total"><span>To Pay</span><span>{inr(cart.total)}</span></div>
        </div>
      </div>

      <div className="sticky-checkout">
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{inr(cart.total)}</div>
        </div>
        <button className="btn" style={{ flex: 1 }} onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
