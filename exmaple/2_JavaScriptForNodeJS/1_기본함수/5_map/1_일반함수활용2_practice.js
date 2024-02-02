//배열 생성
const number=[1,1,2,3,5];

//배열의 값의 제곱의 값을 다시 배열로 받고 싶다.
// say, [1,1,2,9,25]


//const newNumber=[];

function getSqure(num) {
    return num*num;

}
// for(let k=0;k<number.length;k++) {
//     newNumber.push( getSqure(number[k]));
//   새로운 배열을 추가한다.
//
// }


const newNumbers=number.map(getSqure);



console.log(`원본 배열:${number}`);
console.log(`제곱한 배열:${newNumber}`);