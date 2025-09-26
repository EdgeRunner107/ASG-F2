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

  // 묻 집계
  if (String(tagMoot).includes('묻') && String(tagMoot) !== '묻먹음') {
    mootList[donator] = (mootList[donator] || 0) + score;
  } else {
    donatorSummary[donator] = (donatorSummary[donator] || 0) + score;
  }

  // 마 집계
  if (String(tagMa).includes('마')) {
    maList[donator] = (maList[donator] || 0) + score;
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
    <Page>
      <Layout>
       <Header>
  <HomeButton onClick={() => window.location.reload()}>🏠</HomeButton>
  <AdminButton onClick={openPasswordModal}>관리자 페이지 로그인</AdminButton>
</Header>

        <h1 style={{ textAlign: 'center' }}>ASG Score Board</h1>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {!isDataLoaded && !isLoading && (
            <>
              
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handleLoadExcel} style={groupButtonStyle}>엑셀부</button>
                
                
              </div>
            </>
          )}
          {isLoading && (
            <div style={{ marginTop: '10px' }}>
              <Spinner />
              <p style={{ fontWeight: 'bold', color: 'orange' }}>⏳ 불러오는 중...</p>
            </div>
          )}
          {isDataLoaded && !isLoading && (
            <p style={{ fontWeight: 'bold', color: 'green' }}>✔ 데이터가 로드되었습니다</p>
          )}
        </div>

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
                  <tr key={index} style={{ backgroundColor: '#f8e602' }}>
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
                  <tr key={index} style={{ backgroundColor: '#ffe0eb' }}>
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
          <th>묻/태그</th>
          <th>Minus</th>
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
            ? { backgroundColor: '#f8e602' } 
            : isMa
            ? { backgroundColor: '#ffe0eb' }     // 빨간색  
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
      </Layout>

      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={{ content: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '30px', width: '300px', borderRadius: '8px' } }}>
        <h2>비밀번호 입력</h2>
        <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '12px' }} />
        <button onClick={handlePasswordSubmit} style={{ marginRight: '10px' }}>확인</button>
        <button onClick={closeModal}>취소</button>
      </Modal>
    </Page>
  );
}

export default MainPage;

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #e9e9e9;
`;

const Layout = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  height: 100%;
  max-height: 920px;
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const StyledSelect = styled.select`
  font-size: 1.0rem;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;  /* 좌우 끝 정렬 */
  align-items: center;
  padding: 10px 20px;
  box-sizing: border-box;
`;
const AdminButton = styled.button`
  background-color: #333;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    background-color: #555;
  }
`;

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
    background-color: #f5f5f5;
  }
`;

const loadButtonStyle = {
  padding: '10px 20px',
  fontSize: '1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

const groupButtonStyle = {
  padding: '8px 16px',
  fontSize: '0.95rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};
const HomeButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;


const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div style={{
      width: '30px',
      height: '30px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);