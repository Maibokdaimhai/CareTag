import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import ScanResult from './pages/ScanResult';

// 1. Component สำหรับดักจับการ Redirect จาก LINE (liff.state)
const LiffRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const liffState = params.get('liff.state');
    
    // หาก LINE ส่งตัวแปร liff.state=/register มา ให้รีบดีดไปหน้านั้นทันที
    if (liffState) {
      console.log("LIFF Redirect detected, moving to:", liffState);
      navigate(liffState, { replace: true });
    }
  }, [location, navigate]);

  // หากไม่มีการ Redirect ให้แสดงหน้า LoginPage เป็นหน้าแรกปกติ
  return <LoginPage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้าแรก (/) ใช้ LiffRedirectHandler ทำหน้าที่สองอย่าง:
          1. ถ้าเพิ่งกลับมาจาก LINE ให้พาไปหน้า Register
          2. ถ้ามาแบบปกติ ให้โชว์หน้า Login
        */}
        <Route path="/" element={<LiffRedirectHandler />} /> 
        
        {/* เส้นทางอื่นๆ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* หน้าสแกนที่เป็น Public */}
        <Route path="/scan/:tag_id" element={<ScanResult />} />
      </Routes>
    </BrowserRouter>  
  );
}

export default App;