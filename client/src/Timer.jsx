import React from 'react';
import Typography from '@material-ui/core/Typography';

const Timer = (props) => {
    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Current Move Time
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                {props.timeTaken}
            </Typography>
        </div>
    )
}

export default Timer;