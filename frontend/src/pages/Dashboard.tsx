import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2 className="card-title">Welcome, {user?.full_name}!</h2>
          <p className="card-description">
            This is your status page dashboard. Here you can manage your services and incidents.
          </p>
        </div>
      </div>
    </div>
  );
}