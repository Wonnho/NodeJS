const express = require("express")
const app = express()


app.get('/',(req,res)=>{
    res.send(JSON.stringify(req))
})

app.get('/:id/:pw/:a_:b_:c',(req,res)=>{
    let result = JSON.stringify(req.query)
    result = result + "<br><br>params<br>"+JSON.stringify(req.params)
    res.send(result)
})


app.listen(3000,function(req,res){
    console.log("http://localhost:3000")
})