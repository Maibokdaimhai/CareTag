import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import ScanResult from './pages/ScanResult';

const LiffRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const liffState = params.get('liff.state');

    if (liffState) {
      navigate(liffState, { replace: true });
      return;
    }

    setCheckingRedirect(false);
  }, [location.search, navigate]);

  if (checkingRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return <LoginPage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiffRedirectHandler />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan/:tag_id" element={<ScanResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;