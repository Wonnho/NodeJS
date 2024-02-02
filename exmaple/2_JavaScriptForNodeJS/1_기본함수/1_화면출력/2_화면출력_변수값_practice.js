
//덧셈 연산자를 이용한 출력 vs 리터럴 포멧을 활용한 출력
let  val1=1;
console.log("val1:"+val1);

//template literal format
let val2=4;
console.log(`val2:${val2}`);


let result=val1+val2;

//덧셈연산자
console.log(val1+'+'+val2+'='+result);

// template literal format
console.log(`${val1}+${val2}=${result}`);

// var template=`<ul>\n\t<li><a href="#">result:${result}</a></li>\n</ul>`;

// console.log(template);