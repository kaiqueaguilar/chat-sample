import Express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient, User, Message } from '@prisma/client'


const db = new PrismaClient()
const app = Express();
const server = http.createServer(app);
const io = new Server(server);

app.post<{ name: string }>('/create-user', async (req, res) => {
  const user = await db.user.create({
    data: {
      name: req.body.name
    }
  })
  res.send(user);
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});