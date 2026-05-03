import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Tes() {
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
        setHideHeader(true);
      } else {
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
      window.location.href = '/YoutubeSuper';
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
    closeModal();
  };

  const fetchSheetData = (sheetKey) => {
    setIsLoading(true);

    axios.get(`https://asg-b2.onrender.com/${sheetKey}`)
      .then(response => {
        const result = Array.isArray(response.data) ? response.data : [];

        setData(result);

        const uniqueRounds = Array.from(
          new Set(
            result
              .map(item => String(item?.[8] ?? '').trim())
              .filter(Boolean)
          )
        );

        setRounds(uniqueRounds);
        setIsDataLoaded(true);
      })
      .catch(error => console.error('API 호출 오류:', error))
      .finally(() => setIsLoading(false));
  };

  const handleLoadData = () => fetchSheetData('a');
  const handleLoadExcel = () => fetchSheetData('b');
  const handleLoadRookie = () => fetchSheetData('c');
  const handleLoadMusic = () => fetchSheetData('d');

  useEffect(() => {
    if (!selectedRound) {
      setNames([]);
      return;
    }

    const roundFiltered = data.filter(
      item => String(item?.[8] ?? '').trim() === selectedRound
    );

    const uniqueNames = Array.from(new Set(
      roundFiltered
        .map(item => String(item?.[4] ?? '').replace(/[-‍﻿]/g, '').trim())
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
    const roundValue = String(item?.[8] ?? '').trim();
    const nameValue = String(item?.[4] ?? '').replace(/[-‍﻿]/g, '').trim();

    const roundMatch = selectedRound ? roundValue === selectedRound : true;
    const nameMatch = selectedName ? nameValue === selectedName : true;

    return roundMatch && nameMatch;
  });

  const parseAmount = (value) => {
    const numberValue = Number(String(value ?? '').replace(/[^0-9-]/g, ''));
    return Number.isNaN(numberValue) ? 0 : numberValue;
  };

  const getDonationType = (row) => {
    const typeValue = String(row?.[5] ?? '').trim();
    const subTypeValue = String(row?.[6] ?? '').trim();
    const combinedValue = `${typeValue} ${subTypeValue}`.toLowerCase();

    if (combinedValue.includes('계좌')) return '계좌후원';
    if (
      combinedValue.includes('투네') ||
      combinedValue.includes('toonation') ||
      combinedValue.includes('toon')
    ) {
      return '투네후원';
    }

    if (
      typeValue === '묻먹음' ||
      typeValue.includes('묻') ||
      subTypeValue.includes('마')
    ) {
      return '';
    }

    return typeValue;
  };

  const donatorSummary = {};
  const accountDonationSummary = {};
  const toonDonationSummary = {};

  filteredDataFinal.forEach(item => {
    const donator = String(item?.[1] ?? '').trim();
    const amount = parseAmount(item?.[2]);
    const donationType = getDonationType(item);

    if (!donator) return;

    donatorSummary[donator] = (donatorSummary[donator] || 0) + amount;

    if (donationType === '계좌후원') {
      accountDonationSummary[donator] = (accountDonationSummary[donator] || 0) + amount;
    }

    if (donationType === '투네후원') {
      toonDonationSummary[donator] = (toonDonationSummary[donator] || 0) + amount;
    }
  });

  const totalScore = filteredDataFinal.reduce((sum, item) => {
    return sum + parseAmount(item?.[2]);
  }, 0);

  const parseDateFromString = (dateStr) => {
    const value = String(dateStr ?? '');
    if (!value) return '';

    const match = value.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return value;

    const [_, year, month, day, hour, min, sec] = match.map(Number);
    const date = new Date(year, month, day, hour, min, sec);
    const pad = (n) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <div style={{ position: "relative", width: "100vw" }}>
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
            width: "min(900px, calc(100% - 24px))",
            maxWidth: "900px",
            background: "rgba(0,0,0,0.75)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxSizing: "border-box",
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

          <h1 style={{ textAlign: 'center' }}>HM 엔터</h1>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            {!isDataLoaded && !isLoading && (
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={handleLoadRookie}
                  style={groupButtonStyle}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#33ff33be")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#333333ff")}
                >
                  HM 엔터 시즌 1
                </button>
              </div>
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
                <thead>
                  <tr>
                    <th>Donator</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(donatorSummary)
                    .sort(([, a], [, b]) => b - a)
                    .map(([donator, total], index) => (
                      <tr key={index}>
                        <td>{donator}</td>
                        <td>{total.toLocaleString()}원</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          )}

          {selectedName !== '' && Object.entries(accountDonationSummary).length > 0 && (
            <>
              <h3 style={{ marginTop: '20px' }}>계좌후원 리스트</h3>
              <Table>
                <thead>
                  <tr>
                    <th>Donator</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(accountDonationSummary)
                    .sort(([, a], [, b]) => b - a)
                    .map(([donator, total], index) => (
                      <tr key={index}>
                        <td>{donator}</td>
                        <td>{total.toLocaleString()}원</td>
                      </tr>
                    ))}
                  <tr>
                    <td><strong>총합</strong></td>
                    <td>
                      <strong>
                        {Object.values(accountDonationSummary)
                          .reduce((sum, amount) => sum + amount, 0)
                          .toLocaleString()}
                        원
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}

          {selectedName !== '' && Object.entries(toonDonationSummary).length > 0 && (
            <>
              <h3 style={{ marginTop: '20px' }}>투네후원 리스트</h3>
              <Table>
                <thead>
                  <tr>
                    <th>Donator</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(toonDonationSummary)
                    .sort(([, a], [, b]) => b - a)
                    .map(([donator, total], index) => (
                      <tr key={index}>
                        <td>{donator}</td>
                        <td>{total.toLocaleString()}원</td>
                      </tr>
                    ))}
                  <tr>
                    <td><strong>총합</strong></td>
                    <td>
                      <strong>
                        {Object.values(toonDonationSummary)
                          .reduce((sum, amount) => sum + amount, 0)
                          .toLocaleString()}
                        원
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}

          {selectedName !== '' && (
            <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
              <strong>Total :</strong> {totalScore.toLocaleString()}원
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
                <th>종류</th>
               
              </tr>
            </thead>
            <tbody>
              {filteredDataFinal.map((row, index) => {
                const textValue = String(row?.[3] ?? '');
                const donationType = getDonationType(row);

                return (
                  <tr key={index}>
                    <td>{parseDateFromString(row?.[0])}</td>
                    <td>{String(row?.[1] ?? '')}</td>
                    <td>{String(row?.[2] ?? '')}</td>
                    <td>{textValue.length > 10 ? `${textValue.slice(0, 10)}...` : textValue}</td>
                    <td>{String(row?.[4] ?? '')}</td>
                    <td>{donationType}</td>
                  
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

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
            overflow: "hidden",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            overflow: "hidden",
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

export default Tes;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  table-layout: fixed;

  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    text-overflow: ellipsis;
  }

  th {
    background-color: #222222ff;
  }

  @media (max-width: 480px) {
    th, td {
      font-size: 0.75rem;
      padding: 6px;
    }
  }
`;

const StyledSelect = styled.select`
  font-size: 1.0rem;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
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
    <style>
      {`@keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
      }`}
    </style>
  </div>
);

const AdminButton = styled.button`
  margin-top: 10px;
  display: block;
  margin-left: auto;
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
