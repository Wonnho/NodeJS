/* 문제: 사용자로부터 반지름을 입력받아 원의 넓이를 계산하여 출력하는 프로그램을 작성하세요.

    사용자로부터 원의 반지름을 입력받습니다.
   입력받은 반지름을 사용하여 원의 넓이를 계산합니다. (원의 넓이 = π * 반지름 * 반지름)
 계산된 원의 넓이를 콘솔에 출력합니다.
  이러한 요구사항을 충족하는 JavaScript 코드를 작성해보세요.

 */

const readline = require('readline');
// readline 모듈을 사용하여 콘솔에서 사용자와 상호작용 할 수 있는 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin, // 표준 입력을 사용자 입력으로 지정합니다.
    output: process.stdout // 표준 출력을 콘솔 출력으로 지정합니다. (readline을 사용하는 경우 명시적으로 output을 지정해야 함)
});

rl.question('반지름을 입력하세요: ', (num1) => {
    // 두 번째 수 입력
      const radius=parseFloat(num1);
      const circleArea=Math.PI*radius*radius;
      console.log(`반지름이 ${radius}인 원의 넓이는 ${circleArea}`)
        rl.close();
    });
