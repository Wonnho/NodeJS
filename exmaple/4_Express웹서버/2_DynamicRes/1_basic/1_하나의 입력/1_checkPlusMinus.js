const express=require('express');
const bodyParser=require('body-parser');

const  app=express();
const port=3000;

app.use(bodyParser.urlencoded({extended:true}));


app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')

})


app.post('/processInput',(req,res)=>{
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

    res.send(`<html><body><p>${result}</p></body></html>`);

})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});