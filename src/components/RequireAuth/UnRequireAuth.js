import React from 'react';
import { Navigate } from 'react-router-dom';

const UnRequireAuth = ({ component: Component, ...rest }) => {
    const isAuthenticated = sessionStorage.getItem('token') != null;
    return isAuthenticated ? <Navigate to="/selectionExercices" replace /> : <Component {...rest} />;
};

export default UnRequireAuth;
