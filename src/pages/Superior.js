import React, { useState } from 'react';
import styled from '@emotion/styled';
import * as XLSX from 'xlsx';
import axios from 'axios';

function Superior() {
  // 업로드할 회차를 고른 뒤 파일 선택 input을 보여줄지 관리합니다.
  const [showFileInput, setShowFileInput] = useState(false);
  // 관리자가 선택한 회차명입니다. 엑셀 데이터의 회차 컬럼에도 함께 저장됩니다.
  const [selectedRound, setSelectedRound] = useState('');
  // 엑셀을 JSON 배열로 변환한 결과를 보관합니다.
  const [jsonData, setJsonData] = useState([]);

  // 회차 버튼을 누르면 선택한 회차를 저장하고 파일 업로드 UI를 엽니다.
  const handleRoundClick = (round) => {
    setSelectedRound(round);
    setShowFileInput(true);
  };

  // 엑셀 파일을 읽어서 서버가 받을 수 있는 JSON 배열로 변환한 뒤 업로드합니다.
  const handleFileChange = (e, uploadUrl) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      // FileReader가 파일을 다 읽은 뒤 실제 엑셀 파싱과 서버 전송을 처리합니다.
      reader.onload = (event) => {
        const data = event.target.result;
        // 첫 번째 시트를 기준으로 업로드 데이터를 만듭니다.
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // header: 1 옵션은 행/열 구조를 그대로 배열 형태로 변환합니다.
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

        // 선택된 회차에 맞는 API 주소로 변환된 데이터를 전송합니다.
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
  // 선택한 회차명 prefix에 따라 업로드할 서버 엔드포인트를 분기합니다.
  const getFileChangeHandler = () => {
    if (selectedRound.startsWith('엑셀부루키')) {
      return (e) => handleFileChange(e, 'https://asg-b2.onrender.com/upload-jsonc');
    } else if (selectedRound.startsWith('스타부')) {
      return (e) => handleFileChange(e, 'https://asg-b2.onrender.com/upload-jsonc');
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
        {/* 메인 화면으로 돌아가는 관리자 페이지 뒤로가기 링크입니다. */}
        <a href="/" style={{ position: 'absolute', top: 10, left: 10 }}>←</a>
        <h1 style={{ textAlign: 'center' }}>Admin Page</h1>

        <h1 style={{ textAlign: 'center' }}>엑셀부</h1>
        {/* 회차 선택 버튼 영역입니다. */}
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

        <h1 style={{ textAlign: 'center' }}>스타부</h1>
        <RoundButtonGroup>
          <RoundButton onClick={() => handleRoundClick(`스타부 직급전`)}>
            직급전
          </RoundButton>
          {Array.from({ length: 8 }, (_, i) => (
            <RoundButton key={i} onClick={() => handleRoundClick(`스타부${i + 1}회차`)}>
              {i + 1}회차
            </RoundButton>
          ))}
        </RoundButtonGroup>

        
        {/* 회차가 선택된 뒤에만 실제 엑셀 파일 선택 input을 노출합니다. */}
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
// 전체 관리자 페이지의 배경 레이아웃입니다.
const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #e9e9e9;
`;

// 중앙 정렬된 관리자 컨텐츠 컨테이너입니다.
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

// 현재 파일에서는 사용하지 않지만, 기본 버튼 스타일로 남겨둔 컴포넌트입니다.
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

// 파일 input 위에 표시되는 안내 라벨입니다.
const Label = styled.label`
  display: inline-block;
  margin-top: 20px;
  margin-bottom: 8px;
  font-weight: bold;
`;

// 엑셀 파일을 선택하는 input 스타일입니다.
const FileInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

// 회차 버튼들을 줄바꿈 가능한 그룹으로 배치합니다.
const RoundButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

// 개별 회차 선택 버튼 스타일입니다.
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
