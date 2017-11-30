import * as express from 'express';
const app = express();
export class Product {
  constructor(
    public id: number,
    public title: string,
    public price: number,
    public rating: number,
    public desc: string,
    public categories: Array<string>
  ) {
  }
}
const products: Product[] = [
  new Product(1, '第一个商品1', 1.99, 4, '这是第一个商品的描述', ['电子产品', '硬件设备']),
  new Product(2, '第二个商品1', 2.99, 5, '这是第二个商品的描述', ['图书']),
  new Product(3, '第三个商品2', 3.99, 2, '这是第三个商品的描述', ['硬件设备']),
  new Product(4, '第四个商品3', 4.99, 1, '这是第四个商品的描述', ['电子产品', '硬件设备']),
  new Product(5, '第五个商品3', 5.99, 3, '这是第五个商品的描述', ['电子产品']),
  new Product(6, '第六个商品3', 6.99, 5, '这是第六个商品的描述', ['图书', '硬件设备'])
];
app.get('/', (req, res) => {
  res.send("Hello Express");
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  res.json(products.find((product) => product.id == req.params.id));
});

const server = app.listen(8000, "localhost", () => {
  console.log("服务器已经启动，地址是：http://localhost:8000");
});