import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Superior from './pages/Superior';
import Tes from './pages/Tes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/main" />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/Superior" element={<Superior />} />
        <Route path="/Tes" element={<Tes />} />
        <Route path="*" element={<div>404: 페이지를 찾을 수 없습니다</div>} />
      </Routes>
    </Router>
  );
}

export default App;
