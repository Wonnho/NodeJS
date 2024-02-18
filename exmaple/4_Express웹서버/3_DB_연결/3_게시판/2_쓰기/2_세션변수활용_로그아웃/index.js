const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
const WEB_SERVER_HOME = 'C:\\wonnho\\Util\\nginx-1.24.0\\html';
app.use('/', express.static(WEB_SERVER_HOME+ '/'));
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

app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../../../instantclient_21_13' });
oracledb.autoCommit = true;

// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true,
}));
// 게시판 메인 페이지 렌더링
app.get('/boardMain', async (req, res) => {
    let conn;
    // const userId = req.query.id;
    // const userName = req.query.username;
    // const userRealName = req.query.name;

    // 이제 로그인이 되는 동안 공통으로 참조하는 세션변수를 사용할 수 있기 때문에
    // ejs에서 위와 같이 쿼리 파라메터로 전달할 필요가 없다.
    const userId = req.session.userId;
    const userName = req.session.username;
    const userRealName = req.session.userRealName;
    // console.log(`userId: ${userID}, userName: ${userName}, userRealName: ${userRealName}`);
    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `SELECT COUNT(*) AS total FROM posts`
        );
        const totalPosts = result.rows[0];
        const postsPerPage = 10; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
        console.log(`startRow: ${startRow}, endRow: ${endRow}`);
        // 작성자를 동명이인을 고려해 사용자 ID, 닉네임의 성격을 같는 username 열을 사용한다.
        result = await conn.execute(
            `SELECT
                 id,title,author,to_char(created_at,'YYYY-MM-DD'),views,
                 (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
             FROM (
                      SELECT
                          p.id, p.title, u.username AS author, p.created_at, p.views, 
                          ROW_NUMBER() OVER (ORDER BY p.id DESC) AS rn
                      FROM posts p
                               JOIN users u ON p.author_id = u.id
                  ) p
             WHERE rn BETWEEN :startRow AND :endRow
            `,
            {
                startRow: startRow,
                endRow: endRow
            }
        );

        const MAX_PAGE_LIMIT = 5;
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
        console.log(`result.rows: ${result.rows}`);
        console.log(`result.rows[0].id: ${result.rows[0].id}`);

        res.render('index', {
            userId: userId,
            userName: userName,
            userRealName: userRealName,
            posts: result.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPages: totalPages,
            maxPageNumber: MAX_PAGE_LIMIT
        });
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

// 댓글 페이지 렌더링
// app.get('/addComment', (req, res) => {
//     const postId = req.query.post_id; // postId 가져오기
//     const userId = req.query.user_id;
//     const username = req.query.username;
//     const userRealName = req.query.user_realname;
//     res.render('addComment',{postId: postId, userId:userId, userName:username, userRealName:userRealName});
// });

// 로그인 페이지 렌더링
app.get('/login', (req, res) => {
    // '/' 경로로의 요청은 Nginx에서 login.html을 처리하도록 리다이렉트
    res.redirect('/login.html');
});

// 로그인 처리
app.post('/login', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const { username, password } = req.body;
    const authenticatedUser = await varifyID(username, password);

    // console.log(`authenticatedUser.id: ${authenticatedUser.id}
    //     authenticatedUser.username: ${authenticatedUser.username} authenticatedUser.name ${authenticatedUser.name}`);
    // const id = authenticatedUser.id;
    // const name = authenticatedUser.name;
    if (authenticatedUser) {
        req.session.loggedIn = true;
        req.session.userId = authenticatedUser.id; // 사용자 ID 저장
        req.session.username = username;
        req.session.userRealName = authenticatedUser.name; // 사용자 실제 이름 저장
        // res.redirect(`/boardMain?id=${authenticatedUser.id}&username=${authenticatedUser.username}&name=${authenticatedUser.name}`);
        res.redirect(`/boardMain`);
        // res.redirect('welcome', { WEB_SERVER_HOME, username });
    } else {
        res.render('loginFail',{ username});
    }
});
app.get('/loginFail', (req, res) => {
    res.render('/loginFail');
});
// 로그아웃 처리
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 중 오류 발생:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
        }
    });
});
async function varifyID(username, password) {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            'SELECT * FROM users WHERE username = :username AND password = :password',
            { username, password }
        );

        if (result.rows.length > 0) {
            console.log('varifyID');
            console.log(result.rows[0][0]);
            return {
                id: result.rows[0][0],
                username: result.rows[0][1],
                name: result.rows[0][3]
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('오류 발생:', error);
        return null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
// 글 작성 페이지 렌더링
app.get('/create', (req, res) => {
    // 로그인 여부 확인 로직 작성
    res.render('create', {
        userId: req.session.userId,
        username: req.session.username,
        userRealName: req.session.userRealName
    });
});

// 글 작성 처리
app.post('/create', async (req, res) => {
    // 로그인 여부 확인 로직 작성
    const { title, content } = req.body;
    // 글 작성 처리 로직 작성
});

// app.get('/detailPost/:id', async (req, res) => {
app.get('/detailPost/:id', async (req, res) => {

    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.params.user_id;
    const userName = req.query.username;
    const userRealName = req.query.user_realname;
    console.log(`username: ${userName}`);
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 조회수 증가 처리
        await conn.execute(
            `UPDATE posts SET views = views + 1 WHERE id = :id`,
            [postId]
        );

        // 변경 사항을 커밋
        await conn.commit();

        // 게시글 정보 가져오기
        const postResult = await conn.execute(
            `SELECT p.id, p.title, u.username AS author, p.content, TO_CHAR(p.created_at, 'YYYY-MM-DD') AS created_at, p.views 
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

      //  댓글 가져오기
        const commentResult = await conn.execute(
            `SELECT c.id, c.content, u.username AS author, TO_CHAR(c.created_at, 'YYYY-MM-DD') AS created_at, c.parent_comment_id 
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.post_id = :id
            ORDER BY c.id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글과 댓글의 댓글을 구성
        const comments = [];
        const commentMap = new Map(); // 댓글의 id를 key로 하여 댓글을 맵으로 저장

        commentResult.rows.forEach(row => {
            const comment = {
                id: row[0],
                content: row[1],
                author: row[2],
                created_at: row[3],
                children: [] // 자식 댓글을 저장할 배열
            };

            const parentId = row[4]; // 부모 댓글의 id

            if (parentId === null) {
                // 부모 댓글이 null이면 바로 댓글 배열에 추가
                comments.push(comment);
                commentMap.set(comment.id, comment); // 맵에 추가
            } else {
                // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
                const parentComment = commentMap.get(parentId);
                parentComment.children.push(comment);
            }
        });
        // console.log(postResult.rows[0]);
        const post = {
            id: postResult.rows[0][0],
            title: postResult.rows[0][1],
            author: postResult.rows[0][2],
            content: postResult.rows[0][3],
            created_at: postResult.rows[0][4],
            views: postResult.rows[0][5],
            likes: postResult.rows[0][6]
        };
        console.log(`post: ${post}, comments: ${comments}`);
        console.log(`id: ${postResult.rows[0][0]}, content: ${postResult.rows[0][2]},
         login username: ${userName} login userRealName: ${userRealName}`);
        res.render('detailPost', {
            post: post,
            userId: userId,
            username: userName,
            userRealName: userRealName,
            comments: comments
        });
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
    console.log(`Server is running on http://localhost:${port}/boardMain`);
});
