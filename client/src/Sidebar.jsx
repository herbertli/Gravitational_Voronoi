import React from 'react';
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

    render() {
        const { classes } = this.props;

        let rows;
        if (!this.props.player_names || this.props.player_names.length === 0) {
            rows = <TableRow key={0}></TableRow>
        } else {
            rows = this.props.player_names.map((name, i) => {
                return (
                    <TableRow key={i} selected={this.props.current_player % this.props.player_names.length === i ? true : false}>
                        <TableCell style={{ background: this.colors[i] }}></TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{this.props.percentages[i]}</TableCell>
                        <TableCell>{this.props.last_percentage[i]}</TableCell>
                        <TableCell>{this.props.player_times[i].toFixed(1) + "s"}</TableCell>
                    </TableRow>
                );
            });
        }

        return (
            <div className={classes.root}>
                <Typography variant="h5" gutterBottom style={{ textAlign: "center" }}>
                    Players in Lobby
                </Typography>
                <Table padding={"dense"} className={classes.table}>
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

export default withStyles(styles)(Sidebar);