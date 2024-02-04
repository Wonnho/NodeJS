// 수동으로 5개의 상품 정보 객체 생성
var products = [
    {
        name: '상품1',
        averageRating: 4.25,
    },
    {
        name: '상품2',
        averageRating: 3.8,
    },
    {
        name: '상품3',
        averageRating: 4.5,
    },
    {
        name: '상품4',
        averageRating: 4.0,
    },
    {
        name: '상품5',
        averageRating: 4.75,
    },
];

// 평점에 따라 정렬
products.sort((a, b) => b.averageRating - a.averageRating);

// 정렬된 상품 정보 출력
console.log("평점별로 정렬된 상품 정보:", products);
