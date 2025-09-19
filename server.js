const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const open = (...args) => import('open').then(({default: open}) => open(...args));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Endpoint principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "PeronPlanning.html"));
});

// Endpoint de login
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username || username.trim() === "") {
    return res.status(400).send({ success: false, message: "Usuario inválido" });
  }

  const filePath = path.join(__dirname, "users.json");
  let users = [];
  if (fs.existsSync(filePath)) {
    users = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  if (!users.includes(username)) {
    users.push(username);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    io.emit("new-user", username);
  }

  res.send({ success: true, username });
});

// Endpoint de logout
app.post("/logout", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).send({ success: false });

  const filePath = path.join(__dirname, "users.json");
  let users = [];
  if (fs.existsSync(filePath)) {
    users = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  // Quitar al usuario
  users = users.filter(u => u !== username);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  // Notificar a todos los clientes
  io.emit("user-left", username);

  res.send({ success: true });
});

// Socket.io para tiempo real
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  // Mandar lista de usuarios al cliente que se conectó
  const filePath = path.join(__dirname, "users.json");
  let users = [];
  if (fs.existsSync(filePath)) {
    users = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  socket.emit("users-list", users);

  // Guardamos qué usuario está conectado en este socket
  socket.on("register-user", (username) => {
    socket.username = username; // asociamos el usuario al socket
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.username);

    if (!socket.username) return;

    // Actualizamos users.json quitando al usuario desconectado
    let users = [];
    if (fs.existsSync(filePath)) {
      users = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    users = users.filter(u => u !== socket.username);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    // Emitir a todos que un usuario se fue
    io.emit("user-left", socket.username);
  });
});


// Iniciar servidor
httpServer.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await open(`http://localhost:${PORT}`);
});
