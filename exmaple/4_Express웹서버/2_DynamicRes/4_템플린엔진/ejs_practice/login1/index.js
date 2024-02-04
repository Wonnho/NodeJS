const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// EJS를 뷰 엔진으로 설정
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:false}));

app.get('/',(req,res)=>{
res.render('index');
});

app.post('/login',(req,res)=>{
const {username,password}=req.body; // since clients send username and password by writing to
//dashboard.ejs in order to check up on identification so need to parse the request data so that
// extract them easily using body-parser

if(username==='admin' && password==='1111') {
res.render('dashboard',{username});
} else {
res.render('login',{error:"invalid username or password"});
}
});

app.listen(port ,()=>{
console.log(`server is running at http://localhost:${port}`);
});
