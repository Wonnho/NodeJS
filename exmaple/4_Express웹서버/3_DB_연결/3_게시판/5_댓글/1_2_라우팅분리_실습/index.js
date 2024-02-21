const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
const WEB_SERVER_HOME = 'c:\\wonnho\\Util\\nginx-1.24.0\\html';
// const WEB_SERVER_HOME = 'C:\\HKLee\\Util\\nginx-1.24.0\\html';
app.use('/', express.static(WEB_SERVER_HOME+ '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Oracle 데이터베이스 연결 설정
// const dbConfig = {
//     user: 'open_source',
//     password: '111',
//     connectString: 'localhost:1521/xe'
// };

app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../../../../instantclient_21_13' });
oracledb.autoCommit = true;

// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true,
}));
// 게시판 메인 페이지 렌더링
app.use('/addComment', require('./routes/addComments'));
app.use('/boardMain', require('./routes/boardMain'));
app.use('/login', require('./routes/login'));
app.use('/deletePost', require('./routes/deletePost'));
app.use('/loginFail', require('./routes/loginFail'));
app.use('/logout', require('./routes/logout'));




// 글 작성 페이지 렌더링
app.get('/create', (req, res) => {
    // 로그인 여부 확인 로직 작성
    res.render('create', {
        userId: req.session.userId,
        username: req.session.username,
        userRealName: req.session.userRealName
    });
});

app.post('/create', async (req, res) => {
    console.log('Debug: post create');
    const { title, content } = req.body;
    const authorId = req.session.loggedInUserId; // 현재 로그인한 사용자의 ID
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글을 위한 시퀀스에서 새로운 ID 가져오기
        const result = await conn.execute(
            `SELECT post_id_seq.NEXTVAL FROM DUAL`
        );
        const postId = result.rows[0][0];

        // 게시글 삽입
        await conn.execute(
            `INSERT INTO posts (id, author_id, title, content) VALUES (:id, :authorId, :title, :content)`,
            [postId, authorId, title, content]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect('/boardMain');
    } catch (err) {
        console.error('글 작성 중 오류 발생:', err);
        res.status(500).send('글 작성 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});

// app.get('/detailPost/:id', async (req, res) => {
app.get('/detailPost/:id', async (req, res) => {

    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.session.loggedInUserId;
    const userName = req.session.loggedInUserName;
    const userRealName = req.session.loggedInUserRealName;
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

        // 댓글 가져오기
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
                children: [], // 자식 댓글을 저장할 배열
                isAuthor: row[2] === userRealName // 댓글 작성자가 현재 로그인한 사용자인지 확인
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

// 수정 페이지 렌더링
app.get('/editPost/:id', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.params.user_id;
    const userName = req.query.username;
    const userRealName = req.query.user_realname;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글 정보 가져오기
        const result = await conn.execute(
            `SELECT * FROM posts WHERE id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        const post = {
            id: result.rows[0][0],
            title: result.rows[0][2],
            content: result.rows[0][3]
        };

        res.render('editPost', {
            post: post,
            userId: userId,
            username: userName,
            userRealName: userRealName
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

// 수정 처리
app.post('/editPost/:id', async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글 수정
        await conn.execute(
            `UPDATE posts SET title = :title, content = :content WHERE id = :id`,
            [title, content, postId]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 수정 후 상세 페이지로 리다이렉트
        res.redirect(`/detailPost/${postId}?user_id=${req.session.userId}&username=${req.session.username}&user_realname=${req.session.userRealName}`);
    } catch (err) {
        console.error('게시글 수정 중 오류 발생:', err);
        res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});
// 삭제 처리


// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/boardMain`);
});
