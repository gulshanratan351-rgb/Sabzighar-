import { useEffect, useState } from 'react';
import { FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to My Orders and tap any order to see live status updates.' },
  { q: 'What payment methods are supported?', a: 'We support Cash on Delivery (COD) and UPI payments.' },
  { q: 'Can I cancel my order?', a: 'Yes, you can cancel before the order is out for delivery.' },
  { q: 'Is there a delivery charge?', a: 'Delivery is free above a minimum order value, otherwise a small charge applies.' },
  { q: 'How is weight-based pricing calculated?', a: 'Vegetables & fruits are priced per KG. You can order in 100g, 250g, 500g, 1kg or a custom weight.' },
];

export default function Help() {
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data.settings));
  }, []);

  return (
    <div>
      <BackHeader title="Help & Support" />
      <div className="page">
        <div className="card" style={{ padding: 16 }}>
          <h3>Need help?</h3>
          <p className="muted mt">Our support team is here for you.</p>
          <a href={`tel:${settings?.supportPhone || ''}`} className="menu-list" style={{ display: 'block', marginTop: 12 }}>
            <div className="flex" style={{ padding: '12px 4px' }}><FiPhone color="var(--green)" size={20} /> {settings?.supportPhone || '+91 90000 00000'}</div>
          </a>
          <a href={`mailto:${settings?.supportEmail || ''}`}>
            <div className="flex" style={{ padding: '12px 4px' }}><FiMail color="var(--green)" size={20} /> {settings?.supportEmail || 'support@sabzighar.com'}</div>
          </a>
          <a href={`https://wa.me/${(settings?.supportPhone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            <div className="flex" style={{ padding: '12px 4px' }}><FiMessageCircle color="var(--green)" size={20} /> Chat on WhatsApp</div>
          </a>
        </div>

        <div className="section-title">FAQs</div>
        <div className="card">
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <button style={{ padding: 14, width: '100%', textAlign: 'left', fontWeight: 600 }} onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
              </button>
              {open === i && <p className="muted" style={{ padding: '0 14px 14px' }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
