import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import { inr, FALLBACK_IMG, productUnitLabel } from '../utils/format.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, count } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optIdx, setOptIdx] = useState(0);
  const [customGrams, setCustomGrams] = useState('');
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setRelated(data.related || []);
        setOptIdx(0);
        setQty(1);
        setImgIdx(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <Loader full />;
  if (!product) return null;

  const p = product;
  const isWeight = p.unitType === 'weight';
  const options = p.options?.length ? p.options : isWeight ? [{ label: '500 g', grams: 500 }] : [{ label: '1 pc', pieces: 1 }];
  const useCustom = optIdx === -1;
  const grams = useCustom ? Number(customGrams) : options[optIdx]?.grams || 0;
  const pieces = options[optIdx]?.pieces || 0;

  const packPrice = isWeight
    ? Math.round((p.price * grams) / 1000)
    : Math.round(p.price * pieces);
  const packMrp = isWeight ? Math.round((p.mrp * grams) / 1000) : Math.round(p.mrp * pieces);
  const outOfStock = p.stock <= 0;

  const handleAdd = async () => {
    if (isWeight && (!grams || grams <= 0)) return;
    const ok = await addToCart({
      productId: p._id,
      grams: isWeight ? grams : 0,
      pieces: isWeight ? 0 : pieces,
      quantity: qty,
      label: useCustom ? `${grams} g` : options[optIdx].label,
    });
    if (ok) setQty(1);
  };

  return (
    <div>
      <BackHeader
        title="Product"
        right={
          <button onClick={() => navigate('/cart')} className="icon-badge" style={{ fontSize: 22 }}>
            <FiShoppingCart />
            {count > 0 && <span>{count}</span>}
          </button>
        }
      />
      <div className="page">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ aspectRatio: 1, background: 'var(--green-lighter)' }}>
            <img
              src={p.images?.[imgIdx] || FALLBACK_IMG}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
          </div>
          {p.images?.length > 1 && (
            <div className="flex" style={{ padding: 10, overflowX: 'auto' }}>
              {p.images.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  onClick={() => setImgIdx(i)}
                  style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: i === imgIdx ? '2px solid var(--green)' : '1px solid var(--border)' }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt">
          <div className="flex">
            <h2 style={{ fontSize: 20, flex: 1 }}>{p.name}</h2>
            <span className="chip active" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <FiStar size={12} /> {p.rating}
            </span>
          </div>
          <p className="muted">{p.category?.name} · {productUnitLabel(p)}</p>
          {p.isOrganic && <span className="badge-org" style={{ position: 'static', display: 'inline-block', marginTop: 6 }}>ORGANIC</span>}

          <div className="price-row mt">
            <span className="sp" style={{ fontSize: 24 }}>{inr(packPrice)}</span>
            {packMrp > packPrice && <span className="mrp">{inr(packMrp)}</span>}
            {p.discount > 0 && <span className="link">{p.discount}% off</span>}
          </div>
          {outOfStock ? (
            <p className="oos-tag mt">Out of Stock</p>
          ) : (
            <p className="muted" style={{ fontSize: 12 }}>In stock</p>
          )}

          <div className="section-title">Select {isWeight ? 'Weight' : 'Quantity'}</div>
          <div className="opt-pills">
            {options.map((o, i) => (
              <button key={o.label} className={`opt-pill ${optIdx === i ? 'active' : ''}`} onClick={() => setOptIdx(i)}>
                {o.label}
              </button>
            ))}
            {isWeight && (
              <button className={`opt-pill ${useCustom ? 'active' : ''}`} onClick={() => setOptIdx(-1)}>
                Custom
              </button>
            )}
          </div>
          {useCustom && (
            <div className="field mt">
              <label>Custom weight (grams)</label>
              <input type="number" min={50} step={50} value={customGrams} onChange={(e) => setCustomGrams(e.target.value)} placeholder="e.g. 750" />
            </div>
          )}

          <div className="flex mt">
            <span style={{ fontWeight: 600 }}>Quantity (packs)</span>
            <div className="spacer" />
            <div className="qty-stepper" style={{ width: 110 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          {p.description && (
            <>
              <div className="section-title">Description</div>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{p.description}</p>
            </>
          )}

          {related.length > 0 && (
            <>
              <div className="section-title">You may also like</div>
              <div className="product-grid">
                {related.map((r) => (
                  <ProductCard key={r._id} product={r} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sticky-checkout">
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{inr(packPrice * qty)}</div>
        </div>
        <button className="btn" style={{ flex: 1 }} disabled={outOfStock} onClick={handleAdd}>
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
