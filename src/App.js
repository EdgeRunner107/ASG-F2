import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Superior from './pages/Superior';
import Tes from './pages/Tes';
import YoutubeSuper from './pages/YoutubeSuper';

function App() {
  return (
    // 전체 페이지 라우팅을 관리하는 React Router 영역입니다.
    <Router>
      <Routes>
        {/* 기본 주소로 들어오면 메인 페이지로 이동합니다. */}
        <Route path="/" element={<Navigate to="/main" />} />
        {/* 사용자용 메인 조회 화면입니다. */}
        <Route path="/main" element={<MainPage />} />
        {/* 관리자 엑셀 업로드 화면입니다. */}
        <Route path="/Superior" element={<Superior />} />
        {/* 유튜브 엑셀 데이터를 구글시트 연동 서버로 업로드하는 관리자 화면입니다. */}
        <Route path="/YoutubeSuper" element={<YoutubeSuper />} />
        {/* 별도 테스트/조회 화면입니다. */}
        <Route path="/YoutubeA" element={<Tes />} />
     

        <Route path="*" element={<div>404: 페이지를 찾을 수 없습니다</div>} />
      </Routes>
    </Router>
  );
}

export default App;
