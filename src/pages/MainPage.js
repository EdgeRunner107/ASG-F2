import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');


function MainPage() {
    // 서버에서 받아온 원본 시트 데이터입니다.
    const [data, setData] = useState([]);
    // 이전 필터링 구조에서 쓰던 상태값입니다. 현재 화면 계산은 filteredDataFinal을 사용합니다.
    const [filteredData, setFilteredData] = useState([]);
    // 사용자가 선택한 이름 필터입니다.
    const [selectedName, setSelectedName] = useState('');
    // 사용자가 선택한 회차 필터입니다.
    const [selectedRound, setSelectedRound] = useState('');
    // 서버 데이터에서 추출한 회차 목록입니다.
    const [rounds, setRounds] = useState([]);
    // 선택된 회차 안에서 추출한 이름 목록입니다.
    const [names, setNames] = useState([]);
    // 관리자 비밀번호 모달 표시 여부입니다.
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 관리자 모달에 입력 중인 비밀번호입니다.
    const [passwordInput, setPasswordInput] = useState('');
    // 데이터 요청 중 로딩 UI를 보여주기 위한 상태입니다.
    const [isLoading, setIsLoading] = useState(false);
    // 최초 데이터 로드 완료 여부입니다.
    const [isDataLoaded, setIsDataLoaded] = useState(false);
   // 스크롤 방향에 따라 관리자 버튼을 숨길지 결정합니다.
   const [hideHeader, setHideHeader] = useState(false);
   // 직전 스크롤 위치를 저장해서 현재 스크롤 방향을 판단합니다.
   const [lastScrollY, setLastScrollY] = useState(0);

   // 사용자가 아래로 스크롤하면 관리자 버튼을 숨기고, 위로 스크롤하면 다시 보여줍니다.
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


    // 관리자 페이지 이동 전에 비밀번호 입력 모달을 엽니다.
    const openPasswordModal = () => setIsModalOpen(true);
    // 모달을 닫을 때 입력값도 함께 초기화합니다.
    const closeModal = () => {
    setPasswordInput('');
    setIsModalOpen(false);
    };
  // 입력된 비밀번호가 맞으면 관리자 페이지로 이동합니다.
  const handlePasswordSubmit = () => {
    if (passwordInput === 'AK47') {
      window.location.href = '/Superior';
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
    closeModal();
  };
  
 // 선택한 버튼에 해당하는 시트 데이터를 서버에서 가져옵니다.
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

  // 각 버튼에서 사용할 서버 데이터 키입니다.
  const handleLoadData = () => fetchSheetData('a');
  const handleLoadExcel = () => fetchSheetData('b');
  const handleLoadRookie= () => fetchSheetData('c');
  const handleLoadMusic = () => fetchSheetData('d');

  // 회차가 바뀔 때마다 해당 회차에 포함된 이름 목록을 새로 만듭니다.
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

  // 이름 select 변경값을 저장합니다.
  const handleNameChange = (e) => setSelectedName(e.target.value);
  // 회차가 바뀌면 이전 이름 선택은 초기화합니다.
  const handleRoundChange = (e) => {
    setSelectedRound(e.target.value);
    setSelectedName('');
  };

  // 현재 선택된 회차와 이름에 맞는 행만 화면에 표시합니다.
  const filteredDataFinal = data.filter(item => {
  const roundMatch = selectedRound ? (item[8] || '').trim() === selectedRound : true;
  const nameMatch = selectedName ? (item[4] || '').replace(/[​-‍﻿]/g, '').trim() === selectedName : true;
  return roundMatch && nameMatch;
});

 // 일반, 묻, 마이너스 항목을 후원자별로 따로 합산합니다.
 const donatorSummary = {};
const mootList = {};
const maList = {}; // ✅ 새로 추가

// 화면에 표시 중인 행을 돌면서 후원자별 점수를 분류합니다.
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

  // Google Sheet Date(...) 문자열을 사람이 읽기 쉬운 날짜 형식으로 바꿉니다.
  const parseDateFromString = (dateStr) => {
    if (typeof dateStr !== 'string') return '';
    const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return dateStr;
    const [_, year, month, day, hour, min, sec] = match.map(Number);
    const date = new Date(year, month, day, hour, min, sec);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };



  // 배경, 로고, 필터, 집계표, 상세표, 관리자 모달을 렌더링합니다.
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
          {/* 데이터가 아직 로드되지 않았을 때만 부문 선택 버튼을 보여줍니다. */}
          {!isDataLoaded && !isLoading && (
            <>
              
              
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handleLoadExcel} style={groupButtonStyle}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#33ff33be")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#333333ff")}>
                 HM 엑셀부 시즌 4</button>

                
                
              </div>
                       <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handleLoadMusic} style={groupButtonStyle}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#33ff33be")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#333333ff")}>
                 HM 엑셀부 시즌 5</button>

                
                
              </div>


            </>
          )}
          {/* API 요청 중에는 로딩 스피너를 보여줍니다. */}
          {isLoading && (
            <div style={{ marginTop: '10px' }}>
              <Spinner />
           
            </div>
          )}
          {/* 데이터 로드가 끝난 뒤에는 완료 안내 문구를 보여줍니다. */}
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
{/* 회차 선택 드롭다운입니다. 선택 즉시 모바일 select 창을 닫기 위해 blur를 호출합니다. */}
<StyledSelect
  value={selectedRound}
  onChange={(e) => {
    handleRoundChange(e);
    e.target.blur(); // 👉 선택 후 즉시 select 창 닫힘
  }}
  onInput={(e) => {
    handleRoundChange(e);
    e.target.blur(); // 👉 모바일(iOS) 즉시 닫힘
  }}
>
  <option value="">회차 조회</option>
  {rounds.map((round, index) => (
    <option key={index} value={round}>{round}</option>
  ))}
</StyledSelect>

  {/* 회차가 선택된 뒤에만 이름 선택 드롭다운을 보여줍니다. */}
  {selectedRound && (
  <StyledSelect
  value={selectedName}
  onChange={(e) => {
    handleNameChange(e);
    e.target.blur();
  }}
  onInput={(e) => {
    handleNameChange(e);
    e.target.blur();
  }}
>
      <option value="">전체</option>
      {names.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </StyledSelect>
  )}
</div>

         {/* 일반 후원 점수 합산표입니다. */}
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
        {/* 묻 관련 점수 합산표입니다. */}
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
        {/* 마이너스 관련 점수 합산표입니다. */}
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


        {/* 이름이 선택되면 현재 필터 기준 총점을 보여줍니다. */}
        {selectedName !== '' && (
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            <strong>Total :</strong> {totalScore}
          </p>
        )}
    {/* 필터 조건에 맞는 원본 상세 행 목록입니다. */}
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
          // 태그 값에 따라 행 배경색을 다르게 적용합니다.
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


// 상세 내역과 합산 내역을 보여주는 공통 테이블 스타일입니다.
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  table-layout: fixed; /* 👉 셀 크기 고정 */

  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;

    /* 👉 글자가 너무 길어도 영역밖으로 절대 안 튐 */
    overflow: hidden;
    white-space: normal;     /* 여러 줄 허용 */
    word-break: break-word;  /* 긴 단어도 강제 줄바꿈 */
    text-overflow: ellipsis; /* 너무 길면 ... */
  }

  th {
    background-color: #222222ff;
  }

  /* 모바일에서 글자 자동 축소 */
  @media (max-width: 480px) {
    th, td {
      font-size: 0.75rem;
      padding: 6px;
    }
  }
`;


// 회차와 이름을 선택하는 드롭다운 공통 스타일입니다.
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

// 데이터 로드 버튼에 공통으로 적용하는 인라인 스타일입니다.
const groupButtonStyle = {
  padding: '8px 16px',
  fontSize: '0.95rem',
  backgroundColor: '#333333ff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  
  
};


// 데이터 로딩 중 표시되는 원형 스피너입니다.
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

// 관리자 로그인 모달을 여는 버튼입니다.
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
