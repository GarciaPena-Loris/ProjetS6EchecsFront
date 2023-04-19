import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ component: Component, ...rest }) => {
    const isAuthenticated = sessionStorage.getItem('token') != null;
    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/connexion" replace />;
};

export default RequireAuth;
