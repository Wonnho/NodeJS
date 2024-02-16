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
app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `SELECT COUNT(*) AS total FROM posts`
        );
        const totalPosts = result.rows[0];
        // 사용자 입장에서 수정해야할 상수:postPerPage
        const postsPerPage = 10; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산
        // usage of query parameter
        //req.query.[variable of query parameter]
        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        // current Page가 1이면 startRow는 1, endRow는 10
        // current Page가 2이면 startRow는 11, endRow는 20
        // ...
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
        console.log(`startRow: ${startRow}, endRow: ${endRow}`);
        result = await conn.execute(
            `SELECT  title, author, to_char(created_at,'YYYY-MM-DD'), views 
                FROM (
                    SELECT  p.title, u.name AS author, p.created_at, p.views,
                            ROW_NUMBER() OVER (ORDER BY p.id DESC) AS rn
                    FROM posts p
                    JOIN users u ON p.author_id = u.id
                    )
             WHERE rn BETWEEN :startRow AND :endRow`,
            {
                startRow: startRow,
                endRow: endRow
            }
        );
        // 사용자 입장에서 수정해야할 상수:postPerPage
        const MAX_PAGE_LIMIT = 5;
        // 5개씩 페이징 처리를 하기 위해 화면에 보이는 페이지 번호를 계산
        // 현재 페이지를 중심으로 전체 페이지에서 현재페이지를 뺀 값이 5(한 화면에 페이징하는 갯수)보다 작다면 시작 페이지를 조정한다.
        // 만약에 현재 페이지가 3을 선택하여 3을 start page로 둔다면 3,4,5,6 이렇게 4개 밖에 표시가 되지 않는다. 따라서 2,3,4,5,6으로 만든다.
        // 즉, 선택한 페이지가 전체 페이지의 끝으로 가더라도 화면에 5(한 화면에 페이징하는 갯수)를 보장하기 위한 조건
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        // 기본적으로 endPage는 startPage + MAX_PAGE_LIMIT - 1 이지만 totalPages를 초과하지 말아야 할 조건
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
        console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

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


// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
