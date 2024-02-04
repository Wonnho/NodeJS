
const express=require('express');
const app=express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    // 렌더링에 사용할 데이터 객체 생성
    const data = {
        title: '나의 EJS 페이지에 오신 것을 환영합니다.',
        message: '안녕하세요, 이것은 Node.js에서 EJS로 생성된 동적 HTML입니다!'
    };

    // 'index.ejs' 템플릿에 데이터 객체 전달하여 렌더링 후 응답
    res.render('index', { data });
});

// 서버의 포트를 설정 (환경 변수에 포트가 지정되어 있지 않으면 3000 사용)
const PORT = process.env.PORT || 3000;
// 지정된 포트에서 서버 시작 및 리스닝
app.listen(PORT, () => {
    // 서버 시작 메시지 출력
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});