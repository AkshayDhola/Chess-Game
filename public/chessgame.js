const socket = io();
const chess = new Chess();
const boaredElem = document.querySelector(".chessB");


let draggedPiece = null;
let sourceSqaure = null;
let role = null;

const renderBoard = () => {
    const board = chess.board();
    boaredElem.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((sqaure, i) => {
            const sqaElem = document.createElement("div");
            sqaElem.classList.add("square", (rowIndex + i) % 2 === 0 ? "light" : "dark")
            sqaElem.dataset.row = rowIndex;
            sqaElem.dataset.col = i;

            if (sqaure) {
                const pieceElem = document.createElement("div");
                pieceElem.classList.add("piece", sqaure.color === "w" ? "white" : "black")
                pieceElem.innerText = getPieceUnicode(sqaure);
                pieceElem.draggable = role === sqaure.color;
                pieceElem.addEventListener("dragstart", (e) => {
                    if (pieceElem.draggable) {
                        draggedPiece = pieceElem;
                        sourceSqaure = { row: rowIndex, col: i };
                        e.dataTransfer.setData("text/plain", "");
                    }
                })
                pieceElem.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSqaure = null;
                })
                sqaElem.appendChild(pieceElem);
            }
            sqaElem.addEventListener("dragover", function(e) {
                e.preventDefault();
            })
            sqaElem.addEventListener("drop", function(e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(sqaElem.dataset.row),
                        col: parseInt(sqaElem.dataset.col)
                    }

                    handleMove(sourceSqaure, targetSource);
                }
            })
            boaredElem.append(sqaElem);
        })
    });


}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q'
    }

    socket.emit("move", move);
}

const getPieceUnicode = (piece) => {
    const unicodePiecese = {
        p: "♟︎",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };

    return unicodePiecese[piece.type] || "";

}

socket.on("role", function(i) {
    role = i;
    renderBoard();
})

socket.on("spaceRole", function() {
    role = null;
    renderBoard();
})

socket.on("boardState", function(fen) {
    chess.load(fen);
    renderBoard();
})

socket.on("move", function(fen) {
    chess.move(fen);
    renderBoard();
})
renderBoard();
handleMove();