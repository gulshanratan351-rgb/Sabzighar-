import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import { inr, FALLBACK_IMG } from '../utils/format.js';

const WEIGHT_PRESETS = [
  { label: '100 g', grams: 100 },
  { label: '250 g', grams: 250 },
  { label: '500 g', grams: 500 },
  { label: '1 kg', grams: 1000 },
];
const PIECE_PRESETS = [
  { label: '1 pc', pieces: 1 },
  { label: '2 pc', pieces: 2 },
  { label: '4 pc', pieces: 4 },
  { label: '6 pc', pieces: 6 },
];

const blank = {
  name: '', description: '', category: '', unitType: 'weight',
  mrp: '', price: '', stock: '', lowStockThreshold: '',
  images: [], isOrganic: false, isFeatured: false, isActive: true,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/products/admin/all'), api.get('/categories?all=1')]);
    setProducts(p.data.products);
    setCategories(c.data.categories);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...blank, category: categories[0]?._id || '' });
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, category: p.category?._id || p.category,
      unitType: p.unitType, mrp: p.mrp, price: p.price, stock: p.stock,
      lowStockThreshold: p.lowStockThreshold, images: p.images || [],
      isOrganic: p.isOrganic, isFeatured: p.isFeatured, isActive: p.isActive,
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const options = form.unitType === 'weight' ? WEIGHT_PRESETS : PIECE_PRESETS;
    const payload = { ...form, options };
    try {
      if (editing) await api.put(`/products/${editing._id}`, payload);
      else await api.post('/products', payload);
      toast.success(editing ? 'Product updated' : 'Product added');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="Products">
      <div className="toolbar">
        <input className="search-input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="spacer" />
        <button className="btn" onClick={openNew}><FiPlus /> Add Product</button>
      </div>

      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Image</th><th>Name</th><th>Category</th><th>Unit</th><th>MRP</th><th>Price</th><th>Disc</th><th>Stock</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td><img className="thumb" src={p.images?.[0] || FALLBACK_IMG} alt="" onError={(e)=>{e.target.src=FALLBACK_IMG;}} /></td>
                    <td><b>{p.name}</b></td>
                    <td>{p.category?.name}</td>
                    <td>{p.unitType === 'weight' ? 'per kg' : 'per pc'}</td>
                    <td>{inr(p.mrp)}</td>
                    <td><b>{inr(p.price)}</b></td>
                    <td>{p.discount}%</td>
                    <td>
                      {p.stock <= 0 ? <span className="pill pill-red">Out</span>
                        : p.stock <= p.lowStockThreshold ? <span className="pill pill-amber">{p.stock}</span>
                        : <span className="pill pill-green">{p.stock}</span>}
                    </td>
                    <td>{p.isActive ? <span className="pill pill-green">Active</span> : <span className="pill pill-red">Hidden</span>}</td>
                    <td>
                      <div className="flex">
                        <button className="btn btn-sm btn-light" onClick={() => openEdit(p)}><FiEdit2 /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => del(p)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty">No products found</div>}
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Product' : 'Add Product'}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            </>
          }
        >
          <form onSubmit={save}>
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Unit Type</label>
                <select value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })}>
                  <option value="weight">Weight (gram/kg)</option>
                  <option value="piece">Piece (pcs)</option>
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>MRP ({form.unitType === 'weight' ? 'per kg' : 'per pc'})</label>
                <input type="number" required value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
              </div>
              <div className="field">
                <label>Selling Price ({form.unitType === 'weight' ? 'per kg' : 'per pc'})</label>
                <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Stock ({form.unitType === 'weight' ? 'grams' : 'pieces'})</label>
                <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="field">
                <label>Low Stock Alert ({form.unitType === 'weight' ? 'grams' : 'pieces'})</label>
                <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} placeholder={form.unitType === 'weight' ? '5000' : '20'} />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label>Product Photos</label>
              <ImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} />
            </div>
            <div className="flex">
              <label className="flex"><input type="checkbox" checked={form.isOrganic} onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })} /> Organic</label>
              <label className="flex"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
              <label className="flex"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
