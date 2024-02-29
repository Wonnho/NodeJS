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
    user: 'aicc2',
    password: '1111',
    connectString: 'localhost:1521/xe'
};

// app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../../../instantclient_21_13' });
app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        let counts = await conn.execute(
            `SELECT COUNT(*) AS total FROM bulletin`
        );
        const totalPosts = counts.rows[0];
        // 사용자 입장에서 수정해야할 상수:postPerPage
        const postsPerPage = 14; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        // current Page가 1이면 startRow는 1, endRow는 10
        // current Page가 2이면 startRow는 11, endRow는 20
        // ...

        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
    //    console.log(`startRow: ${startRow}, endRow: ${endRow}`);


        let info_bulletin=await conn.execute(
            `SELECT post_id, writer, member, title, to_char(created_at,'YYYY-MM-DD'), views,
             (select count(*) from comments c where c.post_id=b.post_id) as comments_count
                FROM (
                    SELECT  b.post_id, b.title, b.writer_id AS writer, m.member_name as member, b.created_at, b.views,
                            ROW_NUMBER() OVER (ORDER BY b.created_at DESC) AS rn
                                        FROM bulletin b
                    JOIN member m ON b.writer_id = m.member_id
                    ) b
             WHERE rn BETWEEN :startRow AND :endRow`,
            {
                startRow: startRow,
                endRow: endRow
            }
        );
        console.log(info_bulletin);
        const MAX_PAGE_LIMIT = 5;
        // 5개씩 페이징 처리를 하기 위해 화면에 보이는 페이지 번호를 계산
        // 현재 페이지를 중심으로 전체 페이지에서 현재페이지를 뺀 값이 5(한 화면에 페이징하는 갯수)보다 작다면 시작 페이지를 조정한다.
        // 만약에 현재 페이지가 3을 선택하여 3을 start page로 둔다면 3,4,5,6 이렇게 4개 밖에 표시가 되지 않는다. 따라서 2,3,4,5,6으로 만든다.
        // 즉, 선택한 페이지가 전체 페이지의 끝으로 가더라도 화면에 5(한 화면에 페이징하는 갯수)를 보장하기 위한 조건
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        // 기본적으로 endPage는 startPage + MAX_PAGE_LIMIT - 1 이지만 totalPages를 초과하지 말아야 할 조건
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
      //  console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

        res.render('index',{
            bulletin:info_bulletin.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPage: totalPages,
            maxPageNumber: MAX_PAGE_LIMIT});


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

// 로그인 페이지 렌더링
app.get('/login', (req, res) => {

    res.redirect('/login');
});

//post_id is a primary key
app.get('/bulletinDetail/:post_id',async(req,res)=>{
    const postId=req.params.post_id;
    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);

        await conn.execute(
            `update bulletin set views=views+1 where post_id=:post_id`,
            [postId]
        );

        //get info about individual post
        const onePost=await conn.execute(
            `select b.title, m.member_name, DBMS_LOB.SUBSTR(b.content, 4000, 1) AS content, TO_CHAR(b.created_at, 'YYYY-MM-DD') AS created_at, b.views 
            FROM bulletin b 
            join member m on b.writer_id=m.member_id
            where b.post_id=:post_id`,
            [postId],
            {fetchInfo:{content:{type:oracledb.STRING }}}
        );

        console.log('onePost:',onePost);
        const comments=[];

        // renew post of bulletin
        const bulletin ={
            title:onePost.rows[0][0],
            member:onePost.rows[0][1],
            content:onePost.rows[0][2],
            created_at:onePost.rows[0][3],
            views:onePost.rows[0][4]
        };

          res.render('bulletinDetail',{
              bulletin:bulletin,
              comments:comments
          });
    }catch(err) {
        console.log('internal server error:',err)
      //  res.send("에러남 ㅠㅠㅠ "+err)
    } finally {
        if(conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
} );

app.get('/addComment',(req,res)=>{
const postId=req.query.post_id;
const comment_id=req.query.commentId;
res.render('addComment',{postId:postId, });
});

app.post('/addComment', async (req,res)=>{

    // if (!req.session.loggedIn) {
    //     return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    // }


    const post_id=req.body.postId;
    const member=req.body.member;
    const comment_id=req.body.commentId;
    const {content}=req.body;

    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);

        await conn.execute(
            `insert into comments(post_id,member, content, parent_comment_id )
              values(comment_id_seq.nextval,:member,:content,:parent_id)`,
            [post_id,member,content,comment_id]

        );

        await conn.commit();
        res.redirect(`/bulletinDetail/${post_id}`);

    } catch (err) {
        console.error(err);
        res.status(500).send('internal server error');
    } finally {
        if(conn) {
            try {
                await conn.close();
            }catch (err) {
                console.error(err)
            }
        }
    }
})


app.get('/write', (req,res)=>{

    res.render('write',{
        //login 정보나 세션정보가 없으니 글쓰기로 정보를 넘겨줄 수가 없다.
        // const post_id= req.body.post_id;
        // const writer=req.body.writer;
    })
});

app.post('/write/',async(req,res)=>{
    const {title,content}=req.body;
   // const post_id=req.
})

app.get('/edit/:post_id', async(req,res)=>{
    const post_id=req.params.post_id;

    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);
        const result=await conn.execute(
            `select * from bulletin where post_id=:post_id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        const post={
            post_id:result.rows[0][0],
            title: result.rows[0][2],
            content: result.rows[0][3]
        };

       // console.log('post from edit',post);
        res.render('edit', {
          post:post
        })
    }catch (err) {
         console.error(err);
         res.status(500).send('internal server error');
    } finally {
        if(conn) {
            try {
                await conn.close();
            }catch (err) {
                console.error(err)
            }
        }

    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/login`);
});

