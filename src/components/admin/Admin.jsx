import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import '../../styles/Admin.css';

const Admin = () => {
  const [token, setToken] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for existing token
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      // Verify token is still valid
      verifyToken(savedToken);
    } else {
      setIsChecking(false);
    }
  }, []);

  const verifyToken = async (savedToken) => {
    try {
      const response = await fetch('/api/admin?action=stats', {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      
      if (response.ok) {
        setToken(savedToken);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return <AdminDashboard token={token} onLogout={() => setToken(null)} />;
};

export default Admin;
