
const PI=3.14592;
console.log(PI);

//PI=3.14 //const 값을 변경시 에러 발생
console.log(PI);

//declare and initialize const array
const numbers=[1,1,2];
console.log(numbers);

console.log(numbers[1]); //배열의 요소는 인덱스로 시각; 0부터 시작

numbers[1]=7;
console.log(numbers[1]);

//주의사항: const 배열의 개별 요소 재변경도 가능
numbers[1]=5;
console.log(numbers[1]);

//주의사항2:배열 전체를 다른 배열로 할당은 불가능
//numbers=[3,5,8];


