import fastify from 'fastify';
import cors from '@fastify/cors'
import { App } from 'uWebSockets.js';
import { PrismaClient } from '@prisma/client'

const WebSocketServer = App();
const HttpServer = fastify();
const db = new PrismaClient();

HttpServer.register(cors);

HttpServer.post<{ Body: { name: string } }>('/login', async (req, res) => {
  const user = await db.user.create({ data: req.body });
  res.send(user);
});

WebSocketServer.ws('/', {
  open: async (ws) => {
    const messageHistory = await db.message.findMany({ include: { user: true } });
    const postedMessage = JSON.stringify(messageHistory);

    ws.subscribe('chat')
    ws.send(postedMessage);
  },
  message: async (ws, message) => {
    const decodedMessage = JSON.parse(Buffer.from(message).toString());
    const messageData = await db.message.create({ data: decodedMessage, include: { user: true } });
    const encodedMessage = JSON.stringify([messageData]);

    ws.publish('chat', encodedMessage);
    ws.send(encodedMessage);
  }
});

WebSocketServer.listen(3003, function () {
  console.log('WebSocketServer listening to port 3003')
});

HttpServer.listen({ port: 3000 }, function () {
  console.log('HttpServer listening to port 3000')
});;

