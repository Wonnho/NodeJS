/*문제: 사용자로부터 반지름을 입력받아 원의 넓이를 계산하여 출력하는 프로그램을 작성하세요.

    사용자로부터 원의 반지름을 입력받습니다.
    입력받은 반지름을 사용하여 원의 넓이를 계산합니다. (원의 넓이 = π * 반지름 * 반지름)
계산된 원의 넓이를 콘솔에 출력합니다.
    이러한 요구사항을 충족하는 JavaScript 코드를 작성해보세요.
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('반지름을 입력하세요: ', (inputNum) => {

    const radius = parseInt(inputNum);
    const  area =( radius*radius*Math.PI)

    console.log(`원의반지름은: ${area}`);

    rl.close()

});