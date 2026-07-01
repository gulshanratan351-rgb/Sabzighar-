import { useEffect, useState, useRef } from 'react';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Search() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(q)}`);
        setResults(data.products);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [q]);

  return (
    <div>
      <div className="back-header">
        <button onClick={() => navigate(-1)}><FiArrowLeft size={22} /></button>
        <div className="searchbar" style={{ margin: 0, flex: 1 }}>
          <FiSearch />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." />
        </div>
      </div>
      <div className="page">
        {loading && <Loader />}
        {!loading && searched && results.length === 0 && (
          <EmptyState icon="🔍" title="No products found" text={`Nothing matches "${q}"`} />
        )}
        {!loading && !searched && (
          <p className="muted text-center mt">Type to search vegetables, fruits, dairy & more.</p>
        )}
        <div className="product-grid">
          {results.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
