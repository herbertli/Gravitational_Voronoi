import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import openSocket from 'socket.io-client';
import './App.css';
import Board from './Board';
import Sidebar from './Sidebar';
import Timer from './Timer';
import Gameover from './Gameover';

class App extends React.Component {
  clockInterval = setInterval(() => {
    const { timeTaken } = this.state;
    this.setState({
      timeTaken: timeTaken + 1,
    });
  }, 1000);;

  constructor(props) {
    super(props);
    this.state = {
      in_lobby: true,
      game_over: false,
      bitmap: '',
      num_players: 0,
      current_player: -1,
      player_names: [],
      player_times: [],
      player_scores: [],
      last_percentage: [],
      moves: [],
      timeTaken: 0,
    };
  }

  componentDidMount() {
    this.socket = openSocket('http://localhost:10000');
    this.socket.on('to_client', (data) => {
      const {
        in_lobby, moves, num_players, player_scores, percentages,
      } = this.state;
      const gameState = JSON.parse(data);
      if (gameState.reset) {
        this.resetBoard();
      } else if (in_lobby) {
        this.init(gameState.player_names);
      } else if (gameState['soft-reset']) {
        this.softReset();
      } else if (gameState.game_over) {
        this.endGame();
      } else {
        const nMoves = [...moves];
        if (nMoves.length === 0) {
          for (let i = 0; i < num_players; i += 1) {
            nMoves.push([]);
          }
        }
        const currentTurn = parseInt(gameState.current_player, 10);
        nMoves[currentTurn - 1].push([gameState.move_col, gameState.move_row]);

        // calculate scores for current round of current game
        const nPercentages = [];
        let totalRoundScore = 0;
        player_scores.forEach((singleScore) => {
          totalRoundScore += parseInt(singleScore, 10);
        });
        player_scores.forEach((score) => {
          const percentageRoundScore = (100 * parseInt(score, 10) / totalRoundScore).toFixed(1);
          nPercentages.push(percentageRoundScore);
        });

        this.setState({
          percentages: nPercentages,
          last_percentage: percentages,
          current_player: gameState.current_player,
          player_scores: gameState.player_scores,
          player_times: gameState.player_times,
          bitmap: gameState.bitmap,
          moves: nMoves,
          timeTaken: 0,
        });
      }
    });
  }

  resetBoard() {
    this.setState({
      in_lobby: true,
      last_percentage: [],
      bitmap: '',
      moves: [],
      game_over: false,
    });
  }

  softReset() {
    this.setState({
      moves: [],
      bitmap: '',
      game_over: false,
    });
  }

  endGame() {
    this.setState({
      moves: [],
      bitmap: '',
      game_over: true,
      timeTaken: 0,
    });
  }

  init(names) {
    const pScores = [];
    const pTimes = [];
    const lScores = [];
    const percent = [];
    for (let i = 0; i < names.length; i += 1) {
      pScores.push(0);
      pTimes.push(120.0);
      lScores.push(0);
      percent.push(0);
    }
    this.setState({
      player_names: names,
      player_scores: pScores,
      player_times: pTimes,
      num_players: names.length,
      last_percentage: lScores,
      in_lobby: false,
      percentages: percent,
      timeTaken: 0,
    });
  }

  render() {
    const {
      game_over,
      player_names,
      player_scores,
      player_times,
      last_percentage,
      current_player,
      percentages,
      timeTaken,
      bitmap,
      moves,
    } = this.state;
    return (
      <div>
        <Typography variant="h2" gutterBottom style={{ textAlign: 'center' }}>
          Gravitational Voronoi
        </Typography>
        <Grid container spacing={32}>
          <Grid item xs={2} />
          {
            game_over ? (
              <Grid item xs={8}>
                <Gameover
                  player_names={player_names}
                  total_scores={player_scores}
                />
              </Grid>
            ) : (
              <Grid item xs={8}>
                <Sidebar
                  player_names={player_names}
                  player_scores={player_scores}
                  player_times={player_times}
                  last_percentage={last_percentage}
                  current_player={current_player}
                  percentages={percentages}
                />
                <br />
                <Timer timer={timeTaken} />
              </Grid>
            )
          }
          <Grid item xs={2} />
          <Grid item xs={12}>
            <Board
              bitmap={bitmap}
              moves={moves}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
