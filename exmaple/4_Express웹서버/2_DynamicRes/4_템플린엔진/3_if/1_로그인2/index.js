const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Import the path module
const app = express();
const port = 3000;

// EJS를 뷰 엔진으로 설정
app.set('view engine', 'ejs');

// body-parser를 사용하여 POST 요청의 body를 파싱
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일을 제공하기 위해 'public' 디렉토리를 정적으로 설정
// join, path.join 복습합시다.
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 정의
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Send the HTML file
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // ID가 'admin'이고 비밀번호가 '1111'인 경우에만 로그인 허용
    if (username === 'admin' && password === '1111') {
        res.render('dashboard', { username });
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'), { error: 'Invalid username or password' });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
