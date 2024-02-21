// Map은 JavaScript에서 키-값 쌍을 저장하는 자료 구조입니다. 이는 키(key)를 기반으로 한 빠른 검색과 정렬이 가능하다.
const myMap = new Map();

myMap.set(1001,"사과");
myMap.set(2001,"바나나");
myMap.set(3004,"귤");

console.log(myMap.get(1001));
console.log(myMap.get(2001));
console.log(myMap.get(3004));
