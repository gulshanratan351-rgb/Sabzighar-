import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { FALLBACK_IMG } from '../utils/format.js';

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data.categories);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader full />;

  const extra = [{ _id: 'offers', name: 'Offers', slug: 'offers', icon: '🎁' }];

  return (
    <div>
      <header className="header">
        <div className="brand">All Categories</div>
      </header>
      <div className="page">
        <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[...categories, ...extra].map((c) => (
            <div key={c._id} className="cat-item" onClick={() => navigate(`/category/${c.slug}`)}>
              <div className="cat-ic">{c.image ? <img src={c.image} alt={c.name} onError={(e)=>{e.target.src=FALLBACK_IMG;}} /> : c.icon || '🥬'}</div>
              <p>{c.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
