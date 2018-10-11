import React from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

class Gameover extends React.Component {
  constructor(props) {
    super(props);
    this.colors = ['red', 'blue', 'green', 'orange', 'yellow', 'purple', 'silver', 'olive', 'teal'];
    this.colorRGB = [
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
  }

  render() {
    const {
      player_names,
      total_scores,
    } = this.props;
    const rows = player_names.map((name, i) => (
      <TableRow key={name}>
        <TableCell style={{ background: this.colors[i] }} />
        <TableCell>{name}</TableCell>
        <TableCell>{total_scores[i]}</TableCell>
      </TableRow>
    ));

    return (
      <div>
        <Typography variant="h5" gutterBottom style={{ textAlign: 'center' }}>
          Game Over!
          <br />
          Final Scores:
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Player Name</TableCell>
              <TableCell>Total Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </div>
    );
  }
}

Gameover.propTypes = {
  player_names: PropTypes.arrayOf(PropTypes.string).isRequired,
  total_scores: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default Gameover;
