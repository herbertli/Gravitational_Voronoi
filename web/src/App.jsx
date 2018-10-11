import React, {
  Component
} from 'react';
import './App.css';
import Board from './Board';
import Sidebar from './Sidebar';
import Timer from './Timer';
import Gameover from './Gameover';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import openSocket from 'socket.io-client';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      in_lobby: true,
      reset: false,
      soft_reset: false,
      game_over: false,
      bitmap: "",
      move_col: -1,
      move_row: -1,
      num_players: 0,
      current_player: -1,
      player_names: [],
      player_times: [],
      player_scores: [],
      last_percentage: [],
      moves: [],
      timeTaken: 0
    }
  }

  clockInterval;
  clockStart;

  resetBoard() {
    this.setState({
      in_lobby: true,
      last_percentage: [],
      bitmap: "",
      moves: [],
      game_over: false
    });
  }

  softReset() {
    this.setState({
      moves: [],
      bitmap: "",
      game_over: false
    });
  }

  endGame() {
    clearInterval(this.clockInterval);
    this.setState({
      moves: [],
      bitmap: "",
      game_over: true
    });
  }

  init(names) {
    var pScores = [];
    var pTimes = [];
    var lScores = [];
    var percent = [];
    for (var i = 0; i < names.length; i++) {
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
      percentages: percent
    });
    this.resetClock(false);
  }

  componentDidMount() {
    this.socket = openSocket('http://localhost:10000');
    this.socket.on('to_client', (data) => {
      const gameState = JSON.parse(data);
      console.log(gameState);
      if (gameState['reset']) {
        this.resetBoard();
      } else if (this.state.in_lobby) {
        this.init(gameState["player_names"])
      } else if (gameState['soft-reset']) {
        this.softReset();
      } else if (gameState['game_over']) {
        this.endGame();
      } else {
        var nMoves = [...this.state.moves];
        if (nMoves.length === 0) {
          for (var i = 0; i < this.state.num_players; i++) {
            nMoves.push([]);
          }
        }
        var currentTurn = parseInt(gameState['current_player']);
        nMoves[currentTurn - 1].push([gameState['move_col'], gameState['move_row']]);
        this.setState({
          last_percentage: this.state.percentages,
          current_player: gameState['current_player'],
          player_scores: gameState['player_scores'],
          player_times: gameState['player_times'],
          bitmap: gameState['bitmap'],
          move_col: gameState['move_col'],
          move_row: gameState['move_row'],
          moves: nMoves
        });

        // calculate scores for current round of current game
        var percentages = [];
        var totalRoundScore = 0;
        this.state.player_scores.forEach((singleScore) => {
          totalRoundScore += parseInt(singleScore, 10);
        });
        this.state.player_scores.forEach((score) => {
          var percentageRoundScore = (100 * parseInt(score, 10) / totalRoundScore).toFixed(1);
          percentages.push(percentageRoundScore);
        });

        this.setState({
          percentages: percentages
        });
        this.resetClock(true);
      }
    });
  }

  resetClock(shouldClearInterval = false) {
    if (shouldClearInterval) {
      clearInterval(this.clockInterval);
      this.setState({
        timeTaken: 0
      });
    }
    this.clockInterval = setInterval(() => {
      this.setState({
        timeTaken: this.state.timeTaken + 1
      });
    }, 1000);
  }

  render() {
    console.log("current player:", this.state.current_player);
    return (
      <div>
        <Typography variant="h2" gutterBottom style={{ textAlign: "center" }}>
          Gravitational Voronoi
          </Typography>
        <Grid container spacing={32}>
          <Grid item xs={2} />
          {
            this.state.game_over ? <Grid item xs={8}>
              <Gameover
                player_names={this.state.player_names}
                total_scores={this.state.player_scores}
              />
            </Grid> :
              <Grid item xs={8}>
                <Sidebar
                  player_names={this.state.player_names}
                  player_scores={this.state.player_scores}
                  player_times={this.state.player_times}
                  last_percentage={this.state.last_percentage}
                  current_player={this.state.current_player}
                  percentages={this.state.percentages}
                />
                <br></br>
                <Timer timer={this.state.timeTaken} />
              </Grid>
          }
          <Grid item xs={2} />
          <Grid item xs={12}>
            <Board
              bitmap={this.state.bitmap}
              moves={this.state.moves}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;