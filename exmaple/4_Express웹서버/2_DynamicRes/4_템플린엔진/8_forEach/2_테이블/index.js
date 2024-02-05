const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// 라우트 정의
app.get('/', (req, res) => {
    const top5Recommendations = [
        { name: '상품1', averageRating: 4.25 },
        { name: '상품2', averageRating: 3.8 },
        { name: '상품3', averageRating: 4.5 },
        { name: '상품4', averageRating: 4.0 },
        { name: '상품5', averageRating: 4.75 }
    ];

    res.render('index', { top5Recommendations });
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
