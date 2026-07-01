import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import { FALLBACK_IMG } from '../utils/format.js';

const blank = { name: '', icon: '', description: '', order: 0, image: '', isActive: true };

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get('/categories?all=1');
    setItems(data.categories);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c, image: c.image || '' }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) await api.put(`/categories/${editing._id}`, form);
      else await api.post('/categories', form);
      toast.success('Saved');
      setModal(false);
      load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const del = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c._id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <Layout title="Categories">
      <div className="toolbar"><div className="spacer" /><button className="btn" onClick={openNew}><FiPlus /> Add Category</button></div>
      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Image</th><th>Name</th><th>Icon</th><th>Order</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td>{c.image ? <img className="thumb" src={c.image} alt="" onError={(e)=>{e.target.src=FALLBACK_IMG;}} /> : <span style={{ fontSize: 24 }}>{c.icon}</span>}</td>
                    <td><b>{c.name}</b></td>
                    <td>{c.icon}</td>
                    <td>{c.order}</td>
                    <td>{c.isActive ? <span className="pill pill-green">Active</span> : <span className="pill pill-red">Hidden</span>}</td>
                    <td><div className="flex">
                      <button className="btn btn-sm btn-light" onClick={() => openEdit(c)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(c)}><FiTrash2 /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={save} disabled={busy}>Save</button></>}>
          <form onSubmit={save}>
            <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-grid">
              <div className="field"><label>Icon (emoji)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🥬" /></div>
              <div className="field"><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="field"><label>Image</label><ImageUploader multiple={false} value={form.image ? [form.image] : []} onChange={(urls) => setForm({ ...form, image: urls[0] || '' })} /></div>
            {editing && <label className="flex"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>}
          </form>
        </Modal>
      )}
    </Layout>
  );
}
