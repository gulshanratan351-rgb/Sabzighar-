import { useNavigate } from 'react-router-dom';

export default function EmptyState({ icon = '🛒', title, text, actionLabel, actionTo }) {
  const navigate = useNavigate();
  return (
    <div className="empty">
      <div className="em-ic">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && (
        <button className="btn btn-sm" onClick={() => navigate(actionTo)}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
