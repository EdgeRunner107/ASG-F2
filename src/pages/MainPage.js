import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // 모달 접근성 설정

function MainPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [rounds, setRounds] = useState([]);
  const [names, setNames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const openPasswordModal = () => {
    setIsModalOpen(true);
  };

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

  useEffect(() => {
    axios.get(`https://asg-b2.onrender.com/a`)
      .then(response => {
        const result = response.data;
        setData(result);

        const uniqueRounds = Array.from(
          new Set(result.map(item => (item[7] || '').trim()).filter(Boolean))
        );
        setRounds(uniqueRounds);
      })
      .catch(error => console.error('API 호출 오류:', error));
  }, []);

  useEffect(() => {
    if (!selectedRound) {
      setNames([]);
      return;
    }
    const roundFiltered = data.filter(item => (item[7] || '').trim() === selectedRound);
    const uniqueNames = Array.from(new Set(
        roundFiltered
          .map(item => (item[4] || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim())
          .filter(name => name && !name.includes('멤버')) // '멤버' 포함된 이름 제거
      ));
    setNames(uniqueNames);
  }, [selectedRound, data]);

  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
  };

  const handleRoundChange = (e) => {
    setSelectedRound(e.target.value);
    setSelectedName('');
  };

  const filteredDataFinal = data.filter(item => {
    const roundMatch = selectedRound ? (item[7] || '').trim() === selectedRound : true;
    const nameMatch = selectedName ? (item[4] || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim() === selectedName : true;
    return roundMatch && nameMatch;
  });

  const donatorSummary = {};
  const mootList = {};
  filteredDataFinal.forEach(item => {
    const donator = item[1];
    const score = Number(item[2]?.replace(/[^0-9]/g, '')) || 0;
    const tag = item[5];
    if (!donator) return;
    if (tag?.includes('묻') && tag !== '묻먹음') {
      mootList[donator] = (mootList[donator] || 0) + score;
    } else {
      donatorSummary[donator] = (donatorSummary[donator] || 0) + score;
    }
  });

  const totalScore = filteredDataFinal.reduce((sum, item) => sum + (Number(item[6]) || 0), 0);

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
         <AdminButton onClick={openPasswordModal}>
            관리자 페이지 로그인
            </AdminButton>
        </Header>
        <h1 style={{ textAlign: 'center' }}>ASG Score Board</h1>

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

        <h2>Result</h2>

        {selectedName !== '' && Object.entries(donatorSummary).length > 0 && (
          <>
            <h3>선물 리스트</h3>
            <Table>
              <thead>
                <tr><th>Donator</th><th>Score</th></tr>
              </thead>
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
                  <tr key={index} style={{ backgroundColor: '#ffe0eb' }}>
                    <td>{donator}</td><td>{total.toLocaleString()}개</td>
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
            <tr><th>Time</th><th>Donator</th><th>Score</th><th>text</th><th>Name</th></tr>
          </thead>
          <tbody>
            {filteredDataFinal.map((row, index) => {
              const tag = row[5];
              const isMootMeogeum = tag === '묻먹음';
              const isMootOnly = tag?.includes('묻') && tag !== '묻먹음';
              const rowStyle = isMootMeogeum ? { backgroundColor: 'lightblue' } : isMootOnly ? { backgroundColor: '#ffe0eb' } : {};
              return (
                <tr key={index} style={rowStyle}>
                  <td>{parseDateFromString(row[0])}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]?.length > 10 ? `${row[3].slice(0, 10)}...` : row[3]}</td>
                  <td>{row[4]}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Layout>
      <Modal
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  style={{
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '30px',
      width: '300px',
      borderRadius: '8px'
    }
  }}
>
  <h2>비밀번호 입력</h2>
  <input
    type="password"
    value={passwordInput}
    onChange={(e) => setPasswordInput(e.target.value)}
    style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
  />
  <button onClick={handlePasswordSubmit} style={{ marginRight: '10px' }}>
    확인
  </button>
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
  justify-content: flex-end;
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
