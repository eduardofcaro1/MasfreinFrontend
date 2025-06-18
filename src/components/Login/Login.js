import { Alert, Snackbar } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: false, password: false });
  const [openSnackErro, setOpenSnackErro] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {
      username: username.trim() === '',
      password: password.trim() === ''
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    const loginData = {
      dscUsuario: username,
      senhaUsuario: password
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userData', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        const errorData = await response.text();
        setErrorMessage(errorData || 'Erro ao fazer login');
        setOpenSnackErro(true);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
      setOpenSnackErro(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackErro(false);
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <img src="/masfrein.jpg" alt="Logo" className="login-logo" />
        <form onSubmit={handleSubmit}>
          <h2>MASFREIN</h2>
          <div className="input-container">
            <input
              type="text"
              id="username"
              placeholder="Login..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? 'input-error' : ''}
              autoComplete="username"
            />
            {errors.username && <span className="error-message">Login é obrigatório</span>}
          </div>
          <div className="input-container">
            <input
              type="password"
              id="password"
              placeholder="Senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'input-error' : 'input-senha'}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">Senha é obrigatória</span>}
          </div>
          <div className="btn-login-container">
            <button type="submit">Entrar</button>
            <button type="button" onClick={() => navigate('/register')}>Cadastrar</button>
          </div>
        </form>
        <Snackbar
          open={openSnackErro}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Alert
            onClose={handleClose}
            severity="error"
            sx={{
              backgroundColor: 'red',
              color: '#fff',
              fontSize: '1rem',
            }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Login;