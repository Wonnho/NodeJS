
const express=require('express')
const app=express();
const port=3000;

app.set('view engine','ejs');
app.use(express.static('public'));


app.get('/',(req,res)=>{
    const top5=[
        { name:'mango', averageRating:4.25 },
        { name:'blueberry',averageRating:3.8},
        { name:'mangostin', averageRating:4.5},
        { name:'grapes', averageRating:4.0},
        { name:'melon', averageRating:4.75},

    ];
    res.render('products',{top5});
});

app.listen(port, ()=>{
    console.log(`server is running at http://localhost:${port}`);

});