import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function BackHeader({ title, right }) {
  const navigate = useNavigate();
  return (
    <div className="back-header">
      <button onClick={() => navigate(-1)} aria-label="Back">
        <FiArrowLeft size={22} />
      </button>
      <span className="title">{title}</span>
      <div className="spacer" />
      {right}
    </div>
  );
}
