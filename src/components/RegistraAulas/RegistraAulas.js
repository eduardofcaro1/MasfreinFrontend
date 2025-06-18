import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Select from 'react-select';
import { API_BASE_URL } from '../../config';
import './RegistraAulas.css';

const RegistraAulas = () => {
    const [cursos, setCursos] = useState([]);
    const [semestres, setSemestres] = useState([]);
    const [materiasSemestre, setMateriasSemestre] = useState([]);
    const [aulasRegistradas, setAulasRegistradas] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [selectedSemestre, setSelectedSemestre] = useState(null);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [laboratorios, setLaboratorios] = useState([]);
    const [aulasDates, setAulasDates] = useState([]);

    const [formData, setFormData] = useState({
        id: null,
        descricao: '',
        horaInicio: '',
        horaFim: '',
        laboratorio: null
    });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const userInstituicaoId = userData?.instituicao?.id;

        if (userInstituicaoId && token) {
            fetch(`${API_BASE_URL}/materiaSemestre/retornaCursosSemestres/${userInstituicaoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    setCursos(data.cursos);
                    setSemestres(data.semestres);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados:', error);
                });
        }
    }, []);

    useEffect(() => {
        if (selectedCurso && selectedSemestre) {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            fetch(`${API_BASE_URL}/materiaSemestre/retornaMateriasSemestres/${selectedCurso.value}/${selectedSemestre.value}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    setMateriasSemestre(data);
                    setSelectedMateria(null);
                })
                .catch(error => {
                    console.error('Erro ao buscar matérias:', error);
                });
        }
    }, [selectedCurso, selectedSemestre]);

    useEffect(() => {
        if (selectedCurso) {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const token = userData?.token;

            fetch(`${API_BASE_URL}/lab/retornaLaboratorios/${selectedCurso.value}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    setLaboratorios(data);
                })
                .catch(error => {
                    console.error('Erro ao buscar laboratórios:', error);
                });
        }
    }, [selectedCurso]);

    const handleCursoChange = (selectedOption) => {
        setSelectedCurso(selectedOption);
        setSelectedMateria(null);
        setShowCalendar(false);
    };

    const handleSemestreChange = (selectedOption) => {
        setSelectedSemestre(selectedOption);
        setSelectedMateria(null);
        setShowCalendar(false);
        const selectedSemestreData = semestres.find(semestre => semestre.id === selectedOption.value);

        if (selectedSemestreData) {
            setMinDate(new Date(selectedSemestreData.dataInicio));
            setMaxDate(new Date(selectedSemestreData.dataFim));
        }
    };

    const handleMateriaChange = (selectedOption) => {
        setSelectedMateria(selectedOption);
    };

    const handleRegisterClick = () => {
        if (selectedCurso && selectedSemestre && selectedMateria) {
            setShowCalendar(true);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;

        if (selectedMateria) {
            const url = `${API_BASE_URL}/registrarAula/retornaAulasMateriaSemestre/${selectedMateria.value}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    const aulasDoDia = data.filter(aula => {
                        const aulaDate = new Date(aula.dia);
                        const localDate = new Date(aulaDate.getUTCFullYear(), aulaDate.getUTCMonth(), aulaDate.getUTCDate());
                        return localDate.getTime() === date.getTime();
                    });
                    setAulasRegistradas(aulasDoDia);

                    const allDates = data.map(aula => {
                        const aulaDate = new Date(aula.dia);
                        return new Date(aulaDate.getUTCFullYear(), aulaDate.getUTCMonth(), aulaDate.getUTCDate());
                    });
                    setAulasDates(allDates);
                })
                .catch(error => {
                    console.error('Erro ao buscar aulas registradas:', error);
                });
        }
        setShowForm(true);
    };


    const tileClassName = ({ date }) => {
        const isAulaDate = aulasDates.some(aulaDate =>
            aulaDate.toDateString() === date.toDateString()
        );
        return isAulaDate ? 'highlight' : null;
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLaboratorioChange = (selectedOption) => {
        setFormData({
            ...formData,
            laboratorio: selectedOption
        });
    };

    const handleSubmit = () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;

        const aulaData = {
            descricao: formData.descricao,
            horaInicio: formData.horaInicio,
            horaFim: formData.horaFim,
            laboratorioId: formData.laboratorio?.value,
            materiaSemestreId: selectedMateria.value,
            dia: selectedDate.toISOString().split('T')[0]
        };

        const url = `${API_BASE_URL}/registrarAula/novaAula`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(aulaData)
        })
            .then(response => response.json())
            .then(data => {
                setShowForm(false);
                setFormData({
                    id: null,
                    descricao: '',
                    horaInicio: '',
                    horaFim: '',
                    laboratorio: null
                });
                handleDateChange(selectedDate);
            })
            .catch(error => {
                console.error('Erro ao criar aula:', error);
            });
    };



    const handleDeleteClick = (aulaId) => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;

        fetch(`${API_BASE_URL}/registrarAula/excluirAula/${aulaId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    handleDateChange(selectedDate);
                } else {
                    console.error('Erro ao excluir aula');
                }
            })
            .catch(error => {
                console.error('Erro ao excluir aula:', error);
            });
    };

    return (
        <div>

            <div className="form-container">
                <h2>Registrar aulas</h2>

                <div className="form-group">
                    <label htmlFor="curso">Selecione o Curso:</label>
                    <Select
                        id="curso"
                        options={cursos.map(curso => ({ value: curso.id, label: curso.nome }))}
                        value={selectedCurso}
                        onChange={handleCursoChange}
                        placeholder="Selecione um curso"
                        isSearchable={true}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="semestre">Selecione o Semestre:</label>
                    <Select
                        id="semestre"
                        options={semestres.map(semestre => ({ value: semestre.id, label: semestre.descricao }))}
                        value={selectedSemestre}
                        onChange={handleSemestreChange}
                        placeholder="Selecione um semestre"
                        isSearchable={true}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="materia">Selecione a Matéria:</label>
                    <Select
                        id="materia"
                        options={materiasSemestre.map(materia => ({ value: materia.id, label: materia.nomeMateria }))}
                        value={selectedMateria}
                        onChange={handleMateriaChange}
                        placeholder="Selecione uma matéria"
                        isSearchable={true}
                    />
                </div>

                <button onClick={handleRegisterClick} disabled={!selectedCurso || !selectedSemestre || !selectedMateria}>
                    Registrar Aula
                </button>

                {showCalendar && (
                    <div className="calendar-container">
                        <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            minDate={minDate}
                            maxDate={maxDate}
                            tileClassName={tileClassName}
                        />

                    </div>
                )}

                {showForm && (
                    <div className="form-group">
                        <h3>{formData.id ? 'Editar Aula' : 'Adicionar Aula'}</h3>
                        <form>
                            <div className="form-group">
                                <label htmlFor="descricao">Descrição:</label>
                                <input
                                    type="text"
                                    id="descricao"
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleFormChange}
                                    placeholder="Descrição da aula"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="horaInicio">Hora de Início:</label>
                                <input
                                    type="time"
                                    id="horaInicio"
                                    name="horaInicio"
                                    value={formData.horaInicio}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="horaFim">Hora de Fim:</label>
                                <input
                                    type="time"
                                    id="horaFim"
                                    name="horaFim"
                                    value={formData.horaFim}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="laboratorio">Laboratório:</label>
                                <Select
                                    id="laboratorio"
                                    options={laboratorios.map(lab => ({ value: lab.id, label: lab.nome }))}
                                    value={formData.laboratorio}
                                    onChange={handleLaboratorioChange}
                                    placeholder="Selecione um laboratório"
                                />
                            </div>
                            <button type="button" onClick={handleSubmit}>
                                {formData.id ? 'Atualizar' : 'Adicionar'}
                            </button>
                        </form>
                    </div>
                )}

                {aulasRegistradas.length > 0 && (
                    <div className="aulas-registradas">
                        <h3>Aulas Registradas</h3>
                        <ul>
                            {aulasRegistradas.map(aula => (
                                <li key={aula.id}>
                                    {aula.descricao} - {aula.horaInicio} às {aula.horaFim}
                                    <button onClick={() => handleDeleteClick(aula.id)}>Excluir</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistraAulas;
