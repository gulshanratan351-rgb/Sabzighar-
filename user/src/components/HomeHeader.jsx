import { useNavigate } from 'react-router-dom';
import { FiBell, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomeHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  return (
    <>
      <header className="header">
        <div>
          <div className="brand">🥬 SabziGhar</div>
          <div className="tagline">Tazi Sabzi, Seedhe Ghar Tak</div>
        </div>
        <div className="header-actions">
          <span onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
            <FiBell />
          </span>
        </div>
      </header>
      <div className="location-bar" onClick={() => navigate('/location')} style={{ cursor: 'pointer' }}>
        <FiMapPin />
        <span>
          Deliver to <b>{defaultAddr ? `${defaultAddr.area}, ${defaultAddr.city}` : 'Select location'}</b>
        </span>
      </div>
    </>
  );
}
