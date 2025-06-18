import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './CadastraSemestre.css';

const CadastraSemestre = () => {
    const [semestres, setSemestres] = useState([]);
    const [descricao, setDescricao] = useState('');
    const [flgAtivo, setFlgAtivo] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingSemestre, setEditingSemestre] = useState(null);
    const [creatingSemestre, setCreatingSemestre] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isDisabled = (!descricao || !dataInicio || !dataFim || !flgAtivo) ? true : false

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const loadData = async () => {
            setLoading(true);

            if (!userData) {
                navigate('/');
                return;
            }

            try {
                await Promise.all([
                    fetchSemestres(),
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }
        const fetchSemestres = async () => {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;
            const instituicaoId = userData?.instituicao?.id;

            if (token && instituicaoId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/aula/retornaSemestres/${instituicaoId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setSemestres(data);
                    } else {
                        setError('Erro ao carregar os semestres');
                        setOpenSnackErro(true);
                    }
                } catch (error) {
                    console.error('Erro ao buscar semestres:', error);
                    setError('Ocorreu um erro ao carregar os semestres. Tente novamente mais tarde.');
                    setOpenSnackErro(true);
                }
            } else {
                setError('Usuário não autenticado');
                setOpenSnackErro(true);
            }
        };

        loadData();
    }, []);

    const handleAddSemestre = async (event) => {
        event.preventDefault();

        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const instituicaoId = userData?.instituicao?.id;

        if (token && instituicaoId) {
            const newSemestre = {
                instituicaoId: instituicaoId,
                descricao: descricao,
                dataInicio: dataInicio,
                dataFim: dataFim,
                flgAtivo: flgAtivo,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/aula/cadastrarSemestre`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newSemestre),
                });
                if (response.status >= 200) {
                    setDescricao('');
                    setDataInicio('');
                    setDataFim('');
                    setFlgAtivo('');
                    handleAddCloseModal();
                    if (response.status === 201) {
                        const data = await response.json();
                        setSemestres([...semestres, data]);
                        setSuccessMessage('Semestre cadastrado com sucesso!');
                    }
                    else {
                        setSuccessMessage('Semestre já cadastrado!');
                    }
                    setOpenSnackSucesso(true);

                } else {
                    setError('Erro ao cadastrar o semestre');
                    setOpenSnackErro(true);
                }
            } catch (error) {
                console.error('Erro ao cadastrar semestre:', error);
                setError('Ocorreu um erro ao cadastrar o semestre. Tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        } else {
            setError('Usuário não autenticado');
            setOpenSnackErro(true);
        }
    };

    const handleEditClick = (semestre) => {
        setEditingSemestre(semestre);
    };

    const handleAddEditClick = (semestre) => {
        setCreatingSemestre(semestre);
    };

    const handleCloseModal = () => {
        setEditingSemestre(null);
    };

    const handleAddCloseModal = () => {
        setCreatingSemestre(null);
    };

    const handleSaveChanges = async () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;

        if (token && editingSemestre) {
            try {
                const response = await fetch(`${API_BASE_URL}/aula/editarSemestre`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editingSemestre),
                });

                if (response.ok) {
                    const updatedSemestre = await response.json();
                    setSemestres(semestres.map(semestre =>
                        semestre.id === updatedSemestre.id ? updatedSemestre : semestre
                    ));
                    setSuccessMessage('Semestre atualizado com sucesso!');
                    handleCloseModal();
                    setOpenSnackSucesso(true);
                } else {
                    setError('Erro ao atualizar o semestre');
                    setOpenSnackErro(true);
                }
            } catch (error) {
                console.error('Erro ao atualizar semestre:', error);
                setError('Ocorreu um erro ao atualizar o semestre. Tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        } else {
            setError('Usuário não autenticado');
            setOpenSnackErro(true);

        }
    };


    const filteredSemestres = semestres.filter(semestre => {
        const matchesSearchTerm =
            semestre.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            semestre.dataInicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            semestre.dataFim.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesActiveStatus = showOnlyActive ? true : semestre.flgAtivo === 'S';

        return matchesSearchTerm && matchesActiveStatus;
    });

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };



    return (
        <div className="container-root">
            <Snackbar
                open={openSnackErro}
                autoHideDuration={3000}
                onClose={handleClose} anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}>
                <Alert
                    onClose={handleClose}
                    severity="error"
                    sx={{
                        backgroundColor: 'red',
                        color: '#fff',
                        fontSize: '1rem',
                    }}
                >
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar
                open={openSnackSucesso}
                autoHideDuration={3000}
                onClose={handleClose} anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}>
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
            {loading && (
                <Loading />
            )}
            {!loading && (
                <div>
                    <div className="semestres-container">
                        <div className="titulo-container">
                            <h2 className="titulo">Semestres</h2>
                            <button className="adicionar-btn" onClick={() => handleAddEditClick('novo')}><FaPlus className="menu-icon" /></button>
                        </div>

                        {/* Input de filtro */}
                        <div className="filtro-container">
                            <input
                                type="text"
                                placeholder="Filtrar semestres"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="checkbox-filtro-ativo-container">
                                <input
                                    className="checkbox-filtro-ativo"
                                    type="checkbox"
                                    checked={showOnlyActive}
                                    onChange={(e) => setShowOnlyActive(e.target.checked)}
                                />
                                <label className="checkbox-filtro-ativo-label">
                                    Mostrar inativos
                                </label>
                            </div>
                        </div>

                        <table className="padrao-table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Data de Início</th>
                                    <th>Data de Fim</th>
                                    <th>Ativo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSemestres.map((semestre) => (
                                    <tr key={semestre.id}>
                                        <td>{semestre.descricao}</td>
                                        <td>{semestre.dataInicio}</td>
                                        <td>{semestre.dataFim}</td>
                                        <td>{semestre.flgAtivo === 'S' ? 'Sim' : 'Não'}</td>
                                        <td className='tdEditarBtn'>
                                            <button onClick={() => handleEditClick(semestre)}>Editar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro */}
            {creatingSemestre && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleAddCloseModal}>&times;</span>


                        <h2>Adicionar Novo Semestre</h2>
                        <form className="add-semestre-form" onSubmit={handleAddSemestre}>
                            <div className="input-div-semestre">
                                <label htmlFor="descricao">Descrição:</label>
                                <input
                                    type="text"
                                    id="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="dataInicio">Data de Início:</label>
                                <input
                                    type="date"
                                    id="dataInicio"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="dataFim">Data de Fim:</label>
                                <input
                                    type="date"
                                    id="dataFim"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="flgAtivo">Ativo:</label>
                                <select
                                    id="flgAtivo"
                                    value={flgAtivo}
                                    onChange={(e) => setFlgAtivo(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    <option value="S">Ativo</option>
                                    <option value="N">Inativo</option>
                                </select>
                            </div>
                            <button disabled={isDisabled} className={isDisabled ? 'btnDesabilitado ' : ''} type="submit">Adicionar Semestre</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {editingSemestre && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2>Editar Semestre</h2>
                        <form className="add-semestre-form">
                            <div className="input-div-semestre">
                                <label htmlFor="descricao">Descrição:</label>
                                <input
                                    type="text"
                                    id="descricao"
                                    value={editingSemestre.descricao}
                                    onChange={(e) => setEditingSemestre({ ...editingSemestre, descricao: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="dataInicio">Data de Início:</label>
                                <input
                                    type="date"
                                    id="dataInicio"
                                    value={editingSemestre.dataInicio}
                                    onChange={(e) => setEditingSemestre({ ...editingSemestre, dataInicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="dataFim">Data de Fim:</label>
                                <input
                                    type="date"
                                    id="dataFim"
                                    value={editingSemestre.dataFim}
                                    onChange={(e) => setEditingSemestre({ ...editingSemestre, dataFim: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="flgAtivo">Ativo:</label>
                                <select
                                    id="flgAtivo"
                                    value={editingSemestre.flgAtivo}
                                    onChange={(e) => setEditingSemestre({ ...editingSemestre, flgAtivo: e.target.value })}
                                >
                                    <option value="S">Ativo</option>
                                    <option value="N">Inativo</option>
                                </select>
                            </div>
                            <button type="button" onClick={handleSaveChanges}>Salvar Alterações</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadastraSemestre;
