import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import api from '../api/client.js';

// value: array of image URLs. onChange(urls)
export default function ImageUploader({ value = [], onChange, multiple = true }) {
  const [busy, setBusy] = useState(false);

  const upload = async (files) => {
    if (!files.length) return;
    setBusy(true);
    const fd = new FormData();
    [...files].forEach((f) => fd.append('images', f));
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(multiple ? [...value, ...data.urls] : [data.urls[0]]);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (url) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
        <FiUploadCloud /> {busy ? 'Uploading...' : 'Upload Image'}
        <input type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      </label>
      <div className="thumbs">
        {value.map((url) => (
          <div key={url} style={{ position: 'relative' }}>
            <img src={url} alt="" />
            <button
              type="button"
              onClick={() => remove(url)}
              style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiX size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
