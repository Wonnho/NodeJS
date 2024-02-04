var products=[];
const maxNum=1000;

for(let k=1;maxNum;k++) {
    var product={
        name:'상품'+k,
        averageRating: calculateAverageRating(),

    };

    products.push(product);
}


