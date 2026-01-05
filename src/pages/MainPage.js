import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');


function MainPage() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const [selectedRound, setSelectedRound] = useState('');
    const [rounds, setRounds] = useState([]);
    const [names, setNames] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
   const [hideHeader, setHideHeader] = useState(false);
   const [lastScrollY, setLastScrollY] = useState(0);

   useEffect(() => {
  const handleScroll = () => {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 50) {
      // 🔽 스크롤 내리는 중 → 숨김
      setHideHeader(true);
    } else {
      // 🔼 스크롤 올리는 중 → 보임
      setHideHeader(false);
    }

    setLastScrollY(currentY);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);


    const openPasswordModal = () => setIsModalOpen(true);
    const closeModal = () => {
    setPasswordInput('');
    setIsModalOpen(false);
    };
  const handlePasswordSubmit = () => {
    if (passwordInput === 'AK47') {
      window.location.href = '/Superior';
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
    closeModal();
  };
  
 const fetchSheetData = (sheetKey) => {
  setIsLoading(true);
  axios.get(`https://asg-b2.onrender.com/${sheetKey}`)
    .then(response => {
      const result = response.data;
      setData(result);
      // 회차 인덱스를 8로 변경
      const uniqueRounds = Array.from(
        new Set(result.map(item => (item[8] || '').trim()).filter(Boolean))
      );
      setRounds(uniqueRounds);
      setIsDataLoaded(true);
    })
    .catch(error => console.error('API 호출 오류:', error))
    .finally(() => setIsLoading(false));
};

  const handleLoadData = () => fetchSheetData('a');
  const handleLoadExcel = () => fetchSheetData('b');
  const handleLoadRookie= () => fetchSheetData('c');
  const handleLoadMusic = () => fetchSheetData('d');

  useEffect(() => {
    if (!selectedRound) {
      setNames([]);
      return;
    }
    // 회차 필터 적용
  const roundFiltered = data.filter(item => (item[8] || '').trim() === selectedRound);
  const uniqueNames = Array.from(new Set(
    roundFiltered
      .map(item => (item[4] || '').replace(/[​-‍﻿]/g, '').trim())
      .filter(name => name && !name.includes('멤버'))
  ));
  setNames(uniqueNames);
  }, [selectedRound, data]);

  const handleNameChange = (e) => setSelectedName(e.target.value);
  const handleRoundChange = (e) => {
    setSelectedRound(e.target.value);
    setSelectedName('');
  };

  const filteredDataFinal = data.filter(item => {
  const roundMatch = selectedRound ? (item[8] || '').trim() === selectedRound : true;
  const nameMatch = selectedName ? (item[4] || '').replace(/[​-‍﻿]/g, '').trim() === selectedName : true;
  return roundMatch && nameMatch;
});

 const donatorSummary = {};
const mootList = {};
const maList = {}; // ✅ 새로 추가

filteredDataFinal.forEach(item => {
  const donator = item[1];
  const score = Number(item[2]?.replace(/[^0-9]/g, '')) || 0;
  const tagMoot = item[5]; // 묻 관련
  const tagMa = item[6];   // 마 관련
  if (!donator) return;

  const isMoot = String(tagMoot).includes('묻') && String(tagMoot) !== '묻먹음';
  const isMa = String(tagMa).includes('마');

  // 묻 집계
  if (isMoot) {
    mootList[donator] = (mootList[donator] || 0) + score;
  }
  // 마 집계
  else if (isMa) {
    maList[donator] = (maList[donator] || 0) + score;
  }
  // 일반 선물 집계
  else {
    donatorSummary[donator] = (donatorSummary[donator] || 0) + score;
  }
});


// 합계 (7번 기준)
const totalScore = filteredDataFinal.reduce((sum, item) => sum + (Number(item[7]) || 0), 0);

  const parseDateFromString = (dateStr) => {
    if (typeof dateStr !== 'string') return '';
    const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return dateStr;
    const [_, year, month, day, hour, min, sec] = match.map(Number);
    const date = new Date(year, month, day, hour, min, sec);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };



  return (
   <div style={{ position: "relative", width: "100vw" }}>
      
      {/* 고정 배경 레이어 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${process.env.PUBLIC_URL + "/img/wall3.png"})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "#000",
          zIndex: 0,
        }}
      />
    
      {/* 로고 (화면 상단 중앙 고정) */}

      

      {/* 스크롤 가능한 실제 콘텐츠 */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "50px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
            minHeight: "calc(100vh - 140px)",
            overflow: "visible",
        }}
      >
        
      <div
        style={{
          width: "80%",
          maxWidth: "900px",
          background: "rgba(0,0,0,0.75)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",

          /* 모바일 화면에서 폭 제한 */
          maxWidth: "500px",
        }}
      >
                <img
  src={process.env.PUBLIC_URL + "/img/logo1.png"}
  alt="logo"
  style={{
    display: "block",
    margin: "0 auto",
    width: "180px",
    zIndex: 2
  }}
/>
        <AdminButton hide={hideHeader} onClick={openPasswordModal}>
        관리자 페이지 로그인
        </AdminButton>
            <h1 style={{ textAlign: 'center' }}>HM 엑셀부</h1>
            
             <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {!isDataLoaded && !isLoading && (
            <>
              
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handleLoadMusic} style={groupButtonStyle}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#33ff33be")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#333333ff")}>
                 HM 엑셀부 시즌 1</button>

                
                
              </div>
            </>
          )}
          {isLoading && (
            <div style={{ marginTop: '10px' }}>
              <Spinner />
           
            </div>
          )}
          {isDataLoaded && !isLoading && (
            <p style={{ fontWeight: 'bold', color: 'green' }}>✔ 데이터가 로드되었습니다</p>
          )}
        </div>
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",   // ⬅ 중앙 정렬
    gap: "16px",            // ⬅ 선택 박스 간 간격
    width: "100%",          // 전체 기준
    marginTop: "20px"
  }}
>
  <StyledSelect value={selectedRound} onChange={handleRoundChange}>
    <option value="">회차 조회</option>
    {rounds.map((round, index) => (
      <option key={index} value={round}>{round}</option>
    ))}
  </StyledSelect>

  {selectedRound && (
    <StyledSelect value={selectedName} onChange={handleNameChange}>
      <option value="">전체</option>
      {names.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </StyledSelect>
  )}
</div>

         {selectedName !== '' && Object.entries(donatorSummary).length > 0 && (
          <>
            <h3>선물 리스트</h3>
          
            <Table>
              <thead><tr><th>Donator</th><th>Score</th></tr></thead>
              <tbody>
                {Object.entries(donatorSummary).sort(([, a], [, b]) => b - a).map(([donator, total], index) => (
                  <tr key={index}><td>{donator}</td><td>{total.toLocaleString()}개</td></tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
        {selectedName !== '' && Object.entries(mootList).length > 0 && (
          <>
            <h3 style={{ marginTop: '20px' }}>묻 리스트</h3>
            <Table>
              <thead><tr><th>Donator</th><th>Score</th></tr></thead>
              <tbody>
                {Object.entries(mootList).sort(([, a], [, b]) => b - a).map(([donator, total], index) => (
                  <tr key={index} style={{ backgroundColor: '#f5eb62b0' }}>
                    <td>{donator}</td><td>{total.toLocaleString()}개</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
        {selectedName !== '' && Object.entries(maList).length > 0 && (
          <>
            <h3 style={{ marginTop: '20px' }}>마이너스 리스트</h3>
            <Table>
              <thead><tr><th>Donator</th><th>Minus</th></tr></thead>
              <tbody>
                {Object.entries(maList)
                  .sort(([, a], [, b]) => b - a)
                  .map(([donator, total], index) => (
                  <tr key={index} style={{ backgroundColor: '#fc76a560' }}>
                    <td>{donator}</td>
                    <td>-{total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}


        {selectedName !== '' && (
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            <strong>Total :</strong> {totalScore}
          </p>
        )}
    <Table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Donator</th>
          <th>Score</th>
          <th>Text</th>
          <th>Name</th>
          <th>묻</th>
          <th>마</th>
        </tr>
      </thead>
      <tbody>
        {filteredDataFinal.map((row, index) => {
          const tag = row[5];
          const tagMa = row[6];  
          const isMa = typeof tagMa === 'string' && tagMa.includes('마'); // ✅ 안전하게 체크
          
          const isMootMeogeum = tag === '묻먹음';
          const isMootOnly = tag?.includes('묻') && tag !== '묻먹음';
          const rowStyle = isMootMeogeum
            ? { backgroundColor: 'lightblue' }
            : isMootOnly
            ? { backgroundColor: '#f5eb62b0' } 
            : isMa
            ? { backgroundColor: '#fc76a560' }     // 빨간색  
            : {};
          return (
            <tr key={index} style={rowStyle}>
              <td>{parseDateFromString(row[0])}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{row[3]?.length > 10 ? `${row[3].slice(0, 10)}...` : row[3]}</td>
              <td>{row[4]}</td>
              <td>{row[5]}</td>
              <td>{row[6]}</td> {/* 새 Minus 컬럼 */}
            </tr>
          );
        })}
      </tbody>
    </Table>
       

          
        </div>
      </div>
      
           {/* 비밀번호 입력 모달 */}
<Modal
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  onAfterOpen={() => (document.body.style.overflow = "hidden")}
  onAfterClose={() => (document.body.style.overflow = "auto")}
  style={{
    content: {
      width: "300px",
      height: "200px",
      margin: "auto",
      padding: "20px",
      background: "#222",
      color: "#fff",
      borderRadius: "10px",
      border: "1px solid #444",
      overflow: "hidden",   // ⭐ 모달 내부 스크롤 제거
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 9999,
      overflow: "hidden",   // ⭐ 오버레이 스크롤 제거
    }
  }}
>
  <h2 style={{ textAlign: "center" }}>비밀번호 입력</h2>

  <input
    type="password"
    value={passwordInput}
    onChange={(e) => setPasswordInput(e.target.value)}
    style={{
      width: "100%",
      marginTop: "20px",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #444",
      background: "#333",
      color: "white",
    }}
  />

  <button
    onClick={handlePasswordSubmit}
    style={{
      width: "100%",
      marginTop: "20px",
      padding: "10px",
      background: "#0099ff",
      border: "none",
      borderRadius: "6px",
      color: "white",
      cursor: "pointer",
    }}
  >
    확인
  </button>
</Modal>

    </div>
  );
}

export default MainPage;



const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
  }
  th {
    background-color: #222222ff;
  }
`;

const StyledSelect = styled.select`
  width: 300px;       /* 원하는 만큼 조절 가능 */
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #ffffffdd;
  color: #000;
  outline: none;

  &:focus {
    border-color: #45ee3fff;
  }
`;

const groupButtonStyle = {
  padding: '8px 16px',
  fontSize: '0.95rem',
  backgroundColor: '#333333ff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  
  
};


const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div style={{
      width: '30px',
      height: '30px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #48ff00ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const AdminButton = styled.button`
  margin-top: 10px;
  display: block;
  margin-left: auto;   /* 오른쪽 정렬 효과 */
  margin-right: 0;

  background-color: #333333ff;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background-color: #33ff33be;
  }
`;

