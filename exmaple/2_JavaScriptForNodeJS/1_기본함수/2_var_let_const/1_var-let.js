// difference of var and let
// exmaple 1: var scope

function exampleVar() {
    if(true) {
        var x=11;
    }


    console.log(x);
}
exampleVar();

//예제 2:let=> block scope
//일반적인 언의 스코프 방식과 동일하다.

function exampleLet() {
    if(true) {
        let y=11;
    }


    console.log(y);
}
exampleLet();

