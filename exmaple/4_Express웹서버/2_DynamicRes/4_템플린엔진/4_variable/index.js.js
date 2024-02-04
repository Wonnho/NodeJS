const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public')); // 정적 파일을 제공하기 위한 middleware

app.get('/', (req, res) => {
    // EJS 템플릿을 렌더링하고 결과를 클라이언트에 전송
    res.render('index');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
