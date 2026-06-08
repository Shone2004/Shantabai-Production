import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PrivateRoute({ children, requiredRole, bypassApprovalCheck = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const userRoleUpper = user.role?.toUpperCase();
    const reqRoleUpper = requiredRole.toUpperCase();

    const isChef = userRoleUpper === 'PROVIDER' || userRoleUpper === 'CHEF';
    const wantsChef = reqRoleUpper === 'PROVIDER' || reqRoleUpper === 'CHEF';

    if (wantsChef && !isChef) {
      return <Navigate to="/" replace />;
    }

    if (!wantsChef && userRoleUpper !== reqRoleUpper) {
      return <Navigate to="/" replace />;
    }

    // Check verification status for chef/provider roles
    if (isChef && !bypassApprovalCheck) {
      if (user.verificationStatus !== 'APPROVED') {
        return <Navigate to="/chef/verification-status" replace />;
      }
    }
  }

  return children;
}