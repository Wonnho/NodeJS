const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// Oracle 데이터베이스 연결 설정
const dbConfig = {
    user: 'aicc2',
    password: '1111',
    connectString: 'localhost:1521/xe'
};

// app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../../../instantclient_21_13' });
app.get('/bulletin', async (req, res) => {
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
      //  console.log('bulletin',info_bulletin);
        const MAX_PAGE_LIMIT = 5;
        // 5개씩 페이징 처리를 하기 위해 화면에 보이는 페이지 번호를 계산
        // 현재 페이지를 중심으로 전체 페이지에서 현재페이지를 뺀 값이 5(한 화면에 페이징하는 갯수)보다 작다면 시작 페이지를 조정한다.
        // 만약에 현재 페이지가 3을 선택하여 3을 start page로 둔다면 3,4,5,6 이렇게 4개 밖에 표시가 되지 않는다. 따라서 2,3,4,5,6으로 만든다.
        // 즉, 선택한 페이지가 전체 페이지의 끝으로 가더라도 화면에 5(한 화면에 페이징하는 갯수)를 보장하기 위한 조건
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        // 기본적으로 endPage는 startPage + MAX_PAGE_LIMIT - 1 이지만 totalPages를 초과하지 말아야 할 조건
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
      //  console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

        res.render('bulletin',{

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

//로그인 페이지 렌더링
app.get('/', (req, res) => {

 res.render('login');
});

app.post('/login', async (req, res) => {
    // 요청온거 확인
    const { userId, userPw } = req.body;
    // const member_id = req.body.userId;
    // const member_pass= req.body.userPw;
    // console.log('username '+member_id)
    //
    // console.log('password '+member_pass)

    // SQL 쿼리 실행하고 결과 가져오기
    const result = await varifyID(userId,userPw);

    console.log(result)

    // 결과에 따라서 어떤 응답 보내줄지 확인
    if(result !== null){
        console.log("로그인 성공")

        // 로그인 성공한 기념으로 session에 데이터를 저장해 놓기로 합니다.
        req.session.userNo = result.userNo
        req.session.userId = result.userId
        req.session.userName = result.userName

        res.redirect('/bulletin') // redirect를 정보를 넘길 수 없다. render는 가능 { }
    }else {
        console.log("로그인 실패")
        res.render('loginFail')
    }

});

async function varifyID(userId,userPw) {
    let connection;
    try {
        // DB 네트워크 상태가 안좋으면 connection 만드는 데부터 에러나므로 Try 내부에 넣음.


        connection = await oracledb.getConnection(dbConfig);
        const sql_query = 'SELECT member_id, member_name, member_num FROM member' +
            ' WHERE member_id = :userId AND member_pw = :userPw';
        const result = await connection.execute(sql_query, {'userId': userId, 'userPw': userPw});


        // 조회 결과에 행이 있으면 리턴하기
        if (result.rows.length > 0) {
            return {
                'userId': result.rows[0][0],
                'userName': result.rows[0][1],
                'userNo': result.rows[0][2]
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('오류 발생:', error);
        return null;
    } finally {
        // 연결정보 남아있으면 close
        if (connection) {
            await connection.close();
        }
    }
}
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
            `select b.title, m.member_id, DBMS_LOB.SUBSTR(b.content, 4000, 1) AS content, TO_CHAR(b.created_at, 'YYYY-MM-DD') AS created_at, b.views, b.post_id 
            FROM bulletin b 
            join member m on b.writer_id=m.member_id
            where b.post_id=:post_id`,
            [postId],
            {fetchInfo:{content:{type:oracledb.STRING }}}
        );

        const commentResult=await conn.execute(
            `select c.post_id, c.content, m.member_id as member,  TO_CHAR(c.created_at, 'YYYY-MM-DD') AS created_at, c.parent_comment_id
            from comments c
            join member m on c.writer_id=m.member_id
            where c.post_id= :post_id
            order by c.post_id`,
            [postId],
            {fetchInfo:{ content:{type:oracledb.STRING}}}
        );

        console.log('commentResult',commentResult);
        const comments=[];
   //     const commentMap=new Map();

      commentResult.rows.forEach(row=>{
          const comment={
              post_id:row[1],
              writer_id:row[2],
              content:row[3],
              created_at: row[4],
              children:[],
          };

          const parentId=row[5];

          if (parentId === null) {
              // 부모 댓글이 null이면 바로 댓글 배열에 추가
              comments.push(comment);
              commentMap.set(comment.post_id, comment); // 맵에 추가
          } else {
              // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
              const parentComment = commentMap.get(parentId);
              parentComment.children.push(comment);
          }
      });

        // renew post of bulletin
        const bulletin ={
            title:onePost.rows[0][0],
            member_id:onePost.rows[0][1],
            content:onePost.rows[0][2],
            created_at:onePost.rows[0][3],
            views:onePost.rows[0][4],
            post_id:onePost.rows[0][5]
        };

        console.log('bulletin:',bulletin);

          res.render('bulletinDetail',{
              bulletin:bulletin,
              // userId:userId,
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
const post_id=req.query.post_id;
const member_id=req.session.loggedInUserId;
const comment_id=req.query.commentId;
res.render('addComment',{post_id:post_id,member_id:member_id });
});


app.post('/addComment', async (req,res)=>{

    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }


    const {post_id,writer_id}=req.query;
    const {content}=req.body;

    // const member=req.body.member_id;
    // const comment_id=req.body.commentId;
    //


    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);

        await conn.execute(
            `insert into comments(id, post_id, writer_id, content)
              values(comment_id_seq.nextval,:post_id, :writer_id,:content)`,
            [post_id,writer_id,content,]

        );

        await conn.commit();
        res.redirect(`/bulletinDetail/${post_id}?writer_id=${req.session.userId}`);

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
     const writer_id=req.session.userId;
       let conn;
     try {
         conn=await oracledb.getConnection(dbConfig);
         const result= await conn.execute(
             `select post_id_seq.nextval from dual`
         );

         const post_id=result.rows[0][0];




         const sql_CreatePost = `
             insert into bulletin (post_id, writer_id, title, content)
             values (:post_id, :writer_id, :title, :content)
         `
         const bind = {
             'post_id': post_id,
             'writer_id': writer_id,
             'title': title,
             'content': content
         }
         await conn.execute(sql_CreatePost, bind)

         await conn.commit();
         res.redirect('/bulletin');
     } catch (err) {
         console.error(err);
         res.status(500).send('글 작성 중 오류 발생');
     }
     finally {
         if(conn) {
             try {
                 await conn.close();
             } catch (err) {
                 console.error('오라클 연결 종료 중 오류 발생',err);
             }
         }
     }
})

app.get('/edit/:post_id', async(req,res)=>{
   if(!req.session.userId) {
       return res.redirect('/login');
   }

    const post_id=req.params.post_id;
   // const member_id=req.body.userId;

    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);
        const result=await conn.execute(
            `select * from bulletin where post_id=:post_id`,
            [post_id],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        const post={
            post_id:result.rows[0][0],
            writer_id:result.rows[0][1],
            title: result.rows[0][2],
            content: result.rows[0][3]
        };

        console.log('post from edit',post);
        res.render('edit', {
          post:post,


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
app.put('/edit/:post_id', async (req,res)=>{

    const {title,content}=req.body;
    const post_id=req.params.post_id;
  //  const member_id=req.params.member_id;

    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);
       await conn.execute(
       `update bulletin set title=:title, content=:content where post_id=:post_id`,
       [title, content,post_id]
    );
   // console.log('수정 후 페이지 게시글 번호',bulletin.post_id);
    await conn.commit();

    res.redirect(`/bulletinDetail/${post_id}?writer_id=${req.session.userId}`);
} catch(err) {
    console.log('게시글 수정 중 오류 발생:',err);
    } finally {
        if(conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:',err);
            }
        }
    }
});

app.get('/delete/:post_id', async (req,res)=>{
    if(!req.session.loggedIn) {
        return res.redirect('/login');
    }
    const post_id=req.params.post_id;
    const userId=req.session.userId;
   // const member_id=req.session.username;


    let conn;
    try {
        conn=await oracledb.getConnection(dbConfig);
        await conn.execute(
            `delete from bulletin where post_id=:post_id`,
            [post_id]

        );

        console.log('posts from delete',post_id);

        await conn.commit();

        res.redirect(`/bulletin?post_id=${post_id}&member_id=${req.session.userId}`);

    } catch (err) {
        console.log('게시글 삭제 중 오류 발생:',err);
    } finally {
        if(conn) {
            try{
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:',err);
            }
        }
    }
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

