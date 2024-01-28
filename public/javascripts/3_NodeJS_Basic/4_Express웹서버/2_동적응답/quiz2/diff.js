const express=require('express');
const bodyParser=require('body-parser');

const app=express();
const port=3000;

app.use(bodyParser.urlencoded({extended:true}));


app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/diff.html');
})

app.post('/processDiff',(req,res)=>{
    const firstNumber=req.body.firstNumber;
    const firstNum=parseFloat(firstNumber);
    const secondNumber=req.body.secondNumber;
    const secondNum=parseFloat(secondNumber);

    let outcome;
    if(isNaN(firstNum || secondNum)){
        outcome='enter numbers only';
    } else if (firstNum>secondNum) {
        outcome=firstNum-secondNum;
    } else if(firstNum<secondNum){
     outcome=secondNum-firstNum;
    } else {
        outcome='두수는 같습니다';
    }
 //   console.log(outcome);
res.send(`<html><body><p>두수의 차이는: ${outcome}</p></body></html>`);
})

app.listen(port,()=> {
    console.log(`Server is running at http://localhost:${port}`);

});

