// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();
router.get('/', async (req, res) => {
  let conn;

  const loggedInUserId = req.session.loggedInUserId;
  const loggedInUserName = req.session.loggedInUserName;
  const loggedInUserRealName = req.session.loggedInUserRealName;
  // console.log(`loggedInUserId: ${userID}, loggedInUserName: ${loggedInUserName}, loggedInUserRealName: ${loggedInUserRealName}`);
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
      userId: loggedInUserId,
      userName: loggedInUserName,
      userRealName: loggedInUserRealName,
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

// POST 요청 처리
router.post('/', async (req, res) => {


});


module.exports = router;
