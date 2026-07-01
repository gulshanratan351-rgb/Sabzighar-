import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import { FALLBACK_IMG } from '../utils/format.js';

const blank = { title: '', subtitle: '', link: '', order: 0, image: '', isActive: true };

export default function Banners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = async () => { const { data } = await api.get('/banners?all=1'); setItems(data.banners); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...b }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.image) return toast.error('Banner image required');
    setBusy(true);
    try {
      if (editing) await api.put(`/banners/${editing._id}`, form);
      else await api.post('/banners', form);
      toast.success('Saved'); setModal(false); load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const del = async (b) => { if (!window.confirm('Delete banner?')) return; await api.delete(`/banners/${b._id}`); toast.success('Deleted'); load(); };

  return (
    <Layout title="Banners">
      <div className="toolbar"><div className="spacer" /><button className="btn" onClick={openNew}><FiPlus /> Add Banner</button></div>
      <div className="card">
        {loading ? <Loader /> : (
          <div className="stat-grid">
            {items.map((b) => (
              <div key={b._id} className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={b.image} alt="" style={{ width: '100%', aspectRatio: 2.3, objectFit: 'cover' }} onError={(e)=>{e.target.src=FALLBACK_IMG;}} />
                <div style={{ padding: 12 }}>
                  <b>{b.title}</b>
                  <div className="muted" style={{ fontSize: 13 }}>{b.subtitle}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{b.link}</div>
                  <div className="flex mt">
                    {b.isActive ? <span className="pill pill-green">Active</span> : <span className="pill pill-red">Hidden</span>}
                    <div className="spacer" />
                    <button className="btn btn-sm btn-light" onClick={() => openEdit(b)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(b)}><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="empty">No banners</div>}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Banner' : 'Add Banner'} onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={save} disabled={busy}>Save</button></>}>
          <form onSubmit={save}>
            <div className="field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="field"><label>Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div className="form-grid">
              <div className="field"><label>Link (e.g. /category/offers)</label><input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div className="field"><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="field"><label>Banner Image</label><ImageUploader multiple={false} value={form.image ? [form.image] : []} onChange={(urls) => setForm({ ...form, image: urls[0] || '' })} /></div>
            {editing && <label className="flex"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>}
          </form>
        </Modal>
      )}
    </Layout>
  );
}
