import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Perfil.css';
import Loading from '../Loading/Loading';


const Perfil = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
   
    
    const [creatingSemestre, setCreatingSemestre] = useState(null);
    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        setUserData(storedUserData);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            setErrorMessage('As senhas não coincidem.');
            setOpenSnackErro(true);
            return;
        }

        const token = userData?.token;
        const userId = userData?.id;

        try {
            const response = await fetch(`${API_BASE_URL}/users/alterarSenha/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senhaAntiga: currentPassword,
                    novaSenha: newPassword,
                }),
            });

            if (response.ok) {
                setSuccessMessage('Senha alterada com sucesso!');
                setOpenSnackSucesso(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

                localStorage.removeItem('userData');
                navigate('/');
            } else {
                const error = await response.text();
                setErrorMessage(`Erro ao alterar senha: ${error}`);
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            setErrorMessage('Ocorreu um erro ao alterar a senha. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const handleAddEditClick = (semestre) => {
        setCreatingSemestre(semestre);
    };

    const handleAddCloseModal = () => {
        setCreatingSemestre(null);
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };

    return (
        <div className='container-root'>
            <Snackbar
                open={openSnackErro}
                autoHideDuration={3000}
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
            <Snackbar
                open={openSnackSucesso}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity="success"
                    sx={{
                        backgroundColor: 'green',
                        color: '#fff',
                        fontSize: '1rem',
                    }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
            <div class="titulo-container">
                <h2 class="titulo">Perfil do Usuário</h2>
                <button class="editar-senha-btn" onClick={() => handleAddEditClick('novo')}><FaPencilAlt className="menu-icon" />Alterar Senha</button>
            </div>
            {userData && (
                <div className="user-info">
                    <p><strong>Nome:</strong> {userData.nomeUsuario}</p>
                    <p><strong>Instituição:</strong> {userData.instituicao?.nome}</p>
                    <p><strong>Celular:</strong> {userData.celular}</p>
                    <p><strong>Admin:</strong> {userData.isAdmin ? 'Sim' : 'Não'}</p>
                    <p><strong>Professor:</strong> {userData.flgProfessor ? 'Sim' : 'Não'}</p>
                </div>
            )}
            {creatingSemestre && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleAddCloseModal}>&times;</span>
                        <h2>Adicionar Novo Semestre</h2>
                        <form onSubmit={handleSubmit} className='form-perfil'>
                            <div className="form-group-perfil">
                                <label htmlFor="currentPassword" className='label-perfil'>Senha Atual:</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group-perfil">
                                <label htmlFor="newPassword" className='label-perfil'>Nova Senha:</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group-perfil">
                                <label htmlFor="confirmPassword" className='label-perfil'>Confirmar Nova Senha:</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">Alterar Senha</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;