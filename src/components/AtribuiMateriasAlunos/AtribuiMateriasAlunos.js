import { Alert, Button, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_BASE_URL } from '../../config';
import Loading from '../Loading/Loading';
import './AtribuiMateriasAlunos.css';

const AtribuiMateriasAlunos = () => {
    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [selectedCursoFiltro, setSelectedCursoFiltro] = useState(null);
    const [alunos, setAlunos] = useState([]);
    const [materiasTodosAlunos, setMateriasTodosAlunos] = useState([]);
    const [materiasTodosAlunosFiltradas, setMateriasTodosAlunosFiltrada] = useState([]);
    const [exibirTabela, setExibirTabela] = useState(false);
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackErro, setOpenSnackErro] = useState(false);
    const [openSnackSucesso, setOpenSnackSucesso] = useState(false);
    const [semestres, setSemestres] = useState([]);
    const [semestresLista, setSemestresLista] = useState([]);
    const [selectedSemestre, setSelectedSemestre] = useState(null);
    const [selectedSemestreFiltro, setSelectedSemestreFiltro] = useState(null);
    const [materiasDisponiveis, setMateriasDisponiveis] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {

        const fetchCursos = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                const token = userData?.token;

                const response = await fetch(`${API_BASE_URL}/curso/retornaCursos/1`, {
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
                    fetchCursos(),
                    fetchSemestres()
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const fetchAlunos = async (cursoId) => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/aluno/retornaAlunosMatriculados/${cursoId}`, {
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
            setAlunos(data.map(aluno => ({ value: aluno.usuarioId, label: aluno.nomeUsuario })));
        } catch (error) {
            console.error('Erro ao buscar alunos matriculados:', error);
            setErrorMessage('Erro ao carregar os alunos matriculados. Por favor, tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const fetchSemestres = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/aula/retornaSemestres/1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar semestres');
            }

            const data = await response.json();

            const sortedSemestres = data.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
            const currentDate = new Date();

            const currentSemestre = sortedSemestres.find(semestre =>
                new Date(semestre.dataInicio) <= currentDate && new Date(semestre.dataFim) >= currentDate
            );

            setSemestres(sortedSemestres.map(semestre => ({ value: semestre.id, label: semestre.descricao })));
            setSemestresLista(sortedSemestres.map(semestre => ({ value: semestre.id, label: semestre.descricao })))
            if (currentSemestre) {
                setSelectedSemestre({ value: currentSemestre.id, label: currentSemestre.descricao });
            }
        } catch (error) {
            console.error('Erro ao buscar semestres:', error);
            setErrorMessage('Erro ao carregar os semestres. Por favor, tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    const handleAlunoChange = (selectedOption) => {
        setSelectedAluno(selectedOption);

        if (selectedCurso) {
            fetchSemestres();
        }

        if (selectedCurso && selectedSemestre) {
            fetchMateriasDisponiveis(selectedCurso.value, selectedSemestre.value);
        }
    };

    const handleSemestreChange = (selectedOption) => {
        setSelectedSemestre(selectedOption);

        if (selectedCurso && selectedOption) {
            fetchMateriasDisponiveis(selectedCurso.value, selectedOption.value);
        }
    };

    const handleCursoChange = (selectedOption) => {
        setSelectedCurso(selectedOption);
        setSelectedAluno(null);
        setAlunos([]);
        setSelectedSemestre(null);
        setSemestres([]);
        setMateriasDisponiveis([]);
        fetchAlunos(selectedOption.value);
        fetchSemestres();
    };

    const handleCursoFiltroChange = (selectedOption) => {
        setSelectedCursoFiltro(selectedOption.value)
    }

    const handleSemestreFiltroChange = (selectedOption) => {
        setSelectedSemestreFiltro(selectedOption.value)
        setExibirTabela(true);
    }

    const fetchMateriasTodosAlunos = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/aluno/materiasTodosAlunos`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar matérias de todos os alunos');
            }

            const data = await response.json();
            setMateriasTodosAlunos(data);
        } catch (error) {
            console.error('Erro ao buscar matérias de todos os alunos:', error);
            setErrorMessage('Erro ao carregar as matérias de todos os alunos. Por favor, tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    useEffect(() => {
        const fetchMateriasTodosAlunos = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                const token = userData?.token;

                const response = await fetch(`${API_BASE_URL}/aluno/materiasTodosAlunos`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar matérias de todos os alunos');
                }

                const data = await response.json();
                setMateriasTodosAlunos(data);
            } catch (error) {
                console.error('Erro ao buscar matérias de todos os alunos:', error);
                setErrorMessage('Erro ao carregar as matérias de todos os alunos. Por favor, tente novamente mais tarde.');
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
                    fetchMateriasTodosAlunos(),
                ]);
            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const handleSubmit = async () => {
        if (!selectedAluno || !selectedMateria || selectedMateria.length === 0) {
            setErrorMessage('Por favor, selecione um aluno e pelo menos uma matéria.');
            setOpenSnackErro(true);
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const requestData = selectedMateria.map(materia => ({
                alunoId: selectedAluno.value,
                materiaSemestreId: materia.value,
            }));

            const response = await fetch(`${API_BASE_URL}/aluno/atribuirMateriasAoAluno`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                setSuccessMessage('Matérias atribuídas com sucesso!');
                setSelectedMateria([]);
                setOpenSnackSucesso(true);

                // Atualizar a tabela
                await fetchMateriasTodosAlunos();

                // Fechar o modal
                setOpenModal(false);
            } else {
                throw new Error('Erro ao atribuir matérias');
            }
        } catch (error) {
            console.error('Erro ao atribuir matérias:', error);
            setErrorMessage('Erro ao atribuir as matérias. Por favor, tente novamente.');
            setOpenSnackErro(true);
        }
    };
    const fetchMateriasDisponiveis = async (idCurso, idSemestre) => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            const response = await fetch(`${API_BASE_URL}/materiaSemestre/retornaMateriasSemestres/${idCurso}/${idSemestre}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar matérias disponíveis');
            }

            const data = await response.json();
            setMateriasDisponiveis(data.map(materia => ({ value: materia.id, label: materia.nomeMateria })));
        } catch (error) {
            console.error('Erro ao buscar matérias disponíveis:', error);
            setErrorMessage('Erro ao carregar as matérias disponíveis. Por favor, tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackErro(false);
        setOpenSnackSucesso(false);
    };

    const renderTable = () => {
        let materiasTodosAlunosFiltrado = materiasTodosAlunos.filter(item => item.materia.cursoId === selectedCursoFiltro && item.semestre.id === selectedSemestreFiltro);
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            materiasTodosAlunosFiltrado = materiasTodosAlunosFiltrado.filter(item =>
                (item.materia.dscUsuario && item.materia.dscUsuario.toLowerCase().includes(lower)) ||
                (item.materia.nomeUsuario && item.materia.nomeUsuario.toLowerCase().includes(lower)) ||
                (item.materia.nome && item.materia.nome.toLowerCase().includes(lower)) ||
                (item.materia.nomeCurso && item.materia.nomeCurso.toLowerCase().includes(lower))
            );
        }
        let groupedData;
        try {
            groupedData = materiasTodosAlunosFiltrado.reduce((acc, item) => {
                const { nomeCurso } = item.materia;
                const { descricao } = item.semestre;

                if (!acc[nomeCurso]) {
                    acc[nomeCurso] = {};
                }

                if (!acc[nomeCurso][descricao]) {
                    acc[nomeCurso][descricao] = [];
                }

                acc[nomeCurso][descricao].push(item);
                return acc;
            }, {});
        }
        finally {

            return Object.entries(groupedData).map(([curso, semestres]) => (
                <div key={curso} className='cardCurso'>
                    <div className="formAtribuicaoMateria">
                        <label>Pesquisar:</label>
                        <input
                            type="text"
                            className="formSelect"
                            placeholder="Buscar por matrícula, nome do aluno, matéria ou curso"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {Object.entries(semestres).map(([semestre, materias]) => (
                        <div key={semestre}>
                            <h4>Semestre: {semestre}</h4>
                            <table className='padrao-table'>
                                <thead>
                                    <tr>
                                        <th>Matricula</th>
                                        <th>Aluno</th>
                                        <th>Matéria</th>
                                        <th>Curso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materias.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.materia.dscUsuario}</td>
                                            <td>{item.materia.nomeUsuario}</td>
                                            <td>{item.materia.nome}</td>
                                            <td>{item.materia.nomeCurso}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ));
        }

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

            {openModal && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className="formAtribuicaoMateria">
                            <label>Selecione o Curso:</label>
                            <Select
                                className='formSelect'
                                options={cursos}
                                onChange={handleCursoChange}
                                placeholder="Selecione um curso"
                                isSearchable={true}
                                noOptionsMessage={() => 'Nenhum curso disponível'}
                            />
                        </div>
                        <div className="formAtribuicaoMateria">
                            <label>Selecione o Aluno:</label>
                            <Select
                                className='formSelect'
                                options={alunos}
                                onChange={handleAlunoChange}
                                placeholder="Selecione um aluno"
                                isSearchable={true}
                                noOptionsMessage={() => 'Nenhum aluno disponível'}
                                isDisabled={!selectedCurso}
                            />
                        </div>
                        <div className="formAtribuicaoMateria">
                            <label>Selecione o Semestre:</label>
                            <Select
                                className='formSelect'
                                options={semestres}
                                onChange={handleSemestreChange}
                                value={selectedSemestre}
                                placeholder="Selecione um semestre"
                                isSearchable={true}
                                noOptionsMessage={() => 'Nenhum semestre disponível'}
                                isDisabled={!selectedAluno}
                            />
                        </div>
                        <div className="formAtribuicaoMateria">
                            <label>Selecione as Matérias:</label>
                            <Select
                                className='formSelect'
                                options={materiasDisponiveis}
                                onChange={setSelectedMateria}
                                value={selectedMateria}
                                placeholder="Selecione as matérias"
                                isMulti={true}
                                isSearchable={true}
                                noOptionsMessage={() => 'Nenhuma matéria disponível'}
                                isDisabled={!selectedAluno || !selectedSemestre}
                            />
                        </div>
                        <div className='botoesModal'>
                            <div className='btnCancelar' onClick={handleCloseModal}>Cancelar</div>
                            <div className='btnAprovar' onClick={handleSubmit}>Atribuir</div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <Loading />
            )}

            {!loading && (
                <div className="materias-todos-alunos">
                    <div className="titulo-container">
                        <h2 className="titulo">Atribuição de Matérias por Aluno</h2>
                        <Button variant="contained" color="primary" onClick={handleOpenModal} className='adicionar-btn'>
                            <FaPlus />
                        </Button>
                    </div>
                    <div className="formAtribuicaoMateria">
                        <label>Selecione o Curso:</label>
                        <Select
                            className='formSelect'
                            options={cursos}
                            onChange={handleCursoFiltroChange}
                            placeholder="Selecione um curso"
                            isSearchable={true}
                            noOptionsMessage={() => 'Nenhum curso disponível'}
                        />
                        {selectedCursoFiltro && (
                            <div className="selectSemestreFiltro">
                                <label>Selecione o Semestre:</label>
                                <Select
                                    className='formSelect'
                                    options={semestresLista}
                                    onChange={handleSemestreFiltroChange}
                                    placeholder="Selecione um Semestre"
                                    isSearchable={true}
                                    noOptionsMessage={() => 'Nenhum semestre disponível'}
                                />
                            </div>
                        )}
                    </div>
                    {exibirTabela && renderTable()}
                </div>
            )}

        </div>
    );
};

export default AtribuiMateriasAlunos;