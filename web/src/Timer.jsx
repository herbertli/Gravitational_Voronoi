import React from 'react';
import Typography from '@material-ui/core/Typography';

const Timer = (props) => {
    var minutes = Math.floor(props.timer / 60);
    var seconds = props.timer % 60;
    return (
        <React.Fragment>
            <Typography variant="h5" gutterBottom style={{ textAlign: "center" }}>
                Move Timer (estimated):
            </Typography>
            <Typography variant="display1" gutterBottom style={{ textAlign: "center" }}>
                {minutes}:{seconds < 10 ? "0" : ""}{seconds}
            </Typography>
        </React.Fragment>
    );
}

export default Timer;