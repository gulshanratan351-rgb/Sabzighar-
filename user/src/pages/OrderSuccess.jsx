import { useParams, useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="center-screen">
      <div style={{ fontSize: 70 }}>✅</div>
      <h1 style={{ fontSize: 24, marginTop: 10 }}>Order Placed!</h1>
      <p className="muted mt">Your fresh groceries are on the way. You can track your order live.</p>
      <button className="btn mt" onClick={() => navigate(`/orders/${id}`, { replace: true })}>
        Track Order
      </button>
      <button className="btn btn-outline mt" onClick={() => navigate('/home', { replace: true })}>
        Continue Shopping
      </button>
    </div>
  );
}
