import React from 'react';
import { Menu, MenuItem, ListItemIcon, Divider, Box, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    { label: 'Search', to: '/food', icon: <Search className="w-5 h-5 shrink-0" /> },
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
        <div className="border border-slate-200/60 rounded-[28px] shadow-[0_12px_40px_rgba(15,23,42,0.09)] px-3 py-2.5 flex items-center justify-around bg-white/95 backdrop-blur-md">
          {tabs.map((tab, idx) => {
            const isActive = getValue() === idx;
            return (
              <button
                key={tab.label}
                onClick={tab.onClick || (() => navigate(tab.to))}
                className="relative flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-full cursor-pointer touch-target transition-all duration-300 ease-out select-none outline-none"
              >
                {/* Framer Motion Sliding Active Background Pill */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-brand-green rounded-full shadow-[0_4px_12px_rgba(10,77,43,0.22)] -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon with spring scale transition */}
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.12 : 1,
                    color: isActive ? '#FFFFFF' : '#64748B' // Slate-500 for normal state, more visible
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  {tab.icon}
                </motion.div>

                {/* Active label fade transition */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="text-[10px] font-black tracking-wide text-white font-jakarta uppercase"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
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
