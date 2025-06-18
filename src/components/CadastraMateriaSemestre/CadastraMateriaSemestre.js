import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { API_BASE_URL } from '../../config';
import './CadastraMateriaSemestre.css';

const CadastraMateriaSemestre = () => {
    const [cursos, setCursos] = useState([]);
    const [semestres, setSemestres] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [materiasSemestre, setMateriasSemestre] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [selectedSemestre, setSelectedSemestre] = useState(null);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [selectedModulo, setSelectedModulo] = useState(null);
    const [modulos, setModulos] = useState([]);

    const gerarModulos = (duracao) => {
        const modulos = Array.from({ length: duracao }, (_, i) => ({ value: i + 1, label: `Módulo ${i + 1}` }));
        setModulos(modulos);
    };

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
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const userInstituicaoId = userData?.instituicao?.id;

        if (selectedCurso && selectedSemestre && selectedModulo) {
            fetch(`${API_BASE_URL}/materiaSemestre/retornaMateriasProfessoresDisponiveis/${selectedCurso.value}/${userInstituicaoId}/${selectedSemestre.value}/${selectedModulo.value}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    setMaterias(data.materias);
                    setProfessores(data.professores);
                    setMateriasSemestre(data.materiasSemestre || []);
                })
                .catch(error => {
                    console.error('Erro ao buscar matérias e professores:', error);
                });
        }
    }, [selectedCurso, selectedSemestre, selectedModulo]);

    const handleCursoChange = (selectedOption) => {
        setSelectedCurso(selectedOption);
        gerarModulos(selectedOption?.duracaoSemestres);
    };

    const handleSemestreChange = (selectedOption) => {
        setSelectedSemestre(selectedOption);
    };

    const handleMateriaChange = (selectedOption) => {
        setSelectedMateria(selectedOption);
    };

    const handleProfessorChange = (selectedOption) => {
        setSelectedProfessor(selectedOption);
    };

    const handleModuloChange = (selectedOption) => {
        setSelectedModulo(selectedOption);
    };

    const handleSubmit = () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;

        if (selectedMateria && selectedSemestre && selectedProfessor && selectedModulo) {
            const materiaSemestreDTO = {
                materia: selectedMateria.value,
                semestre: selectedSemestre.value,
                professor: selectedProfessor.value,
                numeroModulo: selectedModulo.value
            };

            fetch(`${API_BASE_URL}/materiaSemestre/cadastrarMateriaSemestre`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materiaSemestreDTO)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Erro ao cadastrar matéria no semestre');
                    }
                })
                .then(data => {
                    setSelectedCurso(null);
                    setSelectedSemestre(null);
                    setSelectedMateria(null);
                    setSelectedProfessor(null);
                    setSelectedModulo(null);
                })
                .catch(error => {
                    console.error('Erro ao cadastrar matéria:', error);
                });
        } else {
            console.error('Por favor, preencha todos os campos antes de cadastrar.');
        }
    };

    return (
        <div>
            <div className="container-root">
                <div class="titulo-container">
                    <h2 class="titulo">Cadastro de Matérias por Semestre</h2>
                </div>

                <div>
                    <label htmlFor="curso">Selecione o Curso:</label>
                    <Select
                        id="curso"
                        options={cursos.map(curso => ({ value: curso.id, label: curso.nome, duracaoSemestres: curso.duracaoSemestres }))}
                        value={selectedCurso}
                        onChange={handleCursoChange}
                        placeholder="Selecione um curso"
                        isSearchable={true}
                    />
                </div>

                {selectedCurso && (
                    <div>
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
                )}

                {selectedSemestre && (
                    <div>
                        <label htmlFor="modulo">Selecione o Módulo:</label>
                        <Select
                            id="modulo"
                            options={modulos}
                            value={selectedModulo}
                            onChange={handleModuloChange}
                            placeholder="Selecione um módulo"
                            isSearchable={true}
                        />
                    </div>
                )}

                {selectedCurso && selectedSemestre && selectedModulo && (
                    <div>
                        <div>
                            <label htmlFor="materia">Selecione a Matéria:</label>
                            <Select
                                id="materia"
                                options={materias.map(materia => ({ value: materia.id, label: materia.nome }))}
                                value={selectedMateria}
                                onChange={handleMateriaChange}
                                placeholder="Selecione uma matéria"
                                isSearchable={true}
                            />
                        </div>

                        <div>
                            <label htmlFor="professor">Selecione o Professor:</label>
                            <Select
                                id="professor"
                                options={professores.map(professor => ({ value: professor.id, label: professor.nomeUsuario }))}
                                value={selectedProfessor}
                                onChange={handleProfessorChange}
                                placeholder="Selecione um professor"
                                isSearchable={true}
                            />
                        </div>
                    </div>
                )}

                <button type="button" className='cadastrar-materia-semestre-btn' onClick={handleSubmit}>
                    Cadastrar
                </button>
                {selectedSemestre && (
                    <div className="materias-semana">
                        <h3>Matérias Registradas no Semestre</h3>
                        <div className="materias-container">
                            {materiasSemestre.map(materiaSemestre => (
                                <div className="materia-card" key={materiaSemestre.id}>
                                    <h4>{materiaSemestre.materia.nome}</h4>
                                    <p><strong>Professor:</strong> {materiaSemestre.usuario.nomeUsuario}</p>
                                    <p><strong>Período:</strong> {materiaSemestre.semestre.descricao}</p>
                                    <p><strong>Data de Início:</strong> {new Date(materiaSemestre.semestre.dataInicio).toLocaleDateString()}</p>
                                    <p><strong>Data de Fim:</strong> {new Date(materiaSemestre.semestre.dataFim).toLocaleDateString()}</p>
                                    <p><strong>Qtd. Aulas: </strong>{materiaSemestre.materia.qtdAulas}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};

export default CadastraMateriaSemestre;
