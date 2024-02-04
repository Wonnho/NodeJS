const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    const data = {
        title: 'Welcome to My EJS Page',
        message: 'Hello, this is a dynamic HTML generated with PUG in Node.js!'
    };

    // index.pug에 data 객체 전송
    res.render('index', { data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
