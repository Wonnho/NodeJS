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

app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../../../instantclient_21_13' });

// 게시판 메인 페이지 렌더링
// 게시판 메인 페이지 렌더링
app.get('/', async (req, res) => {
    let conn;
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
        result = await conn.execute(
            `SELECT
                 id,title,author,to_char(created_at,'YYYY-MM-DD'),views,
                 (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
             FROM (
                      SELECT
                          p.id, p.title, u.name AS author, p.created_at, p.views,
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
        console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);
        console.log(result.rows);
        res.render('index', {
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
// 상세 게시글은 경로로 받는 문법
// url/:경로명
app.get('/detailPost/:id', async (req, res) => {
    // 경로는 req.params.경로명으로 받는다.
    const postId = req.params.id;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 조회수 증가 처리
        await conn.execute(
            `UPDATE posts SET views = views + 1 WHERE id = :id`,
            [postId]
        );

        // 게시글 정보 가져오기
        const postResult = await conn.execute(
            `SELECT p.title, u.name AS author, p.content, TO_CHAR(p.created_at, 'YYYY-MM-DD') AS created_at, p.views, p.likes 
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글 가져오기
        // const commentResult = await conn.execute(
        //     `SELECT c.id, c.content, u.name AS author, TO_CHAR(c.created_at, 'YYYY-MM-DD') AS created_at, c.parent_comment_id
        //     FROM comments c
        //     JOIN users u ON c.author_id = u.id
        //     WHERE c.post_id = :id
        //     ORDER BY c.id`,
        //     [postId],
        //     { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        // );

        // 댓글과 댓글의 댓글을 구성
        const comments = [];
        // const commentMap = new Map(); // 댓글의 id를 key로 하여 댓글을 맵으로 저장
        //
        // commentResult.rows.forEach(row => {
        //     const comment = {
        //         id: row[0],
        //         content: row[1],
        //         author: row[2],
        //         created_at: row[3],
        //         children: [] // 자식 댓글을 저장할 배열
        //     };
        //
        //     const parentId = row[4]; // 부모 댓글의 id
        //
        //     if (parentId === null) {
        //         // 부모 댓글이 null이면 바로 댓글 배열에 추가
        //         comments.push(comment);
        //         commentMap.set(comment.id, comment); // 맵에 추가
        //     } else {
        //         // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
        //         const parentComment = commentMap.get(parentId);
        //         parentComment.children.push(comment);
        //     }
        // });
        // console.log(postResult.rows[0]);
        const post = {
            title: postResult.rows[0][0],
            author: postResult.rows[0][1],
            content: postResult.rows[0][2],
            created_at: postResult.rows[0][3],
            views: postResult.rows[0][4],
            likes: postResult.rows[0][5]
        };
        console.log(`post: ${post}, comments: ${comments}, content: ${postResult.rows[0][2]}`);
        res.render('detailPost', {
            post: post,
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
    console.log(`Server is running on http://localhost:${port}`);
});
