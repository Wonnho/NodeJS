const {odd,even}=require('./1_Var');
// get from 1_Var.js

const checkNumber = require('./2_func');
//get from 2_func.js

function checkStringOddOrEven(str) {
    if (str.length % 2) { // 홀수면
        return odd;
    }
    return even;
}

console.log(checkNumber(10));
console.log(checkStringOddOrEven('hello'));