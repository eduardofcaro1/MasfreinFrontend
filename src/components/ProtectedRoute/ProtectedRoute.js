import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, adminOnly, ...rest }) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAuthenticated = !!userData;
    const isAdmin = userData?.isAdmin === 1;

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;