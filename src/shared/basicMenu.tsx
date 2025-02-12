import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface BasicMenuProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    handleClose: () => void;
    rename: (name: string) => void;
    clear: () => void;
  }
  
  export default function BasicMenu({ anchorEl, open, handleClose, rename, clear }: BasicMenuProps) {
    return (
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => rename}>Rename</MenuItem>
        <MenuItem onClick={clear}>Clear</MenuItem>
        <MenuItem onClick={handleClose}>Delete</MenuItem>
      </Menu>
    );
  }
