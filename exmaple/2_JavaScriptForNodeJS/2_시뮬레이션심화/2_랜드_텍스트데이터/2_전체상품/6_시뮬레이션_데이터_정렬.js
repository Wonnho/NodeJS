// 상품 정보를 담을 배열 생성
var products = [];
const MAX_PRODUCT_NUMBER =  1000;
// 상품1부터 상품100까지 반복
for (let i = 1; i <= MAX_PRODUCT_NUMBER; i++) {
    // 각 상품에 대한 객체 생성
    var product = {
        name: '상품' + i,
        averageRating: calculateAverageRating(), // 평균 평점 계산 함수 호출
    };

    // 상품 정보를 배열에 추가
    products.push(product);
}

// 평균 평점을 계산하는 함수
function calculateAverageRating() {
    // 임의로 1부터 5까지의 랜덤한 평점을 생성하고 소수점 2자리까지 제한
    return parseFloat((Math.random() * (5 - 1) + 1).toFixed(2));
}

// 상품을 평점에 따라 내림차순으로 정렬
products.sort((a, b) => b.averageRating - a.averageRating);

// 상위 5개 상품을 추천상품으로 출력
var top5Recommendations = products.slice(0, 5);
console.log("Top 5 추천상품:", top5Recommendations);
