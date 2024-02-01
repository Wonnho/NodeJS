///////////////////////////////////
// Step1] Node Server 환경 구축 단계
///////////////////////////////////
// Express 모듈을 불러옵니다.

const express =require('express');

//경로 관련 유틸러티 모듈
const path=require(`path`);

//create Express application
const app=express();


//set app port
//process.env.PORT :express 설치시 설정된 포트의 환경변수값
//nodeJS의 기본포트 default:3000
app.set(`port`,process.env.PORT || 3000);

////////////////////////////////////////
// Step2] 사용자 요청에 대한 서비스 준비 단계
////////////////////////////////////////


app.get('/',(req,res)=>{

    //__dirname:현재 js 파일이 있는 경로
    res.sendFile(path.join(__dirname,'/index.html'));
});

//////////////////////////////////////
// Step3] 서비스 시작 단계
//////////////////////////////////////

//애플리케이션을 지정된 포트에서 실행
app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'빈 포트에서 대기중');
})