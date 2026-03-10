// App.jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan/:tag_id" element={<ScanResult />} />
        
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/" element={<LoginPage />} /> 
      </Routes>
    </BrowserRouter>  
  );
}