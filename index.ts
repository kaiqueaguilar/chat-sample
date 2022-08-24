import Fastify from 'fastify';
import WebSocket from '@fastify/websocket';
import { PrismaClient, User, Message } from '@prisma/client'


const db = new PrismaClient()
const server = Fastify();
server.register(WebSocket);


server.get('/',  (req, res) => {
  res.send('hello world');
});

server.post<{ Body: { name : string } }>('/create-user', async (req, res) => {
  const user = await db.user.create({ data: req.body })
  res.send(user);
});

server.post<{ Params: { userId: number } }>('/message', { websocket: true }, (connection, req) => {
  connection.socket.on('message', async (message: string) => {

    const data = await db.message.create({
      data: {
        user_id: req.params.userId,
        text: message,
      }
    });
    
    connection.socket.send(data);
  });
});


server.listen({ port: 3003 }, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  console.log(`server listening on ${address}`)
});