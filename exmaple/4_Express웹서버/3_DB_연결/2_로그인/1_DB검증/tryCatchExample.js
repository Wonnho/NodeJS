
function myTest() {
    console.log('myTask start!')

    //num does not exist so it terminated abnormally
    const result=10/num;
    console.log(`result:${result}`);

}
function myTest2() {
    console.log('myTask start!')

    try {
        //num does not exist so it terminated abnormally
        const result = 10 / 0;
        console.log(`result:${result}`);
    }
    catch(err) {
        console.error('error occurs'+err.message);
    }
    finally {
        console.log('done');
    }
}

//myTest();

myTest2()
