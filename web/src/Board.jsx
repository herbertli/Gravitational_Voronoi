import React from 'react';
import PropTypes from 'prop-types';

function decompressBitmap(boardData) {
  const numericBoard = boardData.split(' ').map(Number);
  const decompressedBoard = [];
  let i = 0;
  for (let j = 0; ; j += 3) {
    for (let k = numericBoard[j]; k <= numericBoard[j + 1]; k += 1) {
      decompressedBoard.push(numericBoard[j + 2]);
    }
    if (numericBoard[j + 1] === 999) {
      i += 1;
      if (i === 1000) {
        break;
      }
    }
  }
  return decompressedBoard;
}

class Board extends React.Component {
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
    [0, 128, 128],
  ];

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidMount() {
    const { bitmap, moves } = this.props;
    const ctx = this.canvas.current.getContext('2d');
    if (!bitmap || !moves) {
      return;
    } else {
      this.drawBoard(ctx, bitmap);
      this.drawStones(ctx, moves);
    }
  }

  componentDidUpdate() {
    const { bitmap, moves } = this.props;
    const ctx = this.canvas.current.getContext('2d');
    if (!bitmap || !moves) {
      this.clearCanvas(ctx);
    } else {
      this.drawBoard(ctx, bitmap);
      this.drawStones(ctx, moves);
    }
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, 1000, 1000);
  }

  drawStones(ctx, moves) {
    for (let b = 0; b < moves.length; b += 1) {
      for (let a = 0; a < moves[b].length; a += 1) {
        const centerX = moves[b][a][0];
        const centerY = moves[b][a][1];
        const radius = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        const color = this.colors[b];
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
      }
    }
  }

  drawBoard(ctx, bitmap) {
    const board = decompressBitmap(bitmap);
    const imageData = ctx.getImageData(0, 0, 1000, 1000);
    const { data } = imageData;
    for (let y = 0; y < 1000; y += 1) {
      for (let x = 0; x < 1000; x += 1) {
        const index = (y * 1000 + x) * 4;
        const player = parseInt(board[index / 4], 10);
        if (player > 0) {
          const gridColor = this.colorRGB[player - 1];
          for (let i = 0; i < 3; i += 1) {
            data[index + i] = gridColor[i];
          }
          data[index + 3] = 125;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  render() {
    return (
      <canvas
        id="canvas"
        height={1000}
        width={1000}
        ref={this.canvas}
      />
    );
  }
}

Board.propTypes = {
  bitmap: PropTypes.string.isRequired,
  moves: PropTypes.array.isRequired,
};

export default Board;
