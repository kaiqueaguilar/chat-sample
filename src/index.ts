import { App } from 'uWebSockets.js';
import fastify from 'fastify';
import { PrismaClient } from '@prisma/client'

const WebSocketServer = App();
const HttpServer = fastify();
const db = new PrismaClient();

HttpServer.get<{ Params: string }>('/login', async (req, res) => {
  console.log(req.params)
  const user = await db.user.create({ data: { name: req.params } });

  res.send(user);
});

WebSocketServer.ws('/chat', {
  open: (ws) => ws.subscribe('chat'),
  close: (ws) => ws.unsubscribe('chat'),
  message: (ws, message: ArrayBuffer) => {
    const text = Buffer.from(message).toString();
    ws.publish('chat', text);
    ws.send(text);
  }
});

WebSocketServer.listen(3003, function () {
  console.log('WebSocketServer listening to port 3333')
});

HttpServer.listen({ port: 3000 }, function () {
  console.log('HttpServer listening to port 3000')
});;

