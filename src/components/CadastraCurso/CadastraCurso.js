import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './CadastraCurso.css';


const CadastraCurso = () => {
    const [cursos, setCursos] = useState([]);
    const [error, setError] = useState(null);
    const [nomeCurso, setNomeCurso] = useState('');
    const [duracaoSemestres, setDuracaoSemestres] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [creatingCurso, setcreatingCurso] = useState(null);
    const [editingCurso, seteditingCurso] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [cursoSelecionado, setCursoSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                    fetchCursos(),
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }
        const fetchCursos = async () => {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;
            const instituicaoId = userData?.instituicao?.id;

            if (token && instituicaoId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/curso/retornaCursos/${instituicaoId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setCursos(data);
                    } else {
                        setError('Erro ao carregar os cursos');
                        setOpenSnackErro(true);
                    }
                } catch (error) {
                    console.error('Erro ao buscar cursos:', error);
                    setError('Ocorreu um erro ao carregar os cursos. Tente novamente mais tarde.');
                    setOpenSnackErro(true);
                }
            } else {
                setError('Usuário não autenticado');
                setOpenSnackErro(true);
            }
        };

        loadData();
    }, []);

    const handleAddEditClick = (semestre) => {
        setcreatingCurso(semestre);
    };

    const handleEditClick = (curso) => {
        setCursoSelecionado(curso);
        seteditingCurso(curso)
    }

    const handleAddCloseModal = () => {
        setcreatingCurso(null);
    };

    const cadastrarCurso = async (e) => {
        e.preventDefault();

        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const instituicaoId = userData?.instituicao?.id;

        if (token && instituicaoId) {
            try {
                const response = await fetch(`${API_BASE_URL}/curso/cadastrarCurso`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome: nomeCurso,
                        duracaoSemestres: duracaoSemestres,
                        instituicaoId: instituicaoId
                    }),
                });

                if (response.ok) {
                    const cursoSalvo = await response.json();
                    setCursos([...cursos, cursoSalvo]);
                    setMensagemSucesso('Curso cadastrado com sucesso!');
                    setNomeCurso('');
                    setDuracaoSemestres('');
                    handleAddCloseModal();
                    setOpenSnackSucesso(true);
                } else {
                    setError('Erro ao cadastrar curso');
                    setOpenSnackErro(true);
                }
            } catch (error) {
                console.error('Erro ao cadastrar curso:', error);
                setError('Ocorreu um erro ao cadastrar o curso. Tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        } else {
            setError('Usuário não autenticado');
            setOpenSnackErro(true);
        }
    };

    const editaCurso = async (e) => {

        e.preventDefault();

        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const instituicaoId = userData?.instituicao?.id;

        if (token && instituicaoId) {
            try {
                const response = await fetch(`${API_BASE_URL}/curso/editarCurso`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: cursoSelecionado.id,
                        nome: cursoSelecionado.nome,
                        duracaoSemestres: cursoSelecionado.duracaoSemestres,
                        instituicaoId: instituicaoId
                    }),
                });

                if (response.ok) {
                    const cursoSalvo = await response.json();
                    setCursos(cursos.map(c => (c.id === cursoSalvo.id ? cursoSalvo : c)));
                    setMensagemSucesso('Curso editado com sucesso!');
                    setCursoSelecionado(null);
                    seteditingCurso(null);
                    setOpenSnackSucesso(true);
                } else {
                    setError('Erro ao editar curso');
                    setOpenSnackErro(true);
                }

            } catch (error) {
                console.error('Erro ao cadastrar curso:', error);
                setError('Ocorreu um erro ao cadastrar o curso. Tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        } else {
            setError('Usuário não autenticado');
            setOpenSnackErro(true);
        }

    }

    const filteredCursos = cursos.filter(curso =>
        curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.duracaoSemestres.toString().includes(searchTerm)
    );

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
                    {mensagemSucesso}
                </Alert>
            </Snackbar>

            {loading && (
                <Loading />
            )}
            {!loading && (
                <div>
                    <div className="titulo-container">
                        <h2 className="titulo">Cursos</h2>
                        <button className="adicionar-btn" onClick={() => handleAddEditClick('novo')}><FaPlus className="menu-icon" /></button>
                    </div>
                    <div className="filtro-container">
                        <input
                            type="text"
                            placeholder="Filtrar cursos"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <table className='padrao-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Duração (Semestres)</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCursos.map((curso) => (
                                <tr key={curso.id}>
                                    <td>{curso.id}</td>
                                    <td>{curso.nome}</td>
                                    <td>{curso.duracaoSemestres}</td>
                                    <td className='tdEditarBtn'>
                                        <button onClick={() => handleEditClick(curso)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {creatingCurso && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleAddCloseModal}>&times;</span>
                        {error && <p className="error-message">{error}</p>}

                        <h2>Adicionar Novo Curso</h2>
                        <form onSubmit={cadastrarCurso} className="add-semestre-form">
                            <div className="input-div-semestre">
                                <label htmlFor="nomeCurso">Nome do Curso:</label>
                                <input
                                    type="text"
                                    id="nomeCurso"
                                    value={nomeCurso}
                                    onChange={(e) => setNomeCurso(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="duracaoSemestres">Duração (Semestres):</label>
                                <input
                                    type="number"
                                    id="duracaoSemestres"
                                    value={duracaoSemestres}
                                    onChange={(e) => setDuracaoSemestres(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">Cadastrar Curso</button>
                        </form>
                    </div>
                </div>
            )}

            {editingCurso && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => seteditingCurso(null)}>&times;</span>
                        {error && <p className="error-message">{error}</p>}

                        <h2>Editar curso</h2>
                        <form onSubmit={editaCurso} className="add-semestre-form">
                            <div className="input-div-semestre">
                                <label htmlFor="nomeCurso">Nome do Curso:</label>
                                <input
                                    type="text"
                                    id="nomeCurso"
                                    value={cursoSelecionado.nome}
                                    onChange={(e) => setCursoSelecionado({ ...cursoSelecionado, nome: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-div-semestre">
                                <label htmlFor="duracaoSemestres">Duração (Semestres):</label>
                                <input
                                    type="number"
                                    id="duracaoSemestres"
                                    value={cursoSelecionado.duracaoSemestres}
                                    onChange={(e) => setCursoSelecionado({ ...cursoSelecionado, duracaoSemestres: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit">Salvar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadastraCurso;
