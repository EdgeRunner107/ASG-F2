import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import * as XLSX from 'xlsx';
import axios from 'axios';

const YOUTUBE_UPLOAD_URL = 'https://asg-b2.onrender.com/upload-jsonc';

// A~I열 구조
const YOUTUBE_COLUMNS = [
  'time',      // A열
  'donator',   // B열
  'score',     // C열
  'text',      // D열
  'name',      // E열
  'type',      // F열
  'ma',        // G열
  'total',     // H열
  'round',     // I열
];

const EXCEL_COLUMN_INDEX = {
  nickname: 2,  // C 닉네임
  chat: 3,      // D 채팅
  streamer: 4,  // E 스트리머
  type: 5,      // F 종류
  count: 6,     // G 개수
  time: 10,     // K 시간
};

const normalizeCell = (cell) => {
  if (cell === undefined || cell === null || cell === '') return 0;
  return cell;
};

const formatExcelDate = (value) => {
  if (typeof value !== 'number') return value;

  const parsedDate = XLSX.SSF.parse_date_code(value);
  if (!parsedDate) return value;

  const pad = (number) => String(number).padStart(2, '0');
  return `${parsedDate.y}-${pad(parsedDate.m)}-${pad(parsedDate.d)} ${pad(parsedDate.H)}:${pad(parsedDate.M)}:${pad(parsedDate.S)}`;
};

function YoutubeSuper() {
  const [selectedRound, setSelectedRound] = useState('');
  const [showFileInput, setShowFileInput] = useState(false);
  const [jsonData, setJsonData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const youtubeRounds = useMemo(
    () => Array.from({ length: 10 }, (_, index) => `유튜브 ${index + 1}회차`),
    []
  );

  const handleRoundChange = (event) => {
    const round = event.target.value;

    setSelectedRound(round);
    setShowFileInput(Boolean(round));
    setUploadMessage('');
    setJsonData([]);
  };

  const mapYoutubeRow = (row) => {
    const score = row[EXCEL_COLUMN_INDEX.count];

    const mappedRow = [
      formatExcelDate(row[EXCEL_COLUMN_INDEX.time]), // A time
      row[EXCEL_COLUMN_INDEX.nickname],              // B donator
      score,                                         // C score
      row[EXCEL_COLUMN_INDEX.chat],                  // D text
      row[EXCEL_COLUMN_INDEX.streamer],              // E name
      row[EXCEL_COLUMN_INDEX.type],                  // F type
      '',                                            // G 마
      score,                                         // H total
      selectedRound,                                 // I round
    ];

    return mappedRow.map(normalizeCell);
  };

  const isHeaderRow = (row) => {
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    const thirdCell = String(row[2] || '').trim();

    return firstCell === '구분' || secondCell === '아이디' || thirdCell === '닉네임';
  };

  const hasAnyValue = (row) => (
    row.some((cell) => cell !== undefined && cell !== null && cell !== '')
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedRound) {
      alert('회차를 먼저 선택해 주세요.');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (loadEvent) => {
      try {
        setIsUploading(true);
        setUploadMessage('');

        if (!YOUTUBE_UPLOAD_URL) {
          throw new Error('YOUTUBE_UPLOAD_URL을 먼저 설정해 주세요.');
        }

        const data = loadEvent.target.result;
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const excelRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const cleanedRows = excelRows
          .filter(hasAnyValue)
          .filter((row, index) => index !== 0 || !isHeaderRow(row))
          .map(mapYoutubeRow);

        setJsonData(cleanedRows);

        const response = await axios.post(YOUTUBE_UPLOAD_URL, {
          columns: YOUTUBE_COLUMNS,
          round: selectedRound,
          data: cleanedRows,
        });

        console.log('유튜브 엑셀 업로드 결과:', response.data);
        setUploadMessage(`${selectedRound} 데이터 업로드가 완료되었습니다.`);
        alert('업로드 성공!');
      } catch (error) {
        console.error('유튜브 엑셀 업로드 실패:', error);
        setUploadMessage(error.message || '업로드에 실패했습니다.');
        alert('업로드 실패');
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Page>
      <Layout>
        <BackLink href="/YoutubeA">뒤로</BackLink>

        <Title>Youtube Admin Page</Title>
        <SectionTitle>유튜브 엑셀 업로드</SectionTitle>

        <SelectArea>
          <Label htmlFor="youtube-round-select">회차 선택</Label>
          <RoundSelect
            id="youtube-round-select"
            value={selectedRound}
            onChange={handleRoundChange}
          >
            <option value="">회차를 선택하세요</option>
            {youtubeRounds.map((round) => (
              <option key={round} value={round}>
                {round}
              </option>
            ))}
          </RoundSelect>
        </SelectArea>

        {showFileInput && (
          <UploadArea>
            <Label htmlFor="youtube-excel-upload">
              {selectedRound} 엑셀 파일 추가
            </Label>

            <FileInput
              type="file"
              id="youtube-excel-upload"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <HelperText>
              전송 구조: A time / B donator / C score / D text / E name / F type / G 마 / H total / I round
            </HelperText>
          </UploadArea>
        )}

        {isUploading && <StatusText>업로드 중입니다...</StatusText>}
        {uploadMessage && <StatusText>{uploadMessage}</StatusText>}

        {jsonData.length > 0 && (
          <Preview>
            <PreviewTitle>전송 데이터 미리보기</PreviewTitle>

            <PreviewTable>
              <thead>
                <tr>
                  {YOUTUBE_COLUMNS.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {jsonData.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </PreviewTable>
          </Preview>
        )}
      </Layout>
    </Page>
  );
}

export default YoutubeSuper;

const Page = styled.div`
  width: 100vw;
  min-height: 100vh;
  background-color: #e9e9e9;
`;

const Layout = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 760px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 48px 20px 28px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const BackLink = styled.a`
  position: absolute;
  top: 14px;
  left: 16px;
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 1.8rem;
`;

const SectionTitle = styled.h2`
  margin: 32px 0 0;
  text-align: center;
  font-size: 1.35rem;
`;

const SelectArea = styled.div`
  margin-top: 22px;
`;

const RoundSelect = styled.select`
  display: block;
  width: 100%;
  max-width: 360px;
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  color: #000;
  font-size: 1rem;
  cursor: pointer;
`;

const UploadArea = styled.div`
  margin-top: 28px;
`;

const Label = styled.label`
  display: inline-block;
  margin-bottom: 8px;
  font-weight: bold;
`;

const FileInput = styled.input`
  display: block;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const HelperText = styled.p`
  margin: 8px 0 0;
  color: #555;
  font-size: 0.9rem;
`;

const StatusText = styled.p`
  margin: 18px 0 0;
  font-weight: bold;
  color: #1f7a1f;
`;

const Preview = styled.div`
  margin-top: 28px;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1rem;
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    border: 1px solid #ccc;
    padding: 7px;
    text-align: center;
    font-size: 0.8rem;
    word-break: break-word;
  }

  th {
    background-color: #222;
    color: #fff;
  }
`;