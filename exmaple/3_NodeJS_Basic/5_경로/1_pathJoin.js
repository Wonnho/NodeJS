const path = require('path');

// 디렉토리와 파일 이름을 조합하여 경로 생성
// __dirname: 현재 자바스크립트 파일이 있는 디렉토리 경로
// 인자에 있는 값을 path 형태로 연결하여 반환
console.log(__dirname);

const filePath = path.join(__dirname, 'images', 'photo.jpg');

// 결과 출력
//console.log(filePath);