// difference of var and let
// exmaple 1: var scope

function exampleVar() {
    if(true) {
        var x=11;
    }


    console.log(x);
}
exampleVar();