import { Server } from "socket.io"
import http from "http" // built in to node
import express from "express"

const app = express()
const server = http.createServer(app) // create a http server from a express app
// HTTP server này sẽ được dùng bởi cả Express (cho các request HTTP) và Socket.IO (cho giao tiếp WebSocket).
const io = new Server(server, { // Gắn Socket.IO vào HTTP server đã tạo, cho phép giao tiếp thời gian thực qua WebSocket.
  cors: {
    origin: ["http://localhost:5173"]// help the backend to communicate with frontend
  }
})

// lấy socketId theo userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
}



// dùng để chứa những user đang online
const userSocketMap = {} // {userId : socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id)

  const userId = socket.handshake.query.userId
  if (userId) userSocketMap[userId] = socket.id
  // gửi sự kiện tới tất cả các client đã kết nối khác
  io.emit("getOnlineUsers", Object.keys(userSocketMap)) // danh sách các userId đang online

  socket.on("disconnect", () => {
    console.log("A user disconnted", socket.id)
    delete userSocketMap[userId]
    // gửi sự kiện tới tất cả các client đã kết nối khác
    io.emit("getOnlineUsers", Object.keys(userSocketMap)) // danh sách các userId đang online
  })
})

export { io, app, server }