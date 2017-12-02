import * as express from 'express';
import { Server } from "ws";

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
export class Comment {
  constructor(
    public id: number,
    public productId: number,
    public timestamp: string,
    public user: string,
    public rating: number,
    public content: string
  ) {}
}
const products: Product[] = [
  new Product(1, '第一个商品1', 1.99, 4, '这是第一个商品的描述', ['电子产品', '硬件设备']),
  new Product(2, '第二个商品1', 2.99, 5, '这是第二个商品的描述', ['图书']),
  new Product(3, '第三个商品2', 3.99, 2, '这是第三个商品的描述', ['硬件设备']),
  new Product(4, '第四个商品3', 4.99, 1, '这是第四个商品的描述', ['电子产品', '硬件设备']),
  new Product(5, '第五个商品3', 5.99, 3, '这是第五个商品的描述', ['电子产品']),
  new Product(6, '第六个商品3', 6.99, 5, '这是第六个商品的描述', ['图书', '硬件设备'])
];
const comments: Comment[] = [
  new Comment(1, 1, '2017-02-02 22:22:22', '张三', 3, '东西不错'),
  new Comment(2, 1, '2017-03-03 22:22:22', '张四', 5, '东西很不错'),
  new Comment(3, 1, '2017-04-04 22:22:22', '张五', 4, '东西非常不错'),
  new Comment(4, 2, '2017-05-05 22:22:22', '张六', 5, '东西真的很不错'),
  new Comment(5, 6, '2017-05-05 22:22:23', '李四', 5, '东西给好评'),
  new Comment(6, 3, '2017-05-05 22:22:24', '张七', 2, '还不错吧，给个好评'),
  new Comment(7, 4, '2017-05-05 22:22:25', '张八', 1, '宝贝还行，一般般'),
  new Comment(8, 5, '2017-05-05 22:22:26', '张九', 3, '宝贝非常可以'),
  new Comment(9, 3, '2017-05-05 22:22:26', '张十', 2, '宝贝可以')
];
app.get('/', (req, res) => {
  res.send("Hello Express");
});

app.get('/api/products', (req, res) => {
  let result = products;
  let params = req.query;
  if (params.title) {
    result = result.filter((p) => p.title.indexOf(params.title) !== -1);
  }
  if (params.price && result.length > 0) {
    result = result.filter((p) => p.price <= parseInt(params.price));
  }
  if (params.category && result.length > 0) {
    if (params.category !== '-1') {
      result = result.filter((p) => p.categories.indexOf(params.category) !== -1);
    }
  }
  res.json(result);
});

app.get('/api/product/:id', (req, res) => {
  res.json(products.find((product) => product.id == req.params.id));
});

app.get('/api/product/:id/comments', (req, res) => {
  res.json(comments.filter((comment: Comment) => comment.productId == req.params.id));
});

const server = app.listen(8000, "localhost", () => {
  console.log("服务器已经启动，地址是：http://localhost:8000");
});

const subscriptions = new Map<any, number[]>();

const wsServer = new Server({port: 8085});
wsServer.on('connection', (websocket) => { // 当连接的时候
  // websocket.send("这个消息是服务器主动推送的");   // 发送一个消息
  websocket.on("message", (message: string) => {
    let messageObj = JSON.parse(message);
    let productIds = subscriptions.get(websocket) || [];
    subscriptions.set(websocket, [...productIds, messageObj.productId]);
  })
});
const currentBids = new Map<number, number>();
// let count = 0;
setInterval(() => {
  /* if (wsServer.clients) { // 判断是否有客户端连接着
    wsServer.clients.forEach(client => { // 循环所有的客户端进行一个消息推送
      count++;
      client.send("这是定时推送第" + count + "条");
    })
  } */
  products.forEach( product => {
    let currentBid = currentBids.get(product.id) || product.price;
    let newBid = currentBid + Math.random() * 5;
    currentBids.set(product.id, newBid);
  });
  subscriptions.forEach((productIds: number[], ws) => {
    if (ws.readyState === 1) {
      let newBids = productIds.map( productId => ({
        productId: productId,
        bid: currentBids.get(productId)
      }));
      ws.send(JSON.stringify(newBids));
    } else {
      subscriptions.delete(ws);
    }
  })
}, 2000);


