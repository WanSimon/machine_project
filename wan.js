console.log('123', 123);
let arr = [
  {name: 'i', price: 100},
  {
    name: 'ii',
    price: 200,
  },
  {
    name: 'iii',
    price: 300,
  },
];

let countPrice = arr.reduce((pre, cur) => {
  return pre + cur.price;
}, 0);

console.log(countPrice, '1111111');
let arrObj = {
  wan: {name: 'i', price: 100},
  zhang: {
    name: 'ii',
    price: 200,
  },
  zhao: {
    name: 'iii',
    price: 300,
  },
};

for (let i in arrObj) {
  console.log('min', i);
  console.log('value', arrObj[i]);
  console.log('\n');
}
