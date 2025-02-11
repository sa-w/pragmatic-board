import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface HandleClose {
  (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason): void;
}

export default function SimpleSnackbar({show, message, close}:{show: boolean, message: string, close: HandleClose}){
  const [key, setKey] = React.useState(0);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
  };

  return (
    <div>
      {/*<Button onClick={handleClick}>Open Snackbar</Button>*/}
      <Snackbar
        open={show}
        anchorOrigin={{    vertical: 'top',
          horizontal: 'right'}}
        autoHideDuration={6000}
        onClose={close}
        message={message}
      />
    </div>
  );
}