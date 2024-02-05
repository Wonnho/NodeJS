// app.js
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    const fruits = ['사과', '바나나', '오렌지', '포도'];
    res.render('index', { fruits });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
