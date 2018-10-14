import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { subscribeToSocketIO, subscribeToFirebase } from './subscribers';
import './App.css';
import Board from './Board';
import Sidebar from './Sidebar';
import Timer from './Timer';
import Gameover from './Gameover';

class App extends React.Component {
  clockInterval = setInterval(() => {
    const { timeTaken, in_lobby, game_over } = this.state;
    if (!in_lobby && !game_over) {
      this.setState({
        timeTaken: timeTaken + 1,
      });
    }
  }, 1000);

  constructor(props) {
    super(props);
    this.state = {
      in_lobby: true,
      game_over: false,
      bitmap: '',
      num_players: 0,
      current_player: 0,
      player_names: [],
      player_times: [],
      player_scores: [],
      last_percentage: [],
      percentages: [],
      moves: [],
      timeTaken: 0,
      choseBE: false
    };
  }

  parseData = (gameState) => {
    const {
      in_lobby, num_players, moves, percentages,
    } = this.state;
    if (gameState.reset) {
      console.log("Reset");
      this.resetBoard();
    } else if (in_lobby) {
      console.log("In Lobby");
      this.init(gameState.player_names);
    } else if (gameState['soft-reset']) {
      console.log("Soft Reset");
      this.softReset();
    } else if (gameState.game_over) {
      console.log("Game Over");
      this.endGame();
    } else {
      console.log("Playing Game");
      const { game_over } = this.state;
      const { player_scores, player_times, current_player, player_names } = gameState;
      if (game_over) {
        const nMoves = [];
        const { player_names } = gameState;
        const pScores = [];
        const pTimes = [];
        const lScores = [];
        const percent = [];
        for (let i = 0; i < player_names.length; i += 1) {
          pScores.push(0);
          pTimes.push(120.0);
          lScores.push('--');
          percent.push(0);
        }
        this.setState({
          last_percentage: lScores,
          percentages: percent,
          current_player: 0,
          player_names,
          player_scores: pScores,
          player_times: pTimes,
          bitmap: '',
          moves: nMoves,
          timeTaken: 0,
          game_over: false,
        });
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
          if (score === 0) nPercentages.push(0);
          else {
            const percentageRoundScore = (100 * parseInt(score, 10) / totalRoundScore).toFixed(1);
            nPercentages.push(percentageRoundScore);
          }
        });
        this.setState({
          last_percentage: percentages,
          percentages: nPercentages,
          current_player,
          player_scores,
          player_times,
          player_names,
          bitmap: gameState.bitmap,
          moves: nMoves,
          timeTaken: 0,
        });
      }
    }
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
    const { player_names, current_player } = this.state;
    const pScores = [];
    const pTimes = [];
    const lScores = [];
    const percent = [];
    for (let i = 0; i < player_names.length; i += 1) {
      pScores.push(0);
      pTimes.push(120.0);
      lScores.push('--');
      percent.push(0);
    }
    this.setState({
      current_player: current_player + 1,
      moves: [],
      player_scores: pScores,
      player_times: pTimes,
      last_percentage: lScores,
      percentages: percent,
      bitmap: '',
      game_over: false,
    });
  }

  endGame() {
    this.setState({
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
      lScores.push('--');
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
      choseBE
    } = this.state;
    console.log(this.state);
    if (!choseBE) {
      return (
        <div>
          <Typography variant="h1" gutterBottom style={{ textAlign: 'center' }}>
            Gravitational Voronoi
          </Typography>
          <Grid container spacing={40} direction="row" justify="center" alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h3" gutterBottom style={{ textAlign: 'center' }}>
                Which version of the app am I running?
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" size="large" onClick={() => {
                subscribeToFirebase((data) => this.parseData(data));
                this.setState({
                  choseBE: true
                })
              }}>
                Firebase
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" size="large" onClick={() => {
                subscribeToSocketIO((data) => this.parseData(data));
                this.setState({
                  choseBE: true
                })
              }}>
                Socket.IO
              </Button>
            </Grid>
          </Grid>
        </div>
      );
    }

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
