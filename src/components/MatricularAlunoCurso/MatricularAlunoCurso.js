import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './MatricularAlunoCurso.css';

const MatricularAlunoCurso = () => {
    const [alunos, setAlunos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [alunosMatriculados, setAlunosMatriculados] = useState([]);
    const [modalAtribuicao, setModalAtriabuicao] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAlunosMatriculados = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/aluno/retornaAlunosMatriculados`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar alunos matriculados');
            }

            const data = await response.json();
            setAlunosMatriculados(data);
        } catch (error) {
            console.error('Erro ao buscar alunos matriculados:', error);
            setErrorMessage('Erro ao carregar os alunos matriculados. Por favor, tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    useEffect(() => {
        const fetchAlunos = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                const token = userData?.token;

                const response = await fetch(`${API_BASE_URL}/aluno/retornaAlunos`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar alunos');
                }

                const data = await response.json();
                setAlunos(data.map(aluno => ({
                    value: aluno.id,
                    label: `${aluno.nomeUsuario} (${aluno.dscUsuario})`,
                })));
            } catch (error) {
                console.error('Erro ao buscar alunos:', error);
                setErrorMessage('Erro ao carregar os alunos. Por favor, tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        };

        const fetchCursos = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                const token = userData?.token;
                const userInstituicaoId = userData?.instituicao?.id;

                if (userInstituicaoId && token) {
                    const response = await fetch(`${API_BASE_URL}/curso/retornaCursos/${userInstituicaoId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao buscar cursos');
                    }

                    const data = await response.json();
                    setCursos(data.map(curso => ({ value: curso.id, label: curso.nome })));
                }
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
                setErrorMessage('Erro ao carregar os cursos. Por favor, tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        };

        const loadData = async () => {
            setLoading(true);

            if (!userData) {
                navigate('/');
                return;
            }

            try {
                await Promise.all([
                    fetchAlunos(),
                    fetchCursos(),
                    fetchAlunosMatriculados(),
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const handleMatricularAluno = async () => {
        if (!selectedAluno || !selectedCurso) {
            setErrorMessage('Por favor, selecione um aluno e um curso.');
            setOpenSnackErro(true);
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/aluno/matricularAlunoNoCurso`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    usuarioId: selectedAluno.value,
                    cursoId: selectedCurso.value,
                }),
            });

            if (response.ok) {
                const message = await response.text();
                setSuccessMessage(message || 'Aluno matriculado com sucesso.');
                setSelectedAluno(null);
                setSelectedCurso(null);
                setOpenSnackSucesso(true);

                fetchAlunosMatriculados();
            } else if (response.status === 409) {
                const message = await response.text();
                setErrorMessage(message || 'O aluno já está matriculado nesta matéria.');
                setOpenSnackErro(true);
            } else {
                throw new Error('Erro ao matricular o aluno.');
            }
        } catch (error) {
            console.error('Erro ao matricular o aluno:', error);
            setErrorMessage('Erro ao matricular o aluno. Por favor, tente novamente.');
            setOpenSnackErro(true);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };

    const handleAddEditClick = (registro) => {
        setModalAtriabuicao(registro);
    }
    const alunosFiltrados = alunosMatriculados.filter(aluno => {
        const termo = searchTerm.toLowerCase();
        return (
            (aluno.dscUsuario && aluno.dscUsuario.toLowerCase().includes(termo)) ||
            (aluno.nomeUsuario && aluno.nomeUsuario.toLowerCase().includes(termo)) ||
            (aluno.curso?.nome && aluno.curso.nome.toLowerCase().includes(termo))
        );
    });
    return (
        <div className='matricula-aluno-container'>
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
            {loading && (
                <Loading />
            )}
            {!loading && (
                <div className="container-root">
                    <div className="titulo-container">
                        <h2 className="titulo">Atribuição de Curso por Aluno</h2>
                        <button className="adicionar-btn" onClick={() => handleAddEditClick('novo')}><FaPlus className="menu-icon" /></button>
                    </div>

                    {modalAtribuicao && (
                        <div className="modal">
                            <div className='modal-content'>
                                <button className="close" onClick={() => setModalAtriabuicao(null)} aria-label="Fechar modal">&times;</button>
                                <h2>Atribuição de curso</h2>
                                <div className="form-group">
                                    <div className='labelContainer'>
                                        <label>Selecione o Aluno:</label>
                                    </div>
                                    <Select
                                        className='selectModal'
                                        options={alunos}
                                        onChange={setSelectedAluno}
                                        placeholder="Selecione um aluno"
                                        isSearchable={true}
                                        noOptionsMessage={() => 'Nenhum aluno disponível'}
                                    />
                                </div>
                                <div className="form-group">
                                    <div className='labelContainer'>
                                        <label>Selecione o Curso:</label>
                                    </div>
                                    <Select
                                        className='selectModal'
                                        options={cursos}
                                        onChange={setSelectedCurso}
                                        placeholder="Selecione um curso"
                                        isSearchable={true}
                                        noOptionsMessage={() => 'Nenhum curso disponível'}
                                    />
                                </div>
                                {selectedCurso && selectedAluno && (
                                    <button onClick={handleMatricularAluno} className="matricularBtn">
                                        Matricular
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label>Pesquisar:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por matrícula, nome ou curso"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', marginBottom: 16 }}
                        />
                    </div>
                    <h3>Alunos Matriculados</h3>
                    <table className="alunos-matriculados-table">
                        <thead>
                            <tr>
                                <th>Matricula</th>
                                <th>Nome</th>
                                <th>Curso</th>
                                <th>Data Matrícula</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alunosFiltrados.map(aluno => (
                                <tr key={aluno.id}>
                                    <td>{aluno.dscUsuario}</td>
                                    <td>{aluno.nomeUsuario}</td>
                                    <td>{aluno.curso.nome}</td>
                                    <td>{new Date(aluno.dataMatricula).toLocaleDateString()}</td>
                                    <td>{aluno.statusMatricula === 'A' ? 'Ativo' : 'Inativo'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MatricularAlunoCurso;