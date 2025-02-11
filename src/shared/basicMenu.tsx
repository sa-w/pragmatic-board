import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface BasicMenuProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    handleClose: () => void;
  }
  
  export default function BasicMenu({ anchorEl, open, handleClose }: BasicMenuProps) {
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
        <MenuItem onClick={handleClose}>Rename</MenuItem>
        <MenuItem onClick={handleClose}>Clear</MenuItem>
        <MenuItem onClick={handleClose}>Delete</MenuItem>
      </Menu>
    );
  }
