import React from 'react';
import { Menu, MenuItem, ListItemIcon, Divider, Box, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Settings, 
  Store, 
  Repeat 
} from 'lucide-react';

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

  const customerTabs = [
    { label: 'Home', to: '/', icon: <Home className="w-5 h-5 shrink-0" /> },
    { label: 'Search', to: '/search', icon: <Search className="w-5 h-5 shrink-0" /> },
    { label: 'Orders', to: '/customer/bookings', icon: <ShoppingBag className="w-5 h-5 shrink-0" /> },
    { label: 'Favorites', to: '/favorites', icon: <Heart className="w-5 h-5 shrink-0" /> },
    { label: 'Account', onClick: handleProfileClick, icon: <User className="w-5 h-5 shrink-0" /> }
  ];

  const providerTabs = [
    { label: 'Dashboard', to: '/provider', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { label: 'Create', to: '/provider/create-listing', icon: <PlusCircle className="w-5 h-5 shrink-0" /> },
    { label: 'Orders', to: '/provider/bookings', icon: <ShoppingBag className="w-5 h-5 shrink-0" /> },
    { label: 'Account', onClick: handleProfileClick, icon: <User className="w-5 h-5 shrink-0" /> }
  ];

  const tabs = isProvider ? providerTabs : customerTabs;

  return (
    <>
      {/* Floating Bottom Navigation Bar */}
      <div className="fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 mx-4 md:hidden select-none">
        <div className="glass border border-white/40 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] px-2 py-2 flex items-center justify-around">
          {tabs.map((tab, idx) => {
            const isActive = getValue() === idx;
            return (
              <button
                key={tab.label}
                onClick={tab.onClick || (() => navigate(tab.to))}
                className={`flex items-center justify-center gap-2 py-2 px-3.5 transition-all duration-300 ease-in-out rounded-full cursor-pointer touch-target ${
                  isActive 
                    ? 'bg-brand-green text-white font-extrabold shadow-sm scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }`}
              >
                {tab.icon}
                {isActive && (
                  <span className="text-xs font-bold tracking-wide animate-fade-in">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MUI Popover Menu for Profile Actions */}
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
              <ListItemIcon><User className="w-4 h-4 text-slate-500" /></ListItemIcon> My Profile
            </MenuItem>,
            <MenuItem key="p-kitchen" onClick={handleClose} component={Link} to="/provider/kitchen">
              <ListItemIcon><Store className="w-4 h-4 text-slate-500" /></ListItemIcon> My Kitchen
            </MenuItem>,
            <MenuItem key="p-settings" onClick={handleClose} component={Link} to="/provider/settings">
              <ListItemIcon><Settings className="w-4 h-4 text-slate-500" /></ListItemIcon> Settings
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem key="c-profile" onClick={handleClose} component={Link} to="/customer/profile">
              <ListItemIcon><User className="w-4 h-4 text-slate-500" /></ListItemIcon> My Profile
            </MenuItem>,
            <MenuItem key="c-orders" onClick={handleClose} component={Link} to="/customer/bookings">
              <ListItemIcon><ShoppingBag className="w-4 h-4 text-slate-500" /></ListItemIcon> My Orders
            </MenuItem>,
            <MenuItem key="c-kitchens" onClick={handleClose} component={Link} to="/search">
              <ListItemIcon><Store className="w-4 h-4 text-slate-500" /></ListItemIcon> Search Kitchen
            </MenuItem>,
            <MenuItem key="c-subs" onClick={handleClose} component={Link} to="/customer/subscription">
              <ListItemIcon><Repeat className="w-4 h-4 text-slate-500" /></ListItemIcon> Subscription
            </MenuItem>
          ]
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ color: '#dc2626' }}>
          <ListItemIcon><LogOut className="w-4 h-4 text-red-600" /></ListItemIcon> Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default MobileNav;
