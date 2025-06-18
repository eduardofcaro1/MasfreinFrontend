import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './RegistraAulasDia.css';

const RegistraAulasDia = () => {
    const [semestres, setSemestres] = useState([]);
    const [selectedSemestre, setSelectedSemestre] = useState(null);
    const [calendarDateRange, setCalendarDateRange] = useState([null, null]);
    const [aulas, setAulas] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [error, setError] = useState(null);
    const [titulo, steTitulo] = useState('Agendamento de Aulas');
    const [modalConfirmaRequisicao, setModalConfirmaRequisicao] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [laboratorioAula, setLaboratorioAula] = useState([]);
    const [aulaSelecionada, setAulaSelecionada] = useState(null);
    const [qtdAlunos, setQtdAlunos] = useState(0);
    const [option, setOption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCalendario, setLoadingCalendario] = useState(true);
    const navigate = useNavigate();
    const [opcao, setOpcao] = useState('T');
    const [exibirRequisicoes, setExibirRequisicoes] = useState(false);
    const [aulasConflito, setAulasConflito] = useState([]);
    const [modalConflito, setModalConflito] = useState(false);
    const [aulaAprovarId, setAulaAprovarId] = useState(null);
    const [realocacoes, setRealocacoes] = useState({});
    const [laboratoriosDisponiveis, setLaboratoriosDisponiveis] = useState({});

    const handleChange = (event) => {
        setOpcao(event.target.value);
        renderAulasForSelectedDay();
        localStorage.setItem('opcaoBuscaAulasRegistradas', event.target.value)
    };
    function getAulasConflito(aula, todasAulas) {
        return todasAulas.filter(outra =>
            outra.id !== aula.id &&
            aula.dia === outra.dia &&
            aula.laboratorioId === outra.laboratorioId &&
            aula.flgStatus === 'P' &&
            outra.flgStatus === 'P' &&
            horariosSobrepostos(aula, outra)
        );
    }
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
        const opcaoBuscaSalva = localStorage.getItem('opcaoBuscaAulasRegistradas') || '';
        if (opcaoBuscaSalva !== '' && opcaoBuscaSalva !== null) {
            setOpcao(opcaoBuscaSalva);
        }
        loadData();
    }, []);

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
                    if (data && data.length > 0) {
                        const hoje = new Date();
                        const semestreAtual = data.find(sem =>
                            new Date(sem.dataInicio) <= hoje && hoje <= new Date(sem.dataFim)
                        );
                        if (semestreAtual) {
                            const selectedOption = {
                                value: semestreAtual.id,
                                label: semestreAtual.descricao,
                                dataInicio: semestreAtual.dataInicio,
                                dataFim: semestreAtual.dataFim,
                            };
                            setSelectedSemestre(selectedOption);

                            handleSemestreChange(selectedOption);
                        }
                    }
                } else {
                    setError('Erro ao carregar os semestres');
                }
            } catch (error) {
                console.error('Erro ao buscar semestres:', error);
                setError('Ocorreu um erro ao carregar os semestres. Tente novamente mais tarde.');
            }
        } else {
            setError('Usuário não autenticado');
        }
    };


    const fetchLaboratorio = async (labId) => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/lab/retornaLaboratorio/${labId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLaboratorioAula(data);
            } else {
                setErrorMessage('Erro ao carregar os laboratórios disponíveis');
                setOpenSnackErro(true);
            }
        } catch (error) {
            setErrorMessage('Erro ao buscar laboratórios disponíveis:', error);
            setOpenSnackErro(true);
        }
    };

    const fetchAlunos = async (materiaSemestreId) => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/aluno/retornaAulunosPorMateria/${materiaSemestreId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setQtdAlunos(data.length);
            } else {
                setErrorMessage('Erro ao carregar alunos');
                setOpenSnackErro(true);
            }
        } catch (error) {
            setErrorMessage('Erro ao carregar alunos:', error);
            setOpenSnackErro(true);
        }
    };

    const fetchAulas = async () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const instituicaoId = userData?.instituicao?.id;
        if (userData.isAdmin > 0) {
            try {
                const response = await fetch(`${API_BASE_URL}/registrarAula/retornaTodasAulasSemestre/${instituicaoId}/${selectedSemestre.value}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAulas(marcarConflitosAulas(data.aulasDia));

                } else {
                    setError('Erro ao carregar as aulas');
                }
            } catch (error) {
                console.error('Erro ao buscar aulas:', error);
                setError('Ocorreu um erro ao carregar as aulas. Tente novamente mais tarde.');
            }
        }
        else {
            try {
                const response = await fetch(`${API_BASE_URL}/registrarAula/retornaTodasAulasSemestre/${instituicaoId}/${selectedSemestre.value}/${userData.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAulas(marcarConflitosAulas(data.aulasDia));

                } else {
                    setError('Erro ao carregar as aulas');
                }
            } catch (error) {
                console.error('Erro ao buscar aulas:', error);
                setError('Ocorreu um erro ao carregar as aulas. Tente novamente mais tarde.');
            }
        }

    }

    const handleSemestreChange = async (selectedOption) => {
        setSelectedSemestre(selectedOption);
        setCalendarDateRange([new Date(selectedOption.dataInicio), new Date(selectedOption.dataFim)]);
        setLoadingCalendario(true)
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const instituicaoId = userData?.instituicao?.id;
        if (userData.isAdmin > 0) {
            try {
                const response = await fetch(`${API_BASE_URL}/registrarAula/retornaTodasAulasSemestre/${instituicaoId}/${selectedOption.value}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAulas(marcarConflitosAulas(data.aulasDia));

                } else {
                    setError('Erro ao carregar as aulas');
                }
                setLoadingCalendario(false)
            } catch (error) {
                console.error('Erro ao buscar aulas:', error);
                setError('Ocorreu um erro ao carregar as aulas. Tente novamente mais tarde.');
                setLoadingCalendario(false)
            }
        }
        else {
            try {
                const response = await fetch(`${API_BASE_URL}/registrarAula/retornaTodasAulasSemestre/${instituicaoId}/${selectedOption.value}/${userData.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAulas(marcarConflitosAulas(data.aulasDia));

                } else {
                    setError('Erro ao carregar as aulas');
                }
                setLoadingCalendario(false)
            } catch (error) {
                console.error('Erro ao buscar aulas:', error);
                setError('Ocorreu um erro ao carregar as aulas. Tente novamente mais tarde.');
                setLoadingCalendario(false)
            }
        }

    };

    const handleDayClick = (date) => {
        setSelectedDay(date);
    };

    const renderAulasForSelectedDay = () => {
        if (!selectedDay) {
            return <p>Selecione um dia no calendário.</p>;
        }
        let filteredAulas = aulas.filter(aula => new Date(aula.dia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) === selectedDay.toLocaleDateString('pt-BR', { timeZone: 'UTC' }));
        if (opcao !== 'T') {
            filteredAulas = aulas.filter(aula => new Date(aula.dia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) === selectedDay.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) && aula.flgStatus === opcao);
        }

        if (filteredAulas.length === 0) {
            return <p>Não há aulas para este dia.</p>;
        }

        return (
            <div className="aulas-schedule">
                <h4>Aulas para {selectedDay.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</h4>
                <ul>
                    {filteredAulas.map((aula, index) => (
                        <li
                            className={`aula${aula.flgStatus} ${aula.conflito ? 'conflito' : ''}`}
                            key={index}
                            onClick={() => abreConfirmaAula(aula)}
                        >
                            <span>{aula.nomeCurso} - {aula.materiaNome}</span>
                            <span>Modulo: {aula.numeroModulo} - Laboratório: {aula.labNome}</span>
                            {aula.horaInicio} - {aula.horaFim} - {aula.professorNome}
                            {aula.conflito && <span style={{ color: 'red', fontWeight: 'bold' }}> (CONFLITO!)</span>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const semestreOptions = semestres.map(semestre => ({
        value: semestre.id,
        label: semestre.descricao,
        dataInicio: semestre.dataInicio,
        dataFim: semestre.dataFim,
    }));

    const marcarDiasComAulas = ({ date }) => {
        const aulasFiltradas = opcao === 'T'
            ? aulas
            : aulas.filter(aula => aula.flgStatus === opcao);

        const aulaDoDia = aulasFiltradas.find(aula =>
            new Date(aula.dia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) ===
            date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        );
        if (aulaDoDia) {
            return (
                <div className="aula-marker">
                    <span>{aulaDoDia.materiaNome}</span>
                    <br />
                    <span>{aulaDoDia.horaInicio} - {aulaDoDia.horaFim}</span>
                </div>
            );
        }
        return null;
    };
    const handleAddCloseModal = () => {
        setModalConfirmaRequisicao(null);
    };

    const handleSaveClick = async (aulaId, status) => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;
            const response = await fetch(`${API_BASE_URL}/registrarAula/atualizaSatus/${aulaId}/${status}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setSuccessMessage('Aula atualizada com sucesso!');
                setOpenSnackSucesso(true);
                return true;
            } else {
                const error = await response.text();
                setErrorMessage(`Erro ao atualizar aula: ${error}`);
                setOpenSnackErro(true);
                return false;
            }
        } catch (error) {
            console.error('Erro ao atualizar aula:', error);
            setErrorMessage('Ocorreu um erro ao atualizar a aula. Tente novamente mais tarde.');
            setOpenSnackErro(true);
            return false;
        }
    };
    function horariosSobrepostos(a, b) {
        const [h1, m1] = a.horaInicio.split(':').map(Number);
        const [h2, m2] = a.horaFim.split(':').map(Number);
        const [h3, m3] = b.horaInicio.split(':').map(Number);
        const [h4, m4] = b.horaFim.split(':').map(Number);

        const inicioA = h1 * 60 + m1;
        const fimA = h2 * 60 + m2;
        const inicioB = h3 * 60 + m3;
        const fimB = h4 * 60 + m4;

        return inicioA < fimB && inicioB < fimA;
    }

    function marcarConflitosAulas(aulas) {
        return aulas.map((aula, idx, arr) => {
            const conflito = arr.some((outra, j) =>
                j !== idx &&
                aula.dia === outra.dia &&
                aula.laboratorioId === outra.laboratorioId &&
                aula.flgStatus === 'P' &&
                outra.flgStatus === 'P' &&
                horariosSobrepostos(aula, outra)
            );
            return { ...aula, conflito };
        });
    }

    const abreConfirmaAula = (aula) => {
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (aula !== null) {
            setAulaSelecionada(aula)
            if (aula.flgStatus === 'P' && userData.isAdmin > 0) {
                fetchLaboratorio(aula.laboratorioId);
                fetchAlunos(aula.materiaSemestreId);
                setModalConfirmaRequisicao('ATIVO')
            }
        }
        if (aula.conflito) {
            const conflitos = [aula, ...getAulasConflito(aula, aulas)].filter(a => a.flgStatus === 'P');
            setAulasConflito(conflitos);
            setAulaAprovarId(aula.id);
            setModalConflito(true);
            conflitos.forEach(async (a) => {
                const labs = await fetchLabsDisponiveis(a.dia, a.horaInicio, a.horaFim);
                setLaboratoriosDisponiveis(prev => ({ ...prev, [a.id]: labs }));
            });
            return;
        }
    }
    async function fetchLabsDisponiveis(dia, horaInicio, horaFim) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const response = await fetch(`${API_BASE_URL}/lab/disponiveis?dia=${dia}&horaInicio=${horaInicio}&horaFim=${horaFim}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    const alteraStatusReserva = async (status, aula = aulaSelecionada) => {
        const success = await handleSaveClick(aula.id, status);
        if (success) {
            setModalConfirmaRequisicao(null);
            setQtdAlunos(0);
            setSelectedDay(null);
            await fetchAulas();
        }
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };

    return (
        <div >
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
                            <h2 className="titulo">{titulo}</h2>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <div className="select-container">
                            <Select
                                className='selectSemestreAulas'
                                options={semestreOptions}
                                onChange={handleSemestreChange}
                                placeholder="Selecione um semestre"
                                value={selectedSemestre}
                            />
                            <div className='radioButtonsGroup'>
                                <div className='radioButton'>
                                    <label>
                                        Pendentes
                                    </label>
                                    <input
                                        type="radio"
                                        value="P"
                                        checked={opcao === 'P'}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='radioButton'>
                                    <label>
                                        Aprovadas
                                    </label>
                                    <input
                                        type="radio"
                                        value="A"
                                        checked={opcao === 'A'}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='radioButton'>
                                    <label>
                                        Rejeitadas
                                    </label>
                                    <input
                                        type="radio"
                                        value="N"
                                        checked={opcao === 'N'}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='radioButton'>

                                    <label>
                                        Todas
                                    </label>
                                    <input
                                        type="radio"
                                        value="T"
                                        checked={opcao === 'T'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {selectedSemestre && (
                    <div>
                        {loadingCalendario && (
                            <Loading />
                        )}
                        {!loadingCalendario && (
                            <div className="calendar-container">
                                <h3>Calendário: {selectedSemestre.label}</h3>
                                <Calendar
                                    className="calendario-aulas-agendamento"
                                    minDate={new Date(new Date(selectedSemestre.dataInicio).setDate(new Date(selectedSemestre.dataInicio).getDate() + 1))}
                                    maxDate={new Date(new Date(selectedSemestre.dataFim).setDate(new Date(selectedSemestre.dataFim).getDate() + 1))}
                                    tileContent={marcarDiasComAulas}
                                    onClickDay={handleDayClick}
                                />
                            </div>
                        )}
                    </div>
                )}


                {selectedDay && (
                    <div className="aulas-container">
                        {renderAulasForSelectedDay()}
                    </div>
                )}
            </div>

            {modalConfirmaRequisicao && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleAddCloseModal}>&times;</span>
                        <h2>Confirmar agendamento?</h2>
                        <div className='dados'>
                            <h3 className='tituloConfirma'><i>Laboratório</i></h3>
                            <div className='qtdDiv'>
                                <span>Qtd. Assentos: <strong>{laboratorioAula.qtdLugares}</strong></span>
                                <span>Qtd. Computadores: <strong>{laboratorioAula.qtdComputadores}</strong> </span>
                            </div>
                        </div>
                        <div className='dados'>
                            <h3 className='tituloConfirma'><i>Aula</i></h3>
                            <div className='qtdDiv'>
                                <span>Qtd. Alunos: <strong>{qtdAlunos}</strong></span>
                            </div>
                        </div>
                        <div className='botoesModal'>
                            <div className='btnCancelar' onClick={() => alteraStatusReserva('N')}>Rejeitar</div>
                            <div className='btnAprovar' onClick={() => alteraStatusReserva('A')}>Aprovar</div>
                        </div>
                    </div>
                </div>
            )}
            {modalConflito && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Conflito de Aulas</h2>
                        <p>Escolha qual aula aprovar e realoque ou reprove as demais:</p>
                        <ul>
                            {aulasConflito.map(aula => (
                                <li key={aula.id} style={{ marginBottom: 16, border: aulaAprovarId === aula.id ? '2px solid green' : '1px solid #ccc', borderRadius: 6, padding: 8 }}>
                                    <input
                                        type="radio"
                                        name="aulaAprovar"
                                        checked={aulaAprovarId === aula.id}
                                        onChange={() => setAulaAprovarId(aula.id)}
                                    />
                                    <span style={{ marginLeft: 8, fontWeight: 600 }}>{aula.nomeCurso} - {aula.materiaNome} ({aula.professorNome})</span>
                                    <br />
                                    <span>Laboratório: {aula.labNome} | {aula.horaInicio} - {aula.horaFim}</span>
                                    <br />
                                    {aulaAprovarId !== aula.id && (
                                        <div>
                                            <label>Realocar para outro laboratório:</label>
                                            <select
                                                value={realocacoes[aula.id] || ''}
                                                onChange={e => setRealocacoes(prev => ({ ...prev, [aula.id]: e.target.value }))}
                                            >
                                                <option value="">Selecione</option>
                                                {(laboratoriosDisponiveis[aula.id] || [])
                                                    .filter(lab => lab.id !== aula.laboratorioId)
                                                    .map(lab => (
                                                        <option key={lab.id} value={lab.id}>{lab.nome}</option>
                                                    ))}
                                            </select>
                                            <button
                                                onClick={async () => {
                                                    if (realocacoes[aula.id]) {
                                                        await fetch(`${API_BASE_URL}/registrarAula/realocarAula/${aula.id}/${realocacoes[aula.id]}`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                Authorization: `Bearer ${JSON.parse(localStorage.getItem('userData'))?.token}`,
                                                                'Content-Type': 'application/json',
                                                            },
                                                        });
                                                        setSuccessMessage('Aula realocada!');
                                                        setOpenSnackSucesso(true);
                                                    }
                                                }}
                                                disabled={!realocacoes[aula.id]}
                                            >Realocar</button>
                                            <button
                                                style={{ marginLeft: 8 }}
                                                onClick={async () => {
                                                    await alteraStatusReserva('N', aula);
                                                    setAulasConflito(prev => prev.filter(a => a.id !== aula.id));
                                                }}
                                            >
                                                Reprovar
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={async () => {
                                const labs = aulasConflito.map(aula => realocacoes[aula.id] || aula.laboratorioId);
                                const labsSet = new Set(labs);
                                if (labs.length !== labsSet.size) {
                                    setErrorMessage('Não é possível aprovar todas: há aulas com o mesmo laboratório. Realocar para laboratórios diferentes.');
                                    setOpenSnackErro(true);
                                    return;
                                }
                                for (const aula of aulasConflito) {
                                    if (realocacoes[aula.id]) {
                                        await fetch(`${API_BASE_URL}/registrarAula/realocarAula/${aula.id}/${realocacoes[aula.id]}`, {
                                            method: 'PUT',
                                            headers: {
                                                Authorization: `Bearer ${JSON.parse(localStorage.getItem('userData'))?.token}`,
                                                'Content-Type': 'application/json',
                                            },
                                        });
                                    }
                                    await alteraStatusReserva('A', aula);
                                }
                                setModalConflito(false);
                                await fetchAulas();
                            }}
                        >
                            Aprovar todas as aulas
                        </button>
                        <button
                            style={{ marginLeft: 8 }}
                            onClick={() => {
                                setModalConflito(false);
                                setModalConfirmaRequisicao(null);
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistraAulasDia;