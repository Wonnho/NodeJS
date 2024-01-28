//외부 모듈의 요소를 가져오는 문법
const {odd,even}=require('./1_var');

function checkOddOrEven(num) {

    if(num%2) {
        return even;
    }
    return odd;
}

module.exports=checkOddOrEven;