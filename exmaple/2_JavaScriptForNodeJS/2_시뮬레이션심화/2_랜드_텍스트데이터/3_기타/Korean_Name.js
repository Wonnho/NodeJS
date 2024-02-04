// 성씨 목록
const surnames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];

// 남자 이름 목록
const maleNames = ["준호", "성민", "태영", "지훈", "우진", "동현", "재원", "민준", "시우", "영훈"];

// 여자 이름 목록
const femaleNames = ["지은", "서연", "예은", "다혜", "민지", "수빈", "가온", "지현", "채원", "하은"];

// 랜덤 성씨 선택
const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];

// 랜덤 이름 선택
const randomName = Math.random() < 0.5 ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];

// 전체 이름 생성
const fullName = randomSurname + randomName;

// 결과 출력
console.log("생성된 이름:", fullName);
