const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
const WEB_SERVER_HOME = 'C:\\wonnho\\Util\\nginx-1.24.0\\html';
// const WEB_SERVER_HOME = 'C:\\HKLee\\Util\\nginx-1.24.0\\html';
app.use('/', express.static(WEB_SERVER_HOME+ '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Oracle 데이터베이스 연결 설정
// const dbConfig = {
//     user: 'open_source',
//     password: '111',
//     connectString: 'localhost:1521/xe'
// };

app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: 'C:\\instantclient_21_13' });
oracledb.autoCommit = true;
// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true,
}));
// 라우팅 함수를 미들웨어로 처리
// 미들웨어 (Middleware)는 Express 애플리케이션에서 요청(request)과 응답(response) 사이에 위치하여
// 요청에 대한 처리를 수행하고 응답을 생성하는 함수
app.use('/addComment', require('./routes/addComment'));
app.use('/boardMain', require('./routes/boardMain'));
app.use('/create', require('./routes/create'));
app.use('/deletePost', require('./routes/deletePost'));
app.use('/detailPost', require('./routes/detailPost'));
app.use('/editPost', require('./routes/editPost'));
app.use('/login', require('./routes/login'));
app.use('/loginFail', require('./routes/loginFail'));
app.use('/logout', require('./routes/logout'));

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/boardMain`);
});
