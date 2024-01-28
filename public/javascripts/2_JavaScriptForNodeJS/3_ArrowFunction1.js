// 화살표 함수 (Arrow function)는 ECMAScript 6 (ES6)부터 도입된 새로운 함수 정의 문법입니다.
// 화살표 함수는 기존의 함수 선언문과 함수 표현식을 간결하게 표현할 수 있도록 도와 줍니다.
// 콜백함수(다른 함수에 전달되어 나중에 호출되는 함수)에서 주로 사용됨
// 뒤에서 다룰 예제를 위해 이 문법을 기억하세요

function  add1(x,y) {
    return x+y;
}

console.log(add1(111,22227));

const add2=(x,y)=>{
    return x+y;
}
console.log(  add2(3234,67567));

const  add3=(x,y)=>x+y;

console.log(add3(8788,234));

const add4=(x,y)=>(x+y);
console.log(add4(45552,9098.3));

