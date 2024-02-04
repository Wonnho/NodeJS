// 5개의 평점을 초기화한 배열 생성
var averageRating = [4.25, 3.8, 4.5, 4.0, 4.75];

// 오름차순으로 정렬한 결과 출력
var ascendingOrder = averageRating.slice().sort((a, b) => a - b);
console.log("오름차순 정렬:", ascendingOrder);

// 내림차순으로 정렬한 결과 출력
var descendingOrder = averageRating.slice().sort((a, b) => b - a);
console.log("내림차순 정렬:", descendingOrder);

console.log("원본 배열:"+averageRating);

