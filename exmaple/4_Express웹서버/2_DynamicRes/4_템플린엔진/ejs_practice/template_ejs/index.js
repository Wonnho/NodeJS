
const express=require('express');
const app=express();

app.set('view engine','ejs');

app.get('/', (req,res)=>{
    const data={
        title: 'start ejs',
        message:' learn with express,이것은 Node.js에서 EJS로 생성된 동적 HTML입니다!',
    }

    res.render('index',{data});
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(` running server at ${PORT}`)
})

