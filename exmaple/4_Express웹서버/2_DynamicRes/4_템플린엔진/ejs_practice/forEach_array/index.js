
const express=require('express')
const app=express();
const port=3000;

app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/',(req,res)=>{
    const fruits=['mango','blueberry','mangostin','grapes','melon'];
    res.render('index',{fruits});
});

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});


