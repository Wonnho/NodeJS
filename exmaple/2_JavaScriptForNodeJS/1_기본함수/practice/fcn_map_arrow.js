const numbers=[3,6,3,12,7];

function  getSquared(num) {
    return num*num;
}

for(let k=0;k<numbers.length;k++) {
     console.log(`${getSquared(numbers[k])}`);
}