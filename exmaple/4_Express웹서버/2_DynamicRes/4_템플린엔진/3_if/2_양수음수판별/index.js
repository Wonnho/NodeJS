const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs'); // ejs 모듈 추가

const index = express();
const port = 3000;

index.use(bodyParser.urlencoded({ extended: true }));
index.set('view engine', 'ejs'); // 뷰 엔진을 ejs로 설정
index.set('views', path.join(__dirname, 'views')); // views 디렉토리 설정

// 정적 파일 제공을 위해 'public' 디렉토리를 사용합니다.
index.use(express.static(path.join(__dirname, 'public')));

index.get('/', (req, res) => {
    res.render('index', { result: null });
});

index.post('/processInput', (req, res) => {
    const inputNumber = req.body.inputNumber;
    const number = parseInt(inputNumber);

    let result;
    if (isNaN(number)) {
        result = '올바른 숫자를 입력하세요.';
    } else if (number > 0) {
        result = '입력한 수는 양수입니다.';
    } else if (number < 0) {
        result = '입력한 수는 음수입니다.';
    } else {
        result = '입력한 수는 0입니다.';
    }

    res.render('index', { result });
});

index.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
