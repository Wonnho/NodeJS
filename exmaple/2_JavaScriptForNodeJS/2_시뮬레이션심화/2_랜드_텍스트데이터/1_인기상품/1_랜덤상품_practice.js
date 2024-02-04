
//5개의 인기 상품 배열
const popularProducts=['coffee Mixer2','Dyson','Styler','smart Moniter','MV5'];

//랜덤으로 인덱스 선택
//popularProducts의 배열이 증가할 수 있으므로 length를 응용
const randomIndex=Math.floor(Math.random()*popularProducts.length);




const recommend=popularProducts[randomIndex];

console.log((`recommendation product:${recommend}`));