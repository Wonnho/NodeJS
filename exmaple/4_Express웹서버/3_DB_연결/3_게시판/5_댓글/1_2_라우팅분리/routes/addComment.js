// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

// GET 요청 처리
// 분리를 한 경우 호출한 쪽의 경로가 prefix 로 처리 되기 때문에
// 아래 별도로 router.get('/addComment' 하지 않아도 된다.
router.get('/', (req, res) => {
    const postId = req.query.post_id; // postId 가져오기
    const userId = req.session.loggedInUserId;
    const username = req.session.loggedInUserName;
    const userRealName = req.session.loggedInUserRealName;
    res.render('addComment', { postId: postId, userId: userId, userName: username, userRealName: userRealName });
});

// POST 요청 처리
router.post('/', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const { post_id, author_id } = req.query;
    const { content } = req.body; // 댓글 내용은 POST 요청의 본문(body)에서 가져와야 합니다.

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 댓글 추가
        await conn.execute(
            `INSERT INTO comments (id, post_id, author_id, content) VALUES (comment_id_seq.nextval, :post_id, :user_id, :content)`,
            [post_id, author_id, content]
        );

        // 댓글 추가 후 해당 게시글 상세 페이지로 리다이렉트
        res.redirect(`/detailPost/${post_id}`);
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

module.exports = router;
