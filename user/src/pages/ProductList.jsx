import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const SORTS = [
  { key: 'new', label: 'Newest' },
  { key: 'priceLow', label: 'Price: Low' },
  { key: 'priceHigh', label: 'Price: High' },
  { key: 'popular', label: 'Popular' },
];

export default function ProductList() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let url = `/products?sort=${sort}`;
        if (slug === 'offers') {
          url += '&offers=true';
          setTitle('Offers');
        } else if (slug === 'organic') {
          url += '&category=organic';
          setTitle('Organic');
        } else {
          url += `&category=${slug}`;
          const cat = await api.get(`/categories/${slug}`).catch(() => null);
          setTitle(cat?.data?.category?.name || slug);
        }
        const { data } = await api.get(url);
        setProducts(data.products);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, sort]);

  return (
    <div>
      <BackHeader title={title} />
      <div className="page">
        <div className="chips">
          {SORTS.map((s) => (
            <button key={s.key} className={`chip ${sort === s.key ? 'active' : ''}`} onClick={() => setSort(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <EmptyState icon="🥬" title="No products here yet" text="Check back soon!" />
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
