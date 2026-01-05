import React, { useState } from 'react';
import styled from '@emotion/styled';
import * as XLSX from 'xlsx';
import axios from 'axios';

function Superior() {
  const [showFileInput, setShowFileInput] = useState(false);
  const [selectedRound, setSelectedRound] = useState('');
  const [jsonData, setJsonData] = useState([]);

  const handleRoundClick = (round) => {
    setSelectedRound(round);
    setShowFileInput(true);
  };

  const handleFileChange = (e, uploadUrl) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // 8번째 열(index 7)에 회차 정보 삽입
        jsonData = jsonData.map((row) => {
          row[8] = selectedRound;
          return row;
        });

        // 앞에서 9열까지만 유지 (0 ~ 8)
        jsonData = jsonData.map(row => row.slice(0, 9));

        // 빈 셀 0으로 대체
        jsonData = jsonData.map(row =>
          row.map(cell => (cell === undefined || cell === null ? 0 : cell))
        );

        setJsonData(jsonData);
        console.log("전송할 JSON:", jsonData);

        axios.post(uploadUrl, { data: jsonData })
          .then(res => {
            alert('업로드 성공!');
            console.log(res.data);
          })
          .catch(err => {
            alert('업로드 실패');
            console.error(err);
          });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // 파일 input onChange 핸들러 선택
  const getFileChangeHandler = () => {
    if (selectedRound.startsWith('엑셀부루키')) {
      return (e) => handleFileChange(e, 'https://asg-b2.onrender.com/upload-jsonc');
    } else if (selectedRound.startsWith('음악부')) {
      return (e) => handleFileChange(e, 'https://asg-b2.onrender.com/upload-jsond');
    } else if (selectedRound.startsWith('엑셀부')) {
      return (e) => handleFileChange(e, 'https://asg-b2.onrender.com/upload-jsond');
    } else {
      // 기본값 (안 쓰일 듯)
      return (e) => handleFileChange(e, 'https://asg-b2.onrender.com/upload-json');
    }
  };

  return (
    <Page>
      <Layout>
        <a href="/" style={{ position: 'absolute', top: 10, left: 10 }}>←</a>
        <h1 style={{ textAlign: 'center' }}>Admin Page</h1>

        <h1 style={{ textAlign: 'center' }}>엑셀부</h1>
        <RoundButtonGroup>
          <RoundButton onClick={() => handleRoundClick(`엑셀부 직급전`)}>
            직급전
          </RoundButton>
          {Array.from({ length: 8 }, (_, i) => (
            <RoundButton key={i} onClick={() => handleRoundClick(`엑셀부${i + 1}회차`)}>
              {i + 1}회차
            </RoundButton>
          ))}
        </RoundButtonGroup>

        <h1 style={{ textAlign: 'center' }}>Test</h1>
        <RoundButtonGroup>
          <RoundButton onClick={() => handleRoundClick(`음악부 직급전`)}>
            직급전
          </RoundButton>
          {Array.from({ length: 8 }, (_, i) => (
            <RoundButton key={i} onClick={() => handleRoundClick(`음악부${i + 1}회차`)}>
              {i + 1}회차
            </RoundButton>
          ))}
        </RoundButtonGroup>

        
        {showFileInput && (
          <>
            <Label htmlFor="excel-upload">{selectedRound} 엑셀 파일 추가</Label>
            <FileInput
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              onChange={getFileChangeHandler()}
            />
          </>
        )}
      </Layout>
    </Page>
  );
}

export default Superior;

// 스타일 컴포넌트
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

const Button = styled.button`
  padding: 10px 20px;
  margin: 12px 0;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #555;
  }
`;

const Label = styled.label`
  display: inline-block;
  margin-top: 20px;
  margin-bottom: 8px;
  font-weight: bold;
`;

const FileInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const RoundButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const RoundButton = styled.button`
  background-color: #87ceeb;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 1rem;
  color: #000;

  &:hover {
    background-color: #6cbfe0;
  }
`;
