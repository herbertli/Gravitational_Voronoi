import React from 'react';

class Board extends React.Component {

    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    colors = ['red', 'blue', 'green', 'orange', 'yellow', 'purple', 'silver', 'olive', 'teal'];
    colorRGB = [
        [255, 0, 0],
        [0, 0, 255],
        [0, 255, 0],
        [255, 165, 0],
        [255, 255, 0],
        [128, 0, 128],
        [192, 192, 192],
        [128, 128, 0],
        [0, 128, 128]
    ];

    decompressBitmap(boardData) {
        const numericBoard = boardData.split(" ").map(Number);
        const decompressedBoard = [];
        let i = 0;
        for (let j = 0; ; j += 3) {
            for (let k = numericBoard[j]; k <= numericBoard[j + 1]; k++) {
                decompressedBoard.push(numericBoard[j + 2]);
            }
            if (numericBoard[j + 1] === 999) {
                i += 1
                if (i === 1000) {
                    break;
                }
            }
        }
        return decompressedBoard;
    }

    drawStones(ctx, moves) {
        for (var b = 0; b < moves.length; b++) {
            for (var a = 0; a < moves[b].length; a++) {
                var centerX = moves[b][a][0];
                var centerY = moves[b][a][1];
                var radius = 10;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                var color = this.colors[b];
                ctx.fillStyle = color;
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
            }
        }
    }

    drawBoard(ctx, bitmap) {
        var board = this.decompressBitmap(bitmap);
        var imageData = ctx.getImageData(0, 0, 1000, 1000);
        var data = imageData.data;
        for (var y = 0; y < 1000; y++) {
            for (var x = 0; x < 1000; x++) {
                var index = (y * 1000 + x) * 4;
                var player = parseInt(board[index / 4]);
                if (player > 0) {
                    var gridColor = this.colorRGB[player - 1];
                    data[index] = gridColor[0];
                    data[++index] = gridColor[1];
                    data[++index] = gridColor[2];
                    data[++index] = 125;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    componentDidUpdate() {
        let ctx = this.canvas.current.getContext("2d");
        if (!this.props.bitmap || this.props.bitmap === "" || this.props.moves.length === 0) {
            return;
        }
        this.drawBoard(ctx, this.props.bitmap);
        this.drawStones(ctx, this.props.moves);
    }

    render() {
        return <canvas
            id={"canvas"}
            height={1000}
            width={1000}
            ref={this.canvas}
        />
    }

}

export default Board;