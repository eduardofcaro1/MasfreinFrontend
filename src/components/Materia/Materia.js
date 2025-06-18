"use client"

import ptBrLocale from "@fullcalendar/core/locales/pt-br"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { Alert, Snackbar } from "@mui/material"
import moment from "moment"
import "moment/locale/pt-br"
import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import { API_BASE_URL } from "../../config"
import Loading from '../Loading/Loading'
import "./Materia.css"


moment.locale("pt-br")

const Materia = () => {
  const { id } = useParams()
  const { semestreId } = useParams()
  const [aulas, setAulas] = useState([])
  const [aulasProfessor, setAulasProfessor] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLaboratorios, setModalLaboratorios] = useState(false)
  const [laboratorioSelecionado, setLaboratorioSelecionado] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [newAula, setNewAula] = useState({ descricao: "", horaInicio: "", horaFim: "", laboratorio: "" })
  const [laboratorios, setLaboratorios] = useState([])
  const [selectedAula, setSelectedAula] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [openSnackErro, setOpenSnackErro] = useState(false)
  const [openSnackSucesso, setOpenSnackSucesso] = useState(false)
  const [nomeLaboratorioSelecionado, setNomeLaboratorioSelecionado] = useState("Selecione um laboratório")
  const [materiaInfo, setMateriaInfo] = useState(null)
  const [alunos, setAlunos] = useState([])
  const userData = JSON.parse(localStorage.getItem("userData"))
  const [activeTab, setActiveTab] = useState("descricao")
  const [horaAlerta, sethoraAlerta] = useState(false)
  const [loading, setLoading] = useState(true);
  const [loadingLabs, setLoadingLabs] = useState(true);

  const navigate = useNavigate()

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
          fetchAlunos(),
          fetchMateriaInfo(),
          fetchAulas(),
          fetchMaterias()
        ]);
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      } finally {
        setLoading(false);
      }
    }
    const fetchAlunos = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"))
        const token = userData?.token
        const response = await fetch(`${API_BASE_URL}/materiaSemestre/retornaAlunosCursando/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (response.ok) {
          const data = await response.json()
          setAlunos(data)
        }
      } catch (e) {
      }
    }
    const fetchMateriaInfo = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"))
        const token = userData?.token
        const response = await fetch(`${API_BASE_URL}/registrarAula/retornaMateriaSemestre/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (response.ok) {
          const data = await response.json()
          setMateriaInfo(data)
        }
      } catch (e) {
      }
    }
    const fetchAulas = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"))
        const token = userData?.token

        const response = await fetch(`${API_BASE_URL}/registrarAula/retornaAulasMateriaSemestre/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          const formattedAulas = data.map((aula) => {
            return {
              id: aula.id,
              title: `${aula.descricao} - ${aula.labNome || "Sem laboratório"}`,
              start: moment(`${aula.dia}T${aula.horaInicio}`).toISOString(),
              end: moment(`${aula.dia}T${aula.horaFim}`).toISOString(),
              extendedProps: {
                status: aula.flgStatus,
              },
            }
          })
          setAulas(formattedAulas)
        } else {
          setErrorMessage("Erro ao carregar as aulas")
          setOpenSnackErro(true)
        }
      } catch (error) {
        setErrorMessage("Erro ao buscar aulas")
        setOpenSnackErro(true)
      }
    }
    const fetchMaterias = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/materiaSemestre/usuario/${userData.id}/semestre/${semestreId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userData.token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          const aulasReq = data.map((aulaReq) => String(aulaReq.id))
          if (!aulasReq.includes(id) || aulasReq.length < 1) {
            navigate("/dashboard")
          }
        } else {
          console.error("Erro ao carregar as matérias")
        }
      } catch (error) {
        console.error("Erro ao buscar matérias:", error)
      }
    }
    loadData();
  }, [id])


  const defineFimSemestre = () => {
    const mesAtual = moment().month()
    if (mesAtual < 5) {
      return 6 - mesAtual
    }
    return 11 - mesAtual
  }

  const fetchLaboratoriosDisponiveis = async (dia, horaInicio, horaFim) => {
    setLoadingLabs(true)
    try {
      const userData = JSON.parse(localStorage.getItem("userData"))
      const token = userData?.token

      const response = await fetch(
        `${API_BASE_URL}/lab/disponiveis?dia=${dia}&horaInicio=${horaInicio}&horaFim=${horaFim}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setLaboratorios(data)
      } else {
        setErrorMessage("Erro ao carregar os laboratórios disponíveis")
        setOpenSnackErro(true)
      }
      setLoadingLabs(false);
    } catch (error) {
      setErrorMessage("Erro ao buscar laboratórios disponíveis:", error)
      setOpenSnackErro(true)
      setLoadingLabs(false);
    }
  }

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr)
    setModalOpen(true)
  }

  const handleEventClick = (info) => {
    const aula = aulas.find((a) => a.id === Number.parseInt(info.event.id))
    setSelectedAula(aula)
    setModalOpen(true)
  }

  const handleLabModal = () => {
    setModalLaboratorios(true)
  }
  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedDate(null)
    setNewAula({ descricao: "", horaInicio: "", horaFim: "", laboratorio: "" })
    setLaboratorios([])
    setLaboratorioSelecionado(null)
    setSelectedAula(null)
    sethoraAlerta(false)
  }

  const handleAulaSave = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"))
      const token = userData?.token

      const newEvent = {
        laboratorioId: newAula.laboratorio,
        materiaSemestreId: id,
        descricao: newAula.descricao,
        dia: selectedDate,
        horaInicio: newAula.horaInicio,
        horaFim: newAula.horaFim,
        flgStatus: "P",
      }

      const response = await fetch(`${API_BASE_URL}/registrarAula/novaAula`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      })

      if (response.ok) {
        const savedAula = await response.json()
        setAulas((prevAulas) => [
          ...prevAulas,
          {
            id: savedAula.id,
            title: `${savedAula.descricao} - ${savedAula.laboratorio?.nome || "Sem laboratório"}`,
            start: moment(savedAula.dia + "T" + savedAula.horaInicio).toISOString(),
            end: moment(savedAula.dia + "T" + savedAula.horaFim).toISOString(),
            extendedProps: {
              status: savedAula.flgStatus,
            },
          },
        ])
        setSuccessMessage("Aula registrada com sucesso!")
        setOpenSnackSucesso(true)
        handleModalClose()
      } else {
        setErrorMessage("Erro ao salvar a aula")
        setOpenSnackErro(true)
      }
    } catch (error) {
      setErrorMessage("Erro ao salvar aula:", error)
      setOpenSnackErro(true)
    }
    sethoraAlerta(false);
    setLaboratorioSelecionado(false);
  }

  const handleAulaDelete = async () => {
    if (window.confirm("Você realmente quer excluir esta aula?")) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"))
        const token = userData?.token

        const response = await fetch(`${API_BASE_URL}/registrarAula/excluirAula/${selectedAula.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setAulas((prevAulas) => prevAulas.filter((aula) => aula.id !== selectedAula.id))
          handleModalClose()
          setSuccessMessage("Registro de aula excluído com sucesso!")
          setOpenSnackSucesso(true)
        } else {
          setErrorMessage("Erro ao excluir a aula")
          setOpenSnackErro(true)
        }
      } catch (error) {
        setErrorMessage("Erro ao excluir aula:", error)
        setOpenSnackErro(true)
      }
    }
  }

  useEffect(() => {
    if (newAula.horaInicio && newAula.horaFim) {
      if (newAula.horaInicio > newAula.horaFim) {
        sethoraAlerta(true);
      }
      else {
        sethoraAlerta(false);
      }
      fetchLaboratoriosDisponiveis(selectedDate, newAula.horaInicio, newAula.horaFim)
    }
  }, [newAula.horaInicio, newAula.horaFim, selectedDate])

  const isLaboratorioSelectEnabled = newAula.horaInicio && newAula.horaFim

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setOpenSnackErro(false)
    setOpenSnackSucesso(false)
  }

  const alteraLabSelecionado = (labId) => {
    let laboratorio = laboratorios.find(lab => lab.id == labId);
    setLaboratorioSelecionado(laboratorio);
    setNewAula({ ...newAula, laboratorio: labId })
  }

  const confirmaSelecaoLab = () => {
    setNomeLaboratorioSelecionado(laboratorioSelecionado.nome)
    setModalLaboratorios(false)
  }

  return (
    <div className="materia-container">
      <Snackbar
        open={openSnackErro}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          sx={{
            backgroundColor: "red",
            color: "#fff",
            fontSize: "1rem",
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
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: "green",
            color: "#fff",
            fontSize: "1rem",
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
          {materiaInfo && (
            <div className="materia-header">
              <h2>
                {materiaInfo.materia.nome} ({materiaInfo.materia.sigla})
              </h2>

              <div className="submenu-tabs">
                <button
                  className={`tab-button ${activeTab === "descricao" ? "active" : ""}`}
                  onClick={() => setActiveTab("descricao")}
                >
                  Descrição
                </button>
                <button
                  className={`tab-button ${activeTab === "alunos" ? "active" : ""}`}
                  onClick={() => setActiveTab("alunos")}
                >
                  Alunos ({alunos.length})
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "descricao" && (
                  <div className="materia-detalhes">
                    <p>
                      <strong>Curso:</strong> {materiaInfo.materia.curso.nome}
                    </p>
                    <p>
                      <strong>Semestre:</strong> {materiaInfo.semestre.descricao}
                    </p>
                    <p>
                      <strong>Período:</strong> {new Date(materiaInfo.semestre.dataInicio).toLocaleDateString()} -{" "}
                      {new Date(materiaInfo.semestre.dataFim).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Professor:</strong> {materiaInfo.usuario.nomeUsuario}
                    </p>
                    <p>
                      <strong>Módulo:</strong> {materiaInfo.numeroModulo}
                    </p>
                    <p>
                      <strong>Quantidade de Aulas:</strong> {materiaInfo.materia.qtdAulas}
                    </p>
                  </div>
                )}

                {activeTab === "alunos" && (
                  <div className="materia-alunos">
                    {alunos.length > 0 ? (
                      <ul>
                        {alunos.map((aluno) => (
                          <li key={aluno.id}>
                            <span className="aluno-nome">{aluno.nomeUsuario}</span>
                            <span className="aluno-dsc">{aluno.dscUsuario}</span>
                            <span className={`aluno-status ${aluno.flgAceito === "S" ? "aceito" : "pendente"}`}>
                              {aluno.flgAceito === "S" ? "Aceito" : "Pendente"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-students">Nenhum aluno inscrito ainda.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={aulas}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              locale={ptBrLocale}
              height="auto"
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              validRange={{
                start: moment().startOf("month").toISOString(),
                end: moment().add(defineFimSemestre(), "month").endOf("month").toISOString(),
              }}
              eventDidMount={(info) => {
                const status = info.event.extendedProps.status
                if (status === "P") {
                  info.el.style.backgroundColor = "orange"
                } else if (status === "A") {
                  info.el.style.backgroundColor = "green"
                } else if (status === "N") {
                  info.el.style.backgroundColor = "red"
                } else {
                  info.el.style.backgroundColor = "gray"
                }
                info.el.style.color = "white"
              }}
            />
          </div>

          {modalOpen && (
            <div className="modal">
              <div className="modal-content">
                {selectedAula ? (
                  <>
                    <h3>Visualizar Aula</h3>
                    <p>Descrição: {selectedAula.title.split(" - ")[0]}</p>
                    <p>Laboratório: {selectedAula.title.split(" - ")[1]}</p>
                    <p>Data: {moment(selectedAula.start).format("DD/MM/YYYY")}</p>
                    <p>Hora de Início: {moment(selectedAula.start).format("HH:mm")}</p>
                    <p>Hora de Fim: {moment(selectedAula.end).format("HH:mm")}</p>
                    <div className="modal-buttons">
                      <button onClick={handleModalClose} className="btnVizuAula">
                        Fechar
                      </button>
                      {selectedAula.extendedProps.status == "P" && (
                        <button onClick={handleAulaDelete} className="btnVizuAula">
                          Excluir
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dadosAula">
                      <h3>Adicionar Aula</h3>
                      <p>Data selecionada: {moment(selectedDate).format("DD/MM/YYYY")}</p>
                      <input
                        type="text"
                        placeholder="Descrição"
                        value={newAula.descricao}
                        onChange={(e) => setNewAula({ ...newAula, descricao: e.target.value })}
                      />
                      <div className="agendamentoField">
                        <input
                          type="time"
                          placeholder="Hora de Início"
                          value={newAula.horaInicio}
                          onChange={(e) => setNewAula({ ...newAula, horaInicio: e.target.value })}
                        />
                      </div>
                      <div className="agendamentoField">
                        <input
                          type="time"
                          placeholder="Hora de Fim"
                          disabled={!newAula.horaInicio}
                          value={newAula.horaFim}
                          onChange={(e) => setNewAula({ ...newAula, horaFim: e.target.value })}
                        />
                      </div>
                      {horaAlerta && (<strong className="horaInvalidaAlerta">Horário Invalido!!</strong>)}
                      {isLaboratorioSelectEnabled && !horaAlerta && (
                        <div className="labAula">
                          <h3 className="nomeLaboratorio">{nomeLaboratorioSelecionado}</h3>
                          <button className="buscarbtn" onClick={handleLabModal}>
                            <FaSearch className="menu-icon" />
                          </button>
                        </div>
                      )}
                      <div className="modal-buttons">
                        <button onClick={handleModalClose}>Cancelar</button>
                        <button onClick={handleAulaSave} disabled={!newAula.descricao || !newAula.horaInicio || !newAula.horaFim || !laboratorioSelecionado}>Salvar</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {modalLaboratorios && (
            <div className="modal">
              <div className="modal-content">
                <h3>Laboratório</h3>


                <button className="close" onClick={() => setModalLaboratorios(false)} aria-label="Fechar modal">
                  &times;
                </button>
                <select
                  className="selectLabOpcoes"
                  value={newAula.laboratorio}
                  onChange={(e) => alteraLabSelecionado(e.target.value)}
                >
                  <option value="">Selecione um laboratório</option>
                  {laboratorios.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.nome}
                    </option>
                  ))}
                </select>
                {loadingLabs && (
                  <Loading />
                )}
                {!loadingLabs && laboratorioSelecionado && (
                  <div className="dadosLaboratorioSelecionado">
                    <div className="nomeQtdCompLug">
                      <ul>
                        <li>Nome: <strong>{laboratorioSelecionado.nome}</strong></li>
                        <li>Qtd. Lugares: <strong>{laboratorioSelecionado.qtdLugares}</strong></li>
                        <li>Qtd. Computadores: <strong>{laboratorioSelecionado.qtdComputadores}</strong></li>
                      </ul>
                    </div>
                    <div className="listaAplicativos">

                      <ul>
                        <li><strong>APLICATIVOS:</strong></li>
                        {laboratorioSelecionado && Array.isArray(laboratorioSelecionado.aplicativos) && laboratorioSelecionado.aplicativos.map((aplicativo) => (
                          <li key={aplicativo.id}>{aplicativo.nome}</li>
                        ))}
                      </ul>

                    </div>
                  </div>
                )}
                <button onClick={confirmaSelecaoLab}>Confirmar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Materia
