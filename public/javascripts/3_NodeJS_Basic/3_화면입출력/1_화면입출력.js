// Node.js 환경에서 사용자와 상호작용하기 위한 콘솔 인터페이스를 만들 때 사용되는 모듈을 불러오는 구문
const readline = require('readline');
// readline 모듈을 사용하여 콘솔에서 사용자와 상호작용 할 수 있는 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin, // 표준 입력을 사용자 입력으로 지정합니다.
    output: process.stdout // 표준 출력을 콘솔 출력으로 지정합니다. (readline을 사용하는 경우 명시적으로 output을 지정해야 함)
});

// 콘솔에서 수를 입력받음
// question: 첫 번째 인자를 화면에 출력하고 입력받은 값을 callback함수의 인자로 넘겨서 실행하게 한다.
rl.question('하나의 수를 입력하세요: ', (inputNumber) => {
    // 입력받은 문자열을 정수로 변환
    const number = parseInt(inputNumber);

    // 양수, 음수, 또는 0 여부를 판별하여 출력
    if (isNaN(number)) {
        console.log('올바른 숫자를 입력하세요.');
    } else if (number > 0) {
        console.log('입력한 수는 양수입니다.');
    } else if (number < 0) {
        console.log('입력한 수는 음수입니다.');
    } else {
        console.log('입력한 수는 0입니다.');
    }

    // 입력이 완료되었으므로 인터페이스를 닫음
    rl.close();
});
