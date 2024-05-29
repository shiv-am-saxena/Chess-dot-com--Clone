const socket = io();
const chess = new Chess();
const board = document.querySelector('.chessboard');
let piece = null;
let srcSq = null;
let playerRole = null;


const renderBoard = () => {
    const brd = chess.board();
    board.innerHTML = "";
    brd.forEach((row, index) =>{
        row.forEach((sq, sqind) =>{
            const sqelem = document.createElement('div');
            sqelem.classList.add('square', (index + sqind ) % 2 == 0 ? 'light' : 'dark');
            sqelem.dataset.row = index;
            sqelem.dataset.col = sqind;

            if(sq){
                const pieceElem = document.createElement('div');
                pieceElem.classList.add('piece', sq.color === 'w' ? 'white' : 'black');
                pieceElem.innerHTML = getUnicode(sq);
                pieceElem.draggable = playerRole === sq.color;
                pieceElem.addEventListener('dragstart', (e)=>{
                    if(pieceElem.draggable){
                        piece = pieceElem;
                        srcSq = {row: index, col: sqind};
                        e.dataTransfer.setData('text/plain', "");
                    }
                });

                pieceElem.addEventListener('dragend', (e)=>{
                    piece = null;
                    srcSq = null;
                });


                sqelem.appendChild(pieceElem);
            }
            sqelem.addEventListener("dragover" , (e) =>{
                e.preventDefault();
            })
            sqelem.addEventListener("drop" , (e) =>{
                e.preventDefault();
                if(piece){
                    const targetSrc = {
                        row: parseInt(sqelem.dataset.row),
                        col: parseInt(sqelem.dataset.col)
                    };

                    handleMove(srcSq, targetSrc);
                }
            })
            board.appendChild(sqelem);
        });
    });
    if(playerRole === 'b'){
        board.classList.add('flipped');
    }
    else{
        board.classList.remove('flipped');
    }
};
const handleMove = (source, target) => {
    const move = {
        from : `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to : `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q'
    };
    socket.emit("move", move);
};
const getUnicode = (piece) => { 
    const unicode = {
        p: '♟︎',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
        P: '♙',
        N: '♘',
        B: '♗',
        R: '♖',
        Q: '♕',
        K: '♔'
};

    return unicode[piece.type] || '';
};

renderBoard();

socket.on('playerRole', (role) =>{
    playerRole = role;
    renderBoard();
});

socket.on('spectatorRole', (role)=>{
    playerRole = null;
    renderBoard();
});

socket.on('boardState', (fen) =>{
    chess.load(fen);
    renderBoard();
})
socket.on('move',(move)=>{
    chess.move(move);
    renderBoard();
})