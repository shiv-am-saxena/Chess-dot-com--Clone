const express = require('express');
const socket = require('socket.io');
const http = require('http');
const {Chess} = require('chess.js');
const path = require('path');
require('dotenv').config();
const dbgr = require('debug')('development:server');


const app = express();
const server =  http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currPlayer = "W";

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));


app.get('/', (req,res)=>{
    res.render('index', {title:"Chess Game"});
})

io.on("connection", (uniqSocket)=>{
    console.log('connected');

    if(!players.white){
        players.white = uniqSocket.id;
        uniqSocket.emit('playerRole', 'w');
    }
    else if(!players.black){
        players.black = uniqSocket.id;
        uniqSocket.emit("playerRole", 'b');
    }
    else{
        uniqSocket.emit('spectatorRole');
    }

    uniqSocket.on('disconnect',()=>{
        console.log("disconnected");
        if(uniqSocket.id === players.white){
            delete players.white;
        }
        else if( uniqSocket.id === players.black){
            delete players.black;
        }
    })



    uniqSocket.on('move', (move)=>{
        try{
            if(chess.turn() == 'w' && uniqSocket.id !== players.white) return;
            if(chess.turn() == 'b' && uniqSocket.id !== players.black) return;

            const res = chess.move(move);
            if(res){
                currPlayer = chess.turn();
                io.emit('move', move);
                io.emit('boardState', chess.fen());
            }
            else{
                console.log('Invalid Move: ',move);
                uniqSocket.emit("Invalid move: ", move);
            }
        }
        catch(err){
            console.log(err);
            uniqSocket.emit("Invalid Move: ", move);
        }
    })
})

server.listen( process.env.PORT , ()=>{
    dbgr(`Connected to http://127.0.0.1:${process.env.PORT}`);
})