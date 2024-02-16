const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Oracle 데이터베이스 연결 설정
const dbConfig = {
    user: 'open_source',
    password: '111',
    connectString: 'localhost:1521/xe'
};

// app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../../../instantclient_21_13' });
/*


--question: how we get the latest items from posts tables?
select p.title,u.name, p.created_at, p.views
from posts p
join users u
on p.author_id=u.id;

-- step 2
select p.title,u.name, p.created_at, p.views
from posts p
join users u
on p.author_id=u.id
order by p.created_at desc;

--어떻게 10개를 끝어줄거냐?

SELECT  title, author, to_char(created_at,'YYYY-MM-DD'), views
                FROM (
                    SELECT  p.title, u.name AS author, p.created_at, p.views,
                            ROW_NUMBER() OVER (ORDER BY p.created_at DESC) AS rn
                            --row_number() 쿼리 수행 결과에 순차적으로 번호를 부여 over by 정렬조건
                    FROM posts p
                    JOIN users u ON p.author_id = u.id;

-- update version2
SELECT  title, author, to_char(created_at,'YYYY-MM-DD'), views
                FROM (
                    SELECT  p.title, u.name AS author, p.created_at, p.views,
                            ROW_NUMBER() OVER (ORDER BY p.created_at DESC) AS rn
                            --row_number() 쿼리 수행 결과에 순차적으로 번호를 부여 over by 정렬조건
                    FROM posts p
                    JOIN users u ON p.author_id = u.id
                    )
             WHERE rn BETWEEN 1 AND 10
 */

app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);


        //version 1
        let result=await conn.execute(
            `SELECT  title, author, to_char(created_at,'YYYY-MM-DD'), views
                FROM (
                    SELECT  p.title, u.name AS author, p.created_at, p.views,
                            ROW_NUMBER() OVER (ORDER BY p.created_at DESC) AS rn
                    FROM posts p
                    JOIN users u ON p.author_id = u.id
                    )
             WHERE rn BETWEEN 1 AND 10`);


    //     let result=await conn.execute(
    //         `SELECT  title, author, to_char(created_at,'YYYY-MM-DD'), views
    //             FROM (
    //                 SELECT  p.title, u.name AS author, p.created_at, p.views,
    //                         ROW_NUMBER() OVER (ORDER BY p.created_at DESC) AS rn
    //                 FROM posts p
    //                 JOIN users u ON p.author_id = u.id
    //                 )
    //
    //          WHERE rn BETWEEN 1 AND 10`, {},
    //         {
    //             outFormat: oracledb.OUT_FORMAT_OBJECT
    //         }
    // );

          console.log(result.rows);

         // console.log(result.rows[0]);
         // console.log(result.rows[0][0]);

         res.render('index',{posts:result.rows});


    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});