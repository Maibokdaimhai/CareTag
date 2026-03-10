import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import ScanResult from './pages/ScanResult';

const LiffRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // ถ้าเจอ liff.state ใน URL ให้เด้งไปหน้านั้นทันที
    const liffState = params.get('liff.state');
    if (liffState) {
      navigate(liffState, { replace: true });
    }
  }, [location, navigate]);

  return <LoginPage />; // ถ้าไม่มี state อะไร ให้โชว์หน้า Login ตามปกติ
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiffRedirectHandler />} /> 

        
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/scan/:tag_id" element={<ScanResult />} />
      </Routes>
    </BrowserRouter>  
  );
}

export default App;