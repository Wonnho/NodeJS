const express=require('express');
const ejs=require('ejs');
const path=require('path');
const app=express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

app.get('/',(req,res=>{
const data={
  title:'start pug web',
  message:'Hello, this is a pug playground. com and have fun'
};
res.render('index',{data});
});

const PORT=process.env.PORT|| 3000;
app.listen(PORT,()=>{
console.log(`server is running on port ${PORT)`};
});