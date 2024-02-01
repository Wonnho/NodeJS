// Node.js 환경에서 사용자와 상호작용하기 위한 콘솔 인터페이스를 만들 때 사용되는 모듈을 불러오는 구문
const readline = require('readline');

// readline 모듈을 사용하여 콘솔에서 사용자와 상호작용 할 수 있는 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin, // 표준 입력을 사용자 입력으로 지정합니다.
    output: process.stdout // 표준 출력을 콘솔 출력으로 지정합니다. (readline을 사용하는 경우 명시적으로 output을 지정해야 함)
});

// 첫 번째 수 입력
// question: 첫번째 인자의 메세지를 출력하고 callback 함수 실행
rl.question('첫 번째 수를 입력하세요: ', (num1) => {
    // 두 번째 수 입력
    rl.question('두 번째 수를 입력하세요: ', (num2) => {
        // 입력받은 두 수를 정수로 변환하여 덧셈 수행
        const result = parseInt(num1) + parseInt(num2);

        // 결과 출력
        console.log(`덧셈 결과: ${result}`);

        // 사용이 끝났으면 인터페이스를 닫음
        rl.close();
    });
});
