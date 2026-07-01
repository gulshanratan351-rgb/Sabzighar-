import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../api/client.js';
import HomeHeader from '../components/HomeHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { FALLBACK_IMG } from '../utils/format.js';

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({ categories: [], products: [], banners: [] });
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [cat, prod, ban, feat] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8&sort=popular'),
          api.get('/banners'),
          api.get('/products?featured=true&limit=6'),
        ]);
        setData({
          categories: cat.data.categories,
          products: prod.data.products,
          banners: ban.data.banners,
          featured: feat.data.products,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data.banners?.length) return undefined;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % data.banners.length), 3500);
    return () => clearInterval(t);
  }, [data.banners]);

  if (loading) return <Loader full />;

  const banner = data.banners?.[bannerIdx];

  return (
    <div>
      <HomeHeader />
      <div className="page">
        <div className="searchbar" onClick={() => navigate('/search')}>
          <FiSearch />
          <span>Search &quot;tomato&quot;, &quot;milk&quot;...</span>
        </div>

        {banner && (
          <>
            <div className="banner-wrap" onClick={() => banner.link && navigate(banner.link)}>
              <img src={banner.image} alt={banner.title} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
              <div className="banner-caption">
                <h3>{banner.title}</h3>
                <p>{banner.subtitle}</p>
              </div>
            </div>
            <div className="banner-dots">
              {data.banners.map((b, i) => (
                <i key={b._id} className={i === bannerIdx ? 'active' : ''} />
              ))}
            </div>
          </>
        )}

        <div className="section-title">
          Shop by Category <a onClick={() => navigate('/categories')}>See all</a>
        </div>
        <div className="cat-grid">
          {data.categories.map((c) => (
            <div key={c._id} className="cat-item" onClick={() => navigate(`/category/${c.slug}`)}>
              <div className="cat-ic">{c.image ? <img src={c.image} alt={c.name} /> : c.icon || '🥬'}</div>
              <p>{c.name}</p>
            </div>
          ))}
        </div>

        {data.featured?.length > 0 && (
          <>
            <div className="section-title">Featured Picks</div>
            <div className="product-grid">
              {data.featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}

        <div className="section-title">
          Popular Now <a onClick={() => navigate('/category/vegetables')}>See all</a>
        </div>
        <div className="product-grid">
          {data.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
