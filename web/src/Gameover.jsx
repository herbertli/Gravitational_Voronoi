import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

class Gameover extends React.Component {

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
        let rows = this.props.player_names.map((name, i) => {
            return (
                <TableRow key={i}>
                    <TableCell style={{ background: this.colors[i] }}></TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{this.props.total_scores[i]}</TableCell>
                </TableRow>
            );
        });

        return (
            <div>
                <Typography variant="h5" gutterBottom style={{ textAlign: "center" }}>
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

export default Gameover;