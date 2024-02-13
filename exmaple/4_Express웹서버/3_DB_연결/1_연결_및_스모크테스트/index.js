// npm i oracledb
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig');

oracledb.autoCommit = true;


// Oracle 클라이언트 설치 및 경로 지정
// https://www.oracle.com/database/technologies/instant-client/downloads.html
// 반드시 Basic Package로 다운 받을 것!

// DB 선행작업
/*
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50),
    password VARCHAR2(50),
    name VARCHAR2(100)
);

INSERT INTO users (id, username, password, name) VALUES (1, 'user1', 'password1', '김철수');
INSERT INTO users (id, username, password, name) VALUES (2, 'user2', 'password2', '이영희');
INSERT INTO users (id, username, password, name) VALUES (3, 'user3', 'password3', '박민수');
commit; -- commit을 반드시 할 것!
 */
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });
// oracledb.initOracleClient({ libDir: '/usr/lib/oracle/21/client64/lib' });
selectDatabase();
// DB Select
async function selectDatabase() {

    console.log("!!!!! db conenction !!!!!");

    let connection = await oracledb.getConnection(dbConfig);

    let binds = {};
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format

    };

    console.log("!!!!! db select !!!!!");

    //조회를 어떻게 하느냐가 중요
    let result = await connection.execute("select * from users", binds, options);


    console.log("!!!!! db response !!!!!");
    console.log(result.rows);
    console.log(result.rows[0]);
    //이름열에 접근하려면? 배열일 경우
    //console.log(result.rows[0][3]);
    console.log(result.rows[0].NAME);
    console.log("!!!!! db close !!!!!");
    await connection.close();

}