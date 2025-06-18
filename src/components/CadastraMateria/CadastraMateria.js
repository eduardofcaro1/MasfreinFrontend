import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './CadastraMateria.css';
const CadastraMateria = () => {
    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [nomeMateria, setNomeMateria] = useState('');
    const [siglaMateria, setSiglaMateria] = useState('');
    const [qtdAulasMateria, setQtdAulasMateria] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [creatingSemestre, setCreatingSemestre] = useState(null);
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [materiaSelecionada, setMateriaSelecionada] = useState(null);
    const [editingMateria, setEditingMateria] = useState(null);
    const [loadingDados, setLoadingDados] = useState(true);
    const [loadingDadosMateria, setLoadingDadosMateria] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const loadData = async () => {

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
                setLoadingDados(false);
            }
        }
        const fetchCursos = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                const token = userData?.token;
                const userInstituicaoId = userData?.instituicao?.id;

                if (userInstituicaoId && token) {
                    const response = await fetch(`${API_BASE_URL}/materia/retornaCursos/${userInstituicaoId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao buscar cursos');

                    }

                    const data = await response.json();
                    setCursos(data || []);
                }
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
                setErrorMessage('Erro ao carregar os cursos. Por favor, tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        };

        loadData();
    }, []);

    const handleAddEditClick = (semestre) => {
        setCreatingSemestre(semestre);
    };

    const handleAddCloseModal = () => {
        setCreatingSemestre(null);
    };

    const handleCursoChange = (selectedOption) => {
        setSelectedCurso(selectedOption);
        fetchMaterias(selectedOption.value);
    };

    const fetchMaterias = async (cursoId) => {
        setLoadingDadosMateria(true)
        try {

            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/materia/retornaMateriasDoCurso/${cursoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar matérias');
                setErrorMessage('Erro ao buscar matérias')
                setOpenSnackErro(true);
            }

            const data = await response.json();
            setMaterias(data || []);
            setLoadingDadosMateria(false)
        } catch (error) {
            console.error('Erro ao buscar matérias:', error);
            setErrorMessage('Erro ao carregar as matérias. Por favor, tente novamente mais tarde.');
            setOpenSnackErro(true);
            setLoadingDadosMateria(false)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        if (!selectedCurso || !nomeMateria.trim() || !siglaMateria.trim() || !qtdAulasMateria.trim()) {
            setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            setOpenSnackErro(true);
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const materiaData = {
                nome: nomeMateria,
                sigla: siglaMateria,
                qtdAulas: parseInt(qtdAulasMateria, 10),
                cursoId: selectedCurso.value
            };
            const response = await fetch(`${API_BASE_URL}/materia/cadastrarMateria`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materiaData)
            });

            if (response.ok) {
                setSuccessMessage('Matéria cadastrada com sucesso!');
                setNomeMateria('');
                setSiglaMateria('');
                setQtdAulasMateria('');
                setSelectedCurso(null);
                setMaterias([]);
                handleAddCloseModal();
                setOpenSnackSucesso(true);
            } else if (response.status === 409) {
                setErrorMessage('Já existe uma matéria com esse nome neste curso.');
                handleAddCloseModal();
                setOpenSnackErro(true);
            } else {
                throw new Error('Erro ao cadastrar matéria');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao cadastrar matéria:', error);
            setErrorMessage('Erro ao cadastrar a matéria. Por favor, tente novamente.');
            handleAddCloseModal();
            setOpenSnackErro(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditaMateria = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
        setEditingMateria(false);

        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const materiaData = {
                id: materiaSelecionada.id,
                nome: materiaSelecionada.nome,
                sigla: materiaSelecionada.sigla,
                qtdAulas: parseInt(materiaSelecionada.qtdAulas, 10),
                cursoId: selectedCurso.value
            };

            const response = await fetch(`${API_BASE_URL}/materia/atualizaMateria`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materiaData)
            });

            if (response.ok) {
                setSuccessMessage('Matéria atualizada com sucesso!');
                setNomeMateria('');
                setSiglaMateria('');
                setQtdAulasMateria('');
                setSelectedCurso(null);
                setMaterias([]);
                handleAddCloseModal();
                setOpenSnackSucesso(true);
            } else if (response.status === 409) {
                setErrorMessage('Já existe uma matéria com esse nome neste curso.');
                handleAddCloseModal();
                setOpenSnackErro(true);
            } else {
                throw new Error('Erro ao editar matéria');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao editar matéria:', error);
            setErrorMessage('Erro ao editar a matéria. Por favor, tente novamente.');
            handleAddCloseModal();
            setOpenSnackErro(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };

    const handleEditClick = (materia) => {
        setMateriaSelecionada(materia);
        setEditingMateria(true);
    }



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
                    {errorMessage}
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
            {loadingDados && (
                <div>
                    <Loading />
                </div>
            )}
            {!loadingDados && (
                <div >

                    <div className="titulo-container">
                        <h2 className="titulo">Materias</h2>
                        {selectedCurso && <button className="adicionar-btn" onClick={() => handleAddEditClick('novo')}><FaPlus className="menu-icon" /></button>}

                    </div>
                    <Select
                        id="curso"
                        options={cursos.map(curso => ({ value: curso.id, label: curso.nome }))}
                        value={selectedCurso}
                        onChange={handleCursoChange}
                        placeholder="Selecione um curso"
                        isSearchable={true}
                        noOptionsMessage={() => 'Nenhum curso disponível'}
                    />
                    {creatingSemestre && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={handleAddCloseModal}>&times;</span>
                                <h2>Adicionar Novo Matéria</h2>
                                <form onSubmit={handleSubmit} className="add-semestre-form">
                                    <div className="input-div-semestre">
                                        <label htmlFor="nomeMateria">Nome da Matéria<span className="required">*</span>:</label>
                                        <input
                                            type="text"
                                            id="nomeMateria"
                                            value={nomeMateria}
                                            onChange={(e) => setNomeMateria(e.target.value)}
                                            placeholder="Digite o nome da matéria"
                                        />
                                    </div>

                                    <div className="input-div-semestre">
                                        <label htmlFor="siglaMateria">Sigla da Matéria<span className="required">*</span>:</label>
                                        <input
                                            type="text"
                                            id="siglaMateria"
                                            value={siglaMateria}
                                            onChange={(e) => setSiglaMateria(e.target.value)}
                                            placeholder="Digite a sigla da matéria"
                                        />
                                    </div>

                                    <div className="input-div-semestre">
                                        <label htmlFor="qtdAulasMateria">Quantidade de Aulas<span className="required">*</span>:</label>
                                        <input
                                            type="number"
                                            id="qtdAulasMateria"
                                            value={qtdAulasMateria}
                                            onChange={(e) => setQtdAulasMateria(e.target.value)}
                                            placeholder="Digite a quantidade de aulas"
                                        />
                                    </div>

                                    <button type="submit" className="submit-button" disabled={loading}>
                                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {editingMateria && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={() => setEditingMateria(false)}>&times;</span>
                                <h2>Editar Matéria</h2>
                                <form onSubmit={handleEditaMateria} className="add-semestre-form">
                                    <div className="input-div-semestre">
                                        <label htmlFor="nomeMateria">Nome da Matéria<span className="required">*</span>:</label>
                                        <input
                                            type="text"
                                            id="nomeMateria"
                                            value={materiaSelecionada.nome}
                                            onChange={(e) => setMateriaSelecionada({ ...materiaSelecionada, nome: e.target.value })}
                                            placeholder="Digite o nome da matéria"
                                        />
                                    </div>

                                    <div className="input-div-semestre">
                                        <label htmlFor="siglaMateria">Sigla da Matéria<span className="required">*</span>:</label>
                                        <input
                                            type="text"
                                            id="siglaMateria"
                                            value={materiaSelecionada.sigla}
                                            onChange={(e) => setMateriaSelecionada({ ...materiaSelecionada, sigla: e.target.value })}
                                            placeholder="Digite a sigla da matéria"
                                        />
                                    </div>

                                    <div className="input-div-semestre">
                                        <label htmlFor="qtdAulasMateria">Quantidade de Aulas<span className="required">*</span>:</label>
                                        <input
                                            type="number"
                                            id="qtdAulasMateria"
                                            value={materiaSelecionada.qtdAulas}
                                            onChange={(e) => setMateriaSelecionada({ ...materiaSelecionada, qtdAualas: e.target.value })}
                                            placeholder="Digite a quantidade de aulas"
                                        />
                                    </div>

                                    <button type="submit" disabled={loading}>
                                        {loading ? 'Editando...' : 'Editar'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    {loadingDadosMateria && selectedCurso && (
                        <div>
                            <Loading />
                        </div>
                    )}

                    {!loadingDadosMateria && (
                        <div>
                            {materias.length > 0 && (
                                <div className="materias-disponiveis">
                                    <h3>Matérias Disponíveis:</h3>
                                    <table className='padrao-table'>
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Sigla</th>
                                                <th>Quantidade de Aulas</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {materias.map(materia => (
                                                <tr key={materia.id}>
                                                    <td>{materia.nome}</td>
                                                    <td>{materia.sigla}</td>
                                                    <td>{materia.qtdAulas}</td>
                                                    <td className='tdEditarBtn'>
                                                        <button onClick={() => handleEditClick(materia)}>Editar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}


                </div>
            )}
        </div>
    );
};

export default CadastraMateria;
