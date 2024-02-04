const express = require('express');
const app = express();
const port = 3000;

// EJS를 뷰 엔진으로 설정
app.set('view engine', 'ejs');

// 정적 파일 서비스 설정 (public 폴더에 정적 파일을 넣어둘 수 있습니다)
app.use(express.static('public'));

// 라우트 정의
app.get('/', (req, res) => {
    // 배열 데이터 생성 (for문에 활용할 데이터)
    const fruits = ['Apple', 'Banana', 'Orange', 'Grapes'];

    // EJS 템플릿을 렌더링하면서 배열 데이터를 전달
    res.render('index', { fruits });
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
