import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
        navigate('/');
        return null;
    }

    return (
        <div className="home-container">
            <h2>Bem-vindo, {userData.nomeUsuario}!</h2>
            <p><strong>Usuário:</strong> {userData.dscUsuario}</p>
            <p><strong>Instituição:</strong> {userData.instituicao.nome}</p>
            <p><strong>Admin:</strong> {userData.isAdmin ? 'Sim' : 'Não'}</p>
        </div>
    );
};

export default Home;