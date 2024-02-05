
const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const ejs=require('ejs');


const index=express();
const port=3000;


index.use(bodyParser.urlencoded({extended:true}));
index.set('view engine','ejs');
index.set('views',path.join(__dirname,'views'));

index.use(express.static(path.join(__dirname,'pulbic')));

index.get('/',(req,res)=>{
    res.render('index',{result:null});
});

index.post('/processInput',(req,res)=>{
    const inputNum=req.body.inputNumber;
    const num=parseInt(inputNum);

    let result;
    if(isNaN(num)) {
        result='put the number only';
    } else if(num>0) {
        result='positive';

    } else if(num<0) {
        result='negative';
    } else {
        result='zero';
    }

    res.render('index',{result});

});

index.listen(port,()=>{
    console.log(`${port}`);
});
