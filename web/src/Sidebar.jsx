import React from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});

class Sidebar extends React.Component {
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
      classes,
      player_names,
      current_player,
      player_times,
      percentages,
      last_percentage,
    } = this.props;

    let rows;
    if (!player_names || player_names.length === 0) {
      rows = <TableRow key="noPlayers" />;
    } else {
      rows = player_names.map((name, i) => (
        <TableRow key={name} selected={(current_player % player_names.length) === i}>
          <TableCell style={{ background: this.colors[i] }} />
          <TableCell>{name}</TableCell>
          <TableCell>{percentages[i]}</TableCell>
          <TableCell>{last_percentage[i]}</TableCell>
          <TableCell>{`${player_times[i].toFixed(1)}s`}</TableCell>
        </TableRow>
      ));
    }

    return (
      <div className={classes.root}>
        <Typography variant="h5" gutterBottom style={{ textAlign: 'center' }}>
          Players in Lobby
        </Typography>
        <Table padding="dense" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Player Name</TableCell>
              <TableCell>Current Score</TableCell>
              <TableCell>Last Score</TableCell>
              <TableCell>Time Left</TableCell>
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

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  player_names: PropTypes.array.isRequired,
  current_player: PropTypes.number.isRequired,
  player_times: PropTypes.array.isRequired,
  percentages: PropTypes.array.isRequired,
  last_percentage: PropTypes.array.isRequired,
};

export default withStyles(styles)(Sidebar);
