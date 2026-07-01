import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="center-screen">
      <img
        className="welcome-hero"
        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
        alt="Fresh vegetables"
      />
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Fresh Groceries Delivered</h1>
      <p className="muted" style={{ marginTop: 8, marginBottom: 28 }}>
        Order fresh vegetables, fruits & dairy at the best prices — delivered straight to your ghar.
      </p>
      <button className="btn" onClick={() => navigate('/signup')}>
        Get Started
      </button>
      <button className="btn btn-outline mt" onClick={() => navigate('/login')}>
        I already have an account
      </button>
      <button className="link mt" style={{ background: 'none' }} onClick={() => navigate('/home')}>
        Skip & Browse
      </button>
    </div>
  );
}
