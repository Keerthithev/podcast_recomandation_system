import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { logout } from '../features/authSlice';
import type { RootState } from '../app/store';

export const Navigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar sx={{ minHeight: 64, width: '100%' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => navigate('/')}
        >
          <AccountCircle />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Podcast Recommendations
        </Typography>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleMenu}
              color="inherit"
            >
              {user?.photoURL ? (
                <Avatar src={user.photoURL} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
                {user?.name || 'User'}
              </MenuItem>
              <MenuItem onClick={() => {
                navigate('/profile');
                handleClose();
              }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => {
                navigate('/recommendations');
                handleClose();
              }}>
                Recommendations
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
