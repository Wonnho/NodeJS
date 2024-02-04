const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'input.html'));
});

app.post('/calculate', (req, res) => {
    const number1 = parseInt(req.body.number1);
    const number2 = parseInt(req.body.number2);
    const sum = number1 + number2;

    res.render('result', { number1, number2, sum });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
