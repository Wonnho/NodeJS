// npm i oracledb
// npm i ejs
const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const session=require('express-session');

const dbConfig = require('./dbconfig');
oracledb.autoCommit=true;
const  app=express();
const port=3000;

// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true,
    //세션의 유지 시간은 기본값은 브라우저 종료시까지 유지
    cookie: {
        maxAge:5000// 단위는 밀리세컨드
    }
}));

app.set('view engine', 'ejs');

const server = app.listen(3000, ()=> {
    console.log("Start serer : localhost:3000");
})


//정적인 파일 참조를 niginx html 폴더로 지정
const WEB_SERVER_HOME='C:\\wonnho\\Util\\nginx-1.24.0\\html'



app.use('/', express.static(WEB_SERVER_HOME + '/'));

oracledb.initOracleClient(({libDir:'../../instantclient_21_13'}))

app.post('/login', bodyParser.urlencoded({ extended: false }),
    async (req, res) => {
    //const username=req.body.username;
    //const password=req.body.password;


//js deconstruction
    const {username,password}=req.body;
    console.log(username);
    console.log(password);
    //사용자 인증

   const authenticatedUser=await verifyID(username,password);
    if(authenticatedUser) {
        req.session.loggedIn=true;

        req.session.username=username;
        res.render('welcome',{username});

    } else {
        res.render('loginfail',{username})
    }
    });

app.get('/login',(req,res)=>{
    if(req.session.loggedIn) {

        res.render('welcome',{username:req.session.username})
    } else {
        //인증되지 않은 사용자인 경우 로그인 페이지로 리다이렉트(새로운 정적 페이지)
        res.redirect('/login.html')
    }

})

async function  verifyID(username,password) {
    let connection;

    try {
        connection=await oracledb.getConnection(dbConfig);
        sql_query='select * from users where username= :username and password= :password';
        console.log(sql_query)
        // execute([sql query],[binding info',[option]);
        //binding info는 기존 sql query에서 js varable을 사용할 수 있게 하는 mapping info
        const result=await connection.execute(sql_query,{username,password });

        console.log(result)
        if(result.rows.length>0) {
            console.log(result.rows[0]);
            return {
                id:result.rows[0].ID,
                username:result.rows[0].USERNAME,
                name: result.rows[0].Name
            };
        } else {
            return null;
        }

    } catch(err) {
      console.error('error occurs');
    } finally {
   if(connection) {
       await connection.close();
   }

    }
}
