import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [semestres, setSemestres] = useState([]);
    const [currentSemestre, setCurrentSemestre] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [aulasSemana, setAulasSemana] = useState([]);
    const [usuariosPendentes, setUsuariosPendentes] = useState(0);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aulasPendentes, setAulasPendentes] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (!userData) {
                navigate('/');
                return;
            }

            try {
                await Promise.all([
                    fetchSemestres(),
                    fetchUsuarios(),
                    fetchAulasPendentes()
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSemestres = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/aula/retornaSemestres/1`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSemestres(data);
                    await determineCurrentSemestre(data);
                } else {
                    console.error('Erro ao carregar os semestres');
                }
            } catch (error) {
                console.error('Erro ao buscar semestres:', error);
            }
        };

        const determineCurrentSemestre = async (semestres) => {
            const today = new Date();
            const current = semestres.find(semestre => {
                const startDate = new Date(semestre.dataInicio);
                const endDate = new Date(semestre.dataFim);
                return today >= startDate && today <= endDate;
            });
            setCurrentSemestre(current);
            if (current && userData.flgProfessor) {
                await Promise.all([
                    fetchMaterias(current.id),
                    fetchAulasProfessor(userData.id)
                ]);
            }
        };

        const fetchMaterias = async (semestreId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/materiaSemestre/usuario/${userData.id}/semestre/${semestreId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setMaterias(data);
                    localStorage.setItem('professorMaterias', data.map(data => data.id))
                } else {
                    console.error('Erro ao carregar as matérias');
                }
            } catch (error) {
                console.error('Erro ao buscar matérias:', error);
            }
        };

        const fetchAulasProfessor = async (professorId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/registrarAula/retornaAulasProfessor/${professorId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAulasSemana(data);
                } else {
                    console.error('Erro ao carregar as aulas da semana');
                }
            } catch (error) {
                console.error('Erro ao buscar aulas da semana:', error);
            }
        };

        const fetchUsuarios = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                const token = userData?.token;
                const userInstituicaoId = userData?.instituicao?.id;

                const response = await fetch(`${API_BASE_URL}/professor/retornaUsuariosPendentes/${userInstituicaoId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsuariosPendentes(data.length);
                } else {
                    setErrorMessage('Erro ao carregar a lista de usuários.');
                    setOpenSnackErro(true);
                }
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
                setErrorMessage('Ocorreu um erro ao buscar os usuários.');
                setOpenSnackErro(true);
            }
        };
        const fetchAulasPendentes = async () => {
            if (userData?.isAdmin === 1) {
                try {
                    const response = await fetch(`${API_BASE_URL}/registrarAula/retornaAulasPendentes`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userData.token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAulasPendentes(data);
                    }
                } catch (error) {
                }
            }
        };

        loadData();

    }, []);


    if (!userData) {
        return null;
    }

    const handleMateriaClick = (id) => {
        navigate(`/materia/${id}/${currentSemestre.id}`);
    };

    const getDateForDayOfWeek = (dayIndex) => {
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        return new Date(firstDayOfWeek.setDate(firstDayOfWeek.getDate() + dayIndex));
    };

    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    const aulasPorDia = diasSemana.map((dia, index) => ({
        dia,
        aulas: aulasSemana.filter(aula => {
            const [ano, mes, dia] = aula.dia.split('-').map(Number);
            const dataAula = new Date(ano, mes - 1, dia);
            return dataAula.getDay() === index;
        }),
        data: getDateForDayOfWeek(index)
    }));

    const renderProfessorActions = () => (
        <div>
            <h3>Aulas da Semana</h3>
            <table className="aulas-semana-table">
                <thead>
                    <tr>
                        {aulasPorDia.map(({ dia, data }) => (
                            <th key={dia}>{`${dia} - ${data.toLocaleDateString()}`}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {aulasPorDia.map(({ dia, aulas }) => (
                            <td key={dia}>
                                {aulas.length > 0 ? (
                                    aulas.map(aula => (
                                        <div key={aula.id} className="aula-item">
                                            <p><strong>Curso:</strong> {aula.nomeCurso}</p>
                                            <p><strong>Módulo:</strong> {aula.numeroModulo}</p>
                                            <p><strong>Matéria:</strong> {aula.materiaNome}</p>
                                            <p><strong>Horário:</strong> {aula.horaInicio} - {aula.horaFim}</p>
                                            <p><strong>Laboratório:</strong> {aula.labNome}</p>
                                            <p><strong>Status:</strong> {renderStatusBadge(aula.flgStatus)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Sem aulas</p>
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <h3>Matérias que estou ministrando</h3>
            {materias.map(materia => (
                <button key={materia.id} className="materia-button" onClick={() => handleMateriaClick(materia.id)}>
                    <div><strong>Matéria:</strong> {materia.nome}</div>
                    <div><strong>Curso:</strong> {materia.nomeCurso}</div>
                    <div><strong>Sigla:</strong> {materia.sigla}</div>
                </button>
            ))}
        </div>
    );
    const renderStatusBadge = (status) => {
        if (status === 'A') {
            return <span className="status-badge status-aprovada">Aprovada</span>;
        }
        if (status === 'P') {
            return <span className="status-badge status-pendente">Pendente</span>;
        }
        return <span className="status-badge">{status}</span>;
    };
    const renderAdminActions = () => (
        <div>
            <h3>TELA DO ADMIN</h3>
        </div>
    );

    const navegaPendentes = () => {
        localStorage.setItem('filtrarPendentes', true)
        navigate('/cadastraProfessor')
    }

    const navegaAulasPendentes = () => {
        localStorage.setItem('opcaoBuscaAulasRegistradas', 'P')
        navigate('/registraAulasDia')

    }
    return (
        <div className="dashboard-container">
            {loading && (
                <Loading />
            )}
            <div className="dashboard-content">

                {!loading && (
                    <div>
                        <h2>Bem-vindo, {userData.nomeUsuario}!</h2>
                        {currentSemestre && (
                            <div className="semestre-atual">
                                <h3>Semestre Atual</h3>
                                <p><strong>Descrição:</strong> {currentSemestre.descricao}</p>
                                <p><strong>Data de Início:</strong> {new Date(currentSemestre.dataInicio).toLocaleDateString()}</p>
                                <p><strong>Data de Fim:</strong> {new Date(currentSemestre.dataFim).toLocaleDateString()}</p>
                                {userData.isAdmin === 1 && (
                                    <p onClick={navegaPendentes}><strong>Usuários Pendentes:</strong> {usuariosPendentes}</p>
                                )}
                            </div>
                        )}
                        {userData.flgProfessor === 1 && renderProfessorActions()}
                        {userData.isAdmin === 1 && renderAdminActions()}
                        {userData.isAdmin === 1 && (
                            <div className="aulas-pendentes-alert" onClick={navegaAulasPendentes}>
                                <span className="badge-pendentes">{aulasPendentes.length}</span>
                                <span>
                                    {aulasPendentes.length === 0
                                        ? "Nenhuma aula pendente para aprovação"
                                        : `Você tem ${aulasPendentes.length} aula${aulasPendentes.length > 1 ? 's' : ''} pendente${aulasPendentes.length > 1 ? 's' : ''} para aprovação`}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;