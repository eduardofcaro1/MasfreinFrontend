import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './CadastraLaboratorio.css';

const CadastraLaboratorio = () => {
    const [laboratorios, setLaboratorios] = useState([]);
    const [nomeLab, setNomeLab] = useState('');
    const [qtdComputadores, setQtdComputadores] = useState(0);
    const [qtdLugares, setQtdLugares] = useState(0);
    const [aplicativos, setAplicativos] = useState([]);
    const [aplicativosSelecionados, setAplicativosSelecionados] = useState([]);
    const [nomeApp, setNomeApp] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalLabOpen, setIsModalLabOpen] = useState(false);
    const [isModalAppOpen, setIsModalAppOpen] = useState(false);
    const [editingLaboratorio, setEditingLaboratorio] = useState(false);
    const [laboratorioSelecionado, setLaboratorioSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = userData?.token;
    const instituicaoId = userData?.instituicao?.id;

    const fetchLaboratorios = async () => {
        if (!token || !instituicaoId) {
            setError('Usuário não autenticado');
            setOpenSnackErro(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/lab/retornaLaboratorios/${instituicaoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLaboratorios(data);
            } else {
                setError('Erro ao carregar os laboratórios');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao buscar laboratórios:', error);
            setError('Ocorreu um erro ao carregar os laboratórios. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const fetchAplicativos = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/aplicativos`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAplicativos(data);
            } else {
                setError('Erro ao carregar os aplicativos');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao buscar aplicativos:', error);
            setError('Ocorreu um erro ao carregar os aplicativos. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (!userData) {
                navigate('/');
                return;
            }

            try {
                await Promise.all([
                    fetchLaboratorios(),
                    fetchAplicativos()
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData()
    }, []);

    const handleCadastrarLaboratorio = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        if (!nomeLab || !instituicaoId) {
            setError('Preencha todos os campos');
            setOpenSnackErro(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/lab/cadastrarLaboratorio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nomeLab,
                    instituicaoId,
                    qtdComputadores,
                    qtdLugares,
                    aplicativos: aplicativosSelecionados,
                }),
            });

            if (response.ok) {
                const novoLab = await response.json();
                setLaboratorios([...laboratorios, novoLab]);
                setNomeLab('');
                setQtdComputadores(0);
                setQtdLugares(0);
                setAplicativosSelecionados([]);
                setSuccessMessage('Laboratório cadastrado com sucesso!');
                setOpenSnackSucesso(true);
                setIsModalLabOpen(false);
            } else {
                setError('Erro ao cadastrar laboratório');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao cadastrar laboratório:', error);
            setError('Ocorreu um erro ao cadastrar o laboratório. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const handleEditarLaboratorio = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/lab/editarLaboratorio`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: laboratorioSelecionado.id,
                    nome: laboratorioSelecionado.nome,
                    instituicaoId: laboratorioSelecionado.instituicaoId,
                    qtdComputadores: laboratorioSelecionado.qtdComputadores,
                    qtdLugares: laboratorioSelecionado.qtdLugares,
                    aplicativos: aplicativosSelecionados,
                }),
            });

            if (response.ok) {
                const novoLab = await response.json();
                setLaboratorios([]);
                setNomeLab('');
                setQtdComputadores(0);
                setQtdLugares(0);
                setAplicativosSelecionados([]);
                setLaboratorioSelecionado([]);
                setSuccessMessage('Laboratório editado com sucesso!');
                setOpenSnackSucesso(true);
                setEditingLaboratorio(false);
            } else {
                setError('Erro ao editar laboratório');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao editar laboratório:', error);
            setError('Ocorreu um erro ao editar o laboratório. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
        fetchLaboratorios();
    };

    const handleCadastrarAplicativo = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        if (!nomeApp) {
            setError('Preencha o nome do aplicativo');
            setOpenSnackErro(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/aplicativos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: nomeApp }),
            });

            if (response.ok) {
                setNomeApp('');
                setSuccessMessage('Aplicativo cadastrado com sucesso!');
                setOpenSnackSucesso(true);
                setIsModalAppOpen(false);
                fetchAplicativos();
            } else {
                setError('Erro ao cadastrar aplicativo');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao cadastrar aplicativo:', error);
            setError('Ocorreu um erro ao cadastrar o aplicativo. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const filteredLaboratorios = laboratorios.filter(lab =>
        lab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.instituicao?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCloseSnackbar = (_, reason) => {
        if (reason !== 'clickaway') {
            setOpenSnackErro(false);
            setOpenSnackSucesso(false);
        }
    };

    const handleEditClick = (laboratorio) => {
        console.log(laboratorio)
        setAplicativosSelecionados(laboratorio.aplicativos)
        setEditingLaboratorio(true);
        setLaboratorioSelecionado(laboratorio);
    }

    return (
        <div className="container-root">
            <Snackbar open={openSnackErro} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ backgroundColor: 'red', color: '#fff', fontSize: '1rem' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={openSnackSucesso} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ backgroundColor: 'green', color: '#fff', fontSize: '1rem' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
            {loading && (
                <Loading />
            )}

            {!loading && (
                <div>
                    <div className="titulo-container">
                        <h2 className="titulo">Laboratórios</h2>
                        <button className="adicionar-btn" onClick={() => setIsModalLabOpen(true)}><FaPlus className="menu-icon" /></button>
                    </div>

                    <div className="filtro-container">
                        <input
                            type="text"
                            placeholder="Filtrar laboratórios"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <table className='padrao-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Qtd. Computadores</th>
                                <th>Qtd. Lugares</th>
                                <th>Instituição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLaboratorios.map((lab) => (
                                <tr key={lab.id}>
                                    <td>{lab.id}</td>
                                    <td>{lab.nome}</td>
                                    <td>{lab.qtdComputadores}</td>
                                    <td>{lab.qtdLugares}</td>
                                    <td>{lab.instituicao?.nome}</td>
                                    <td className='tdEditarBtn'>
                                        <button onClick={() => handleEditClick(lab)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}



            {/* Modal de Laboratório */}
            {isModalLabOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close" onClick={() => setIsModalLabOpen(false)} aria-label="Fechar modal">&times;</button>
                        <h2>Adicionar Novo Laboratório</h2>
                        <form onSubmit={handleCadastrarLaboratorio} className="for-cadastrar-lab">
                            <div className='campoForm'>
                                <label htmlFor="nomeLab">Nome do Laboratório:</label>
                                <input
                                    type="text"
                                    id="nomeLab"
                                    value={nomeLab}
                                    onChange={(e) => setNomeLab(e.target.value)}
                                />
                            </div>
                            <div className='inputDuplo'>
                                <div className='campoForm'>
                                    <label htmlFor="qtdComputadores">Qtd Computadores:</label>
                                    <input
                                        type="number"
                                        id="qtdComputadores"
                                        value={qtdComputadores}
                                        onChange={(e) => setQtdComputadores(Number(e.target.value))}
                                    />
                                </div>
                                <div className='campoForm'>
                                    <label htmlFor="qtdLugares">Qtd Lugares:</label>
                                    <input
                                        type="number"
                                        id="qtdLugares"
                                        value={qtdLugares}
                                        onChange={(e) => setQtdLugares(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className='aplicativosLab'>
                                <div className='aplicativosLabTitulo'>
                                    <label>Aplicativos</label>
                                    <button type="button" onClick={() => setIsModalAppOpen(true)}><FaPlus className="menu-icon" /></button>
                                </div>
                                <select
                                    multiple
                                    className='appsSelectLista'
                                    value={aplicativosSelecionados.map(app => app.id)}
                                    onChange={(e) => {
                                        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                                        const selectedApps = aplicativos.filter(app => selectedIds.includes(app.id.toString()));
                                        setAplicativosSelecionados(selectedApps);
                                    }}
                                >
                                    {aplicativos.map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.nome}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div className='confirmaBtn'>
                                <button type="submit" className="btn-cadastrar">Cadastrar Laboratório</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingLaboratorio && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close" onClick={() => setEditingLaboratorio(false)} aria-label="Fechar modal">&times;</button>
                        <h2>Editar Laboratório</h2>
                        <form onSubmit={handleEditarLaboratorio} className="for-cadastrar-lab">

                            <div className='campoForm'>
                                <label htmlFor="nomeLab">Nome do Laboratório:</label>
                                <input

                                    type="text"
                                    id="nomeLab"
                                    value={laboratorioSelecionado.nome}
                                    onChange={(e) => setLaboratorioSelecionado({ ...laboratorioSelecionado, nome: e.target.value })}
                                />
                            </div>
                            <div className='inputDuplo'>
                                <div className='campoForm'>
                                    <label htmlFor="qtdComputadores">Qtd Computadores:</label>
                                    <input
                                        type="number"
                                        id="qtdComputadores"
                                        value={laboratorioSelecionado.qtdComputadores}
                                        onChange={(e) => setLaboratorioSelecionado({ ...laboratorioSelecionado, qtdComputadores: Number(e.target.value) })}
                                    />
                                </div>
                                <div className='campoForm'>
                                    <label htmlFor="qtdLugares">Qtd Lugares:</label>
                                    <input
                                        type="number"
                                        id="qtdLugares"
                                        value={laboratorioSelecionado.qtdLugares}
                                        onChange={(e) => setLaboratorioSelecionado({ ...laboratorioSelecionado, qtdLugares: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className='aplicativosLab'>
                                <div className='aplicativosLabTitulo'>
                                    <label>Aplicativos</label>
                                    <button type="button" onClick={() => setIsModalAppOpen(true)}><FaPlus className="menu-icon" /></button>
                                </div>
                                <select
                                    multiple
                                    className='appsSelectLista'
                                    value={aplicativosSelecionados.map(app => app.id)}
                                    onChange={(e) => {
                                        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                                        const selectedApps = aplicativos.filter(app => selectedIds.includes(app.id.toString()));
                                        setAplicativosSelecionados(selectedApps);
                                    }}
                                >
                                    {aplicativos.map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.nome}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div className='confirmaBtn'>
                                <button type="submit" className="btn-cadastrar">Editar Laboratório</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Aplicativo */}
            {isModalAppOpen && (
                <div className="modal-aplicativo">
                    <div className="modal-aplicativo-content">
                        <button className="close" onClick={() => setIsModalAppOpen(false)} aria-label="Fechar modal">&times;</button>
                        <h2>Cadastro de Aplicativo</h2>
                        <form className="modal-aplicativo-form" onSubmit={handleCadastrarAplicativo}>
                            <div className="campoForm">
                                <label htmlFor="nomeAplicativo">Nome do Aplicativo</label>
                                <input type="text" id="nomeAplicativo" required value={nomeApp} onChange={(e) => setNomeApp(e.target.value)} />
                            </div>
                            <div className="modal-aplicativo-btn">
                                <button type="submit" className="btn-cadastrar">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadastraLaboratorio;
