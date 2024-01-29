const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// app.use: Express에서 제공하는 미들웨어(요청과 응답을 처리하는 레이어)를 설정하는 코드
// bodyParser: Post 요청의 body를 파싱하기 위한 미들웨어
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/processInput', (req, res) => {
    // html body의 inputNumber1로 넘어온 값에 접근
    const inputNumber1 = req.body.inputNumber1;
    const inputNumber2 = req.body.inputNumber2;

    const num1 = parseInt(inputNumber1);
    const num2 = parseInt(inputNumber2);

    let result;
    if (isNaN(num1) || isNaN(num2)) {
        result = '올바른 숫자를 입력하세요.';
    } else {
        const sum = num1 + num2;
        result = `${num1}와 ${num2}의 합은 ${sum}입니다.`;
    }

    res.send(`<html><body><p>${result}</p></body></html>`);
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
