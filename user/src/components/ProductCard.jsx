import { useNavigate } from 'react-router-dom';
import { inr, FALLBACK_IMG, productUnitLabel } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const p = product;
  const discount = p.discount ?? (p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
  const outOfStock = p.stock <= 0;

  const quickAdd = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    const opt = p.options?.[0] || (p.unitType === 'weight' ? { grams: 500, label: '500 g' } : { pieces: 1, label: '1 pc' });
    addToCart({
      productId: p._id,
      grams: p.unitType === 'weight' ? opt.grams : 0,
      pieces: p.unitType === 'piece' ? opt.pieces : 0,
      quantity: 1,
      label: opt.label,
    });
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${p.slug}`)}>
      {discount > 0 && <span className="badge-off">{discount}% OFF</span>}
      {p.isOrganic && <span className="badge-org">ORGANIC</span>}
      <div className="p-img">
        <img src={p.images?.[0] || FALLBACK_IMG} alt={p.name} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
      </div>
      <div className="p-body">
        <div className="p-name">{p.name}</div>
        <div className="p-unit">{productUnitLabel(p)}</div>
        <div className="price-row">
          <span className="sp">{inr(p.price)}</span>
          {p.mrp > p.price && <span className="mrp">{inr(p.mrp)}</span>}
        </div>
        {outOfStock ? (
          <div className="add-btn" style={{ borderColor: '#fca5a5', color: '#ef4444', background: '#fef2f2' }}>Out of Stock</div>
        ) : (
          <button className="add-btn" onClick={quickAdd}>ADD +</button>
        )}
      </div>
    </div>
  );
}
