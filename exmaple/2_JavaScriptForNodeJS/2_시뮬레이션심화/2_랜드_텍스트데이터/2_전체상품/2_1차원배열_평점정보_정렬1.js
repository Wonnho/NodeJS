
//5개의 평점을 초기화한 배열
var averageRating = [4.25, 3.8, 4.5, 4.0, 4.75];

console.log(averageRating);
// 오름차순으로 정렬한 결과 출력
// sort 인자는 정렬 순서를 정의한 애로우 함수
// 결과가 음수이면 a가 b보다 앞에 오고, 양수이면 b가 a보다 앞에 오며, 0이면 순서가 변경되지 않습니다
// 정렬후 배열을 순서도 바뀐다.
averageRating.sort((a,b)=>a-b);

console.log(`오름차순 정렬:${averageRating}`);

var averageRating2=[4.25, 3.8, 4.5, 4.0, 4.75];
averageRating2.sort((a,b)=>b-a);

console.log(`내림차순 정렬:${averageRating2}`);