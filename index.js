const express = require('express');
const socket = require("socket.io");
const http = require('http');
const { Chess } = require("chess.js");
const path = require('path');
const { title } = require('process');
const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let crtPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
})

io.on("connection", function(uni_socket) {
    if (!players.white) {
        players.white = uni_socket.id;
        uni_socket.emit("role", "w");
    } else if (!players.black) {
        players.black = uni_socket.id;
        uni_socket.emit("role", "b");
    } else {
        uni_socket.emit("spaceRole")
    }
    uni_socket.on("disconnect", function() {
        if (uni_socket.id === players.white) {
            delete players.white
        } else if (uni_socket.id === players.black) {
            delete players.black
        }
    })

    uni_socket.on("move", (move) => {
        try {
            if (chess.turn() === 'w' && uni_socket.id != players.white) return;
            if (chess.turn() === 'b' && uni_socket.id != players.black) return;

            const result = chess.move(move);
            if (result) {
                crtPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            } else {
                console.log("invaild move");
                uni_socket.emit("invalidMove", move);
            }

        } catch (error) {
            console.log(error);
        }
    })
})


server.listen(3000);