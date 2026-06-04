import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Menu, MenuItem, ListItemIcon, Divider, Box, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import OrdersIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/AddCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

const MobileNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    if (!user) {
      navigate('/login');
      return;
    }
    event.preventDefault(); 
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  const isProvider = user?.role === 'provider';

  const getValue = () => {
    const path = location.pathname;
    if (isProvider) {
      if (path === '/provider') return 0;
      if (path === '/provider/create-listing') return 1;
      if (path.includes('bookings')) return 2;
      return 3;
    } else {
      if (path === '/') return 0;
      if (path === '/search' || path === '/food') return 1;
      if (path.includes('bookings')) return 2;
      if (path === '/favorites') return 3;
      return 4;
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        display: { xs: 'block', md: 'none' },
        borderTop: '1px solid #f3f4f6',
        pb: 'env(safe-area-inset-bottom)'
      }} 
      elevation={8}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: '#9ca3af',
          },
          '& .Mui-selected': {
            color: '#0A4D2B', // brand-green
          },
        }}
      >
        {isProvider ? [
          <BottomNavigationAction key="p-home" component={Link} to="/provider" label="Dashboard" icon={<DashboardIcon />} />,
          <BottomNavigationAction key="p-create" component={Link} to="/provider/create-listing" label="Create" icon={<AddIcon />} />,
          <BottomNavigationAction key="p-orders" component={Link} to="/provider/bookings" label="Orders" icon={<OrdersIcon />} />,
          <BottomNavigationAction key="p-profile" onClick={handleProfileClick} label="Profile" icon={<PersonIcon />} />
        ] : [
          <BottomNavigationAction key="c-home" component={Link} to="/" label="Home" icon={<HomeIcon />} />,
          <BottomNavigationAction key="c-browse" component={Link} to="/search" label="Search" icon={<SearchIcon />} />,
          <BottomNavigationAction key="c-orders" component={Link} to="/customer/bookings" label="Orders" icon={<OrdersIcon />} />,
          <BottomNavigationAction key="c-favorites" component={Link} to="/favorites" label="Favorites" icon={<FavoriteIcon />} />,
          <BottomNavigationAction key="c-profile" onClick={handleProfileClick} label="Profile" icon={<PersonIcon />} />
        ]}
      </BottomNavigation>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{
          elevation: 4,
          sx: {
            mb: 2,
            borderRadius: '16px',
            minWidth: 200,
          }
        }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{user.name}</Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', textTransform: 'capitalize' }}>{user.role}</Typography>
          </Box>
        )}
        <Divider sx={{ my: 0.5 }} />

        {isProvider ? (
          [
            <MenuItem key="p-profile" onClick={handleClose} component={Link} to="/provider/profile">
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> My Profile
            </MenuItem>,
            <MenuItem key="p-kitchen" onClick={handleClose} component={Link} to="/provider/kitchen">
              <ListItemIcon><StorefrontIcon fontSize="small" /></ListItemIcon> My Kitchen
            </MenuItem>,
            <MenuItem key="p-settings" onClick={handleClose} component={Link} to="/provider/settings">
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem key="c-profile" onClick={handleClose} component={Link} to="/customer/profile">
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> My Profile
            </MenuItem>,
            <MenuItem key="c-orders" onClick={handleClose} component={Link} to="/customer/bookings">
              <ListItemIcon><OrdersIcon fontSize="small" /></ListItemIcon> My Orders
            </MenuItem>,
            <MenuItem key="c-kitchens" onClick={handleClose} component={Link} to="/search">
              <ListItemIcon><StorefrontIcon fontSize="small" /></ListItemIcon> Search Kitchen
            </MenuItem>,
            <MenuItem key="c-subs" onClick={handleClose} component={Link} to="/customer/subscription">
              <ListItemIcon><SubscriptionsIcon fontSize="small" /></ListItemIcon> Subscription
            </MenuItem>
          ]
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ color: '#dc2626' }}>
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#dc2626' }} /></ListItemIcon> Logout
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default MobileNav;
