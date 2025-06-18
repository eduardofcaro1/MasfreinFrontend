import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './CadastraProfessor.css';

const CadastraProfessor = () => {
    const [nome, setNome] = useState('');
    const [flgAtivo, setFlgAtivo] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [professores, setProfessores] = useState([]);
    const [professoresTabela, setProfessoresTabela] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [editProfessor, setEditProfessor] = useState({});
    const [creatingSemestre, setCreatingSemestre] = useState(null);
    const [filter, setFilter] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [titulo, setTitulo] = useState('Professores');
    const [abaAtiva, setAbaAtiva] = useState('Professores');
    const [filtrarPendentes, setFiltrarPendentes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingUsuarios, setLoadingUsuarios] = useState(true);
    const navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = userData?.token;
    const userInstituicaoId = userData?.instituicao?.id;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (!userData) {
                navigate('/');
                return;
            }

            try {
                await Promise.all([
                    fetchProfessores()
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }

        if (userInstituicaoId) {
            loadData()
        }

    }, [userInstituicaoId]);

    useEffect(() => {
        if (localStorage.getItem('filtrarPendentes') && professores.length > 0) {
            filtraUsuariosPendentes(localStorage.getItem('filtrarPendentes') === 'false' ? false : true);
        }
    }, [professores]);


    const fetchProfessores = async () => {
        setLoadingUsuarios(true);
        try {
            const response = await fetch(`${API_BASE_URL}/professor/retornaProfessores/${userInstituicaoId}/0`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const filteredData = data.map(professor => ({
                    id: professor.id,
                    nomeUsuario: professor.nomeUsuario,
                    flgAtivo: professor.flgAtivo,
                    celular: professor.celular,
                    instituicao: professor.instituicao.nome,
                    isAdmin: professor.isAdmin,
                    flgProfessor: professor.flgProfessor,
                }));
                setProfessores(filteredData);
                setProfessoresTabela(filteredData);
                setLoadingUsuarios(false);
            } else {
                setErrorMessage('Erro ao carregar a lista de professores.');
                setOpenSnackErro(true);
                setLoadingUsuarios(false);
            }
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
            setErrorMessage('Ocorreu um erro ao buscar os professores.');
            setOpenSnackErro(true);
        }
    };

    const handleDefineAba = () => {
        if (titulo == 'Professores') {
            setTitulo('Alunos')
            setAbaAtiva('Alunos')
            fetchAlunos()
        }
        else {
            setTitulo('Professores')
            setAbaAtiva('Professores')
            fetchProfessores()

        }
    }

    const handleAddEditClick = (semestre) => {
        setCreatingSemestre(semestre);
    };

    const handleAddCloseModal = () => {
        setCreatingSemestre(null);
    };

    const fetchAlunos = async () => {
        setLoadingUsuarios(true)
        try {
            const response = await fetch(`${API_BASE_URL}/professor/retornaProfessores/${userInstituicaoId}/1`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const filteredData = data.map(professor => ({
                    id: professor.id,
                    nomeUsuario: professor.nomeUsuario,
                    flgAtivo: professor.flgAtivo,
                    celular: professor.celular,
                    instituicao: professor.instituicao.nome,
                    isAdmin: professor.isAdmin,
                    flgProfessor: professor.flgProfessor,
                }));
                setProfessores(filteredData);
                setProfessoresTabela(filteredData);
            } else {
                setErrorMessage('Erro ao carregar a lista de professores.');
                setOpenSnackErro(true);
            }
            setLoadingUsuarios(false);
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
            setErrorMessage('Ocorreu um erro ao buscar os professores.');
            setOpenSnackErro(true);
            setLoadingUsuarios(false);
        }
    };

    const handleCadastroProfessor = async (event) => {
        event.preventDefault();

        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/professor/cadastrarProfessor`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome,
                        flgAtivo: flgAtivo ? 'S' : 'N',
                        instituicaoId: userInstituicaoId,
                    }),
                });

                if (response.ok) {
                    const professor = await response.json();
                    setSuccessMessage(`Professor ${professor.nome} cadastrado com sucesso!`);
                    setNome('');
                    setFlgAtivo(true);
                    fetchProfessores();
                } else {
                    const error = await response.text();
                    setErrorMessage(`Erro ao cadastrar professor: ${error}`);
                    setOpenSnackErro(true);
                }
            } catch (error) {
                console.error('Erro ao cadastrar professor:', error);
                setErrorMessage('Ocorreu um erro ao cadastrar o professor. Tente novamente mais tarde.');
                setOpenSnackErro(true);
            }
        } else {
            setErrorMessage('Usuário não autenticado');
            setOpenSnackErro(true);
        }
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditProfessor(professores[index]);
    };

    const handleSaveClick = async (index) => {
        console.log(editProfessor.flgAtivo)
        const updatedProfessor = {
            ...editProfessor,
            nomeUsuario: editProfessor.nomeUsuario,
            celular: editProfessor.celular,
            flgAtivo: editProfessor.flgAtivo,
            flgProfessor: editProfessor.flgProfessor ? 1 : 0,
            isAdmin: editProfessor.isAdmin ? 1 : 0,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/users/editarUsuario/${editProfessor.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfessor),
            });

            if (response.ok) {
                setSuccessMessage('Professor atualizado com sucesso!');
                setEditIndex(null);
                fetchProfessores();
                setOpenSnackSucesso(true);
            } else {
                const error = await response.text();
                setErrorMessage(`Erro ao atualizar professor: ${error}`);
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao atualizar professor:', error);
            setErrorMessage('Ocorreu um erro ao atualizar o professor. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditProfessor({ ...editProfessor, [name]: type === 'checkbox' ? checked : value });
    };

    const filteredProfessores = professoresTabela.filter(professor => professor.nomeUsuario.toLowerCase().includes(filter.toLowerCase()));

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };

    const filtraUsuariosPendentes = (filtra) => {
        localStorage.setItem('filtrarPendentes', filtra)
        setFiltrarPendentes(filtra);
        if (filtra) {
            setProfessoresTabela(professoresTabela.filter(professor => professor.flgAtivo === 'N' && professor.isAdmin === 0 && professor.isAdmin === 0));
        }
        else {
            setProfessoresTabela(professores);
        }
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
            {loading && (
                <Loading />
            )}

            {!loading && (
                <div>
                    <div className="titulo-container">
                        <h2 className="titulo" onClick={handleDefineAba}>{titulo}</h2>
                    </div>
                    <div className="filter-container">
                        <input
                            type="text"
                            placeholder="Filtrar por nome"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <div className='usuariosPendentes'>
                            <label htmlFor='pendentes'>Pendentes</label>
                            <input id='pendentes' type='checkbox' checked={filtrarPendentes} onChange={(e) => filtraUsuariosPendentes(e.target.checked)} />
                        </div>

                    </div>
                    {!loadingUsuarios && (
                        <div>
                            {abaAtiva == 'Professores' && (
                                <table className='padrao-table'>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Ativo</th>
                                            <th>Celular</th>
                                            <th>Instituição</th>
                                            <th>É Admin?</th>
                                            <th>É Professor?</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProfessores.length > 0 ? (
                                            filteredProfessores.map((professor, index) => (
                                                <tr key={professor.id}>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="text"
                                                                name="nomeUsuario"
                                                                value={editProfessor.nomeUsuario}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.nomeUsuario
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="checkbox"
                                                                name="flgAtivo"
                                                                checked={editProfessor.flgAtivo === 'S'}
                                                                onChange={(e) => handleInputChange({ target: { name: 'flgAtivo', value: e.target.checked ? 'S' : 'N' } })}
                                                            />
                                                        ) : (
                                                            professor.flgAtivo === 'S' ? 'Sim' : 'Não'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="text"
                                                                name="celular"
                                                                value={editProfessor.celular}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.celular
                                                        )}
                                                    </td>
                                                    <td>{professor.instituicao}</td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="checkbox"
                                                                name="isAdmin"
                                                                checked={editProfessor.isAdmin}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.isAdmin ? 'Sim' : 'Não'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="checkbox"
                                                                name="flgProfessor"
                                                                checked={editProfessor.flgProfessor}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.flgProfessor ? 'Sim' : 'Não'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <button onClick={() => handleSaveClick(index)}>Salvar</button>
                                                        ) : (
                                                            <button onClick={() => handleEditClick(index)}>Editar</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7">Nenhum professor encontrado</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                            {abaAtiva == 'Alunos' && (
                                <table className='padrao-table'>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Ativo</th>
                                            <th>Celular</th>
                                            <th>Instituição</th>
                                            <th>É Admin?</th>
                                            <th>É Professor?</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProfessores.length > 0 ? (
                                            filteredProfessores.map((professor, index) => (
                                                <tr key={professor.id}>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="text"
                                                                name="nomeUsuario"
                                                                value={editProfessor.nomeUsuario}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.nomeUsuario
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="checkbox"
                                                                name="flgAtivo"
                                                                checked={editProfessor.flgAtivo === 'S'}
                                                                onChange={(e) => handleInputChange({ target: { name: 'flgAtivo', value: e.target.checked ? 'S' : 'N' } })}
                                                            />
                                                        ) : (
                                                            professor.flgAtivo === 'S' ? 'Sim' : 'Não'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="text"
                                                                name="celular"
                                                                value={editProfessor.celular}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.celular
                                                        )}
                                                    </td>
                                                    <td>{professor.instituicao}</td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="checkbox"
                                                                name="isAdmin"
                                                                checked={editProfessor.isAdmin}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.isAdmin ? 'Sim' : 'Não'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <input
                                                                type="checkbox"
                                                                name="flgProfessor"
                                                                checked={editProfessor.flgProfessor}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            professor.flgProfessor ? 'Sim' : 'Não'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editIndex === index ? (
                                                            <button onClick={() => handleSaveClick(index)}>Salvar</button>
                                                        ) : (
                                                            <button onClick={() => handleEditClick(index)}>Editar</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7">Nenhum professor encontrado</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {loadingUsuarios && (
                        <Loading />
                    )}

                    {creatingSemestre && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={handleAddCloseModal}>&times;</span>
                                <h2>Adicionar Novo Professor</h2>
                                <form onSubmit={handleCadastroProfessor} className="add-semestre-form">
                                    <div className="input-div-semestre">
                                        <label htmlFor="nome">Nome do Professor:</label>
                                        <input
                                            type="text"
                                            id="nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="flgAtivo">Professor Ativo:</label>
                                        <input
                                            type="checkbox"
                                            id="flgAtivo"
                                            checked={flgAtivo}
                                            onChange={(e) => setFlgAtivo(e.target.checked)}
                                        />
                                    </div>
                                    <button type="submit" className="btn-submit">Cadastrar</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

            )}
        </div>
    );
};

export default CadastraProfessor;
