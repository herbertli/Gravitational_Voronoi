import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const Timer = (props) => {
  const { timer } = props;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return (
    <React.Fragment>
      <Typography variant="h5" gutterBottom style={{ textAlign: 'center' }}>
          Move Timer (estimated):
      </Typography>
      <Typography variant="display1" gutterBottom style={{ textAlign: 'center' }}>
        {minutes}
        :
        {seconds < 10 ? '0' : ''}
        {seconds}
      </Typography>
    </React.Fragment>
  );
};

Timer.propTypes = {
  timer: PropTypes.number.isRequired,
};

export default Timer;
