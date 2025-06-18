"use client"

import { useEffect, useState } from "react"
import {
  FaBook,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChevronDown,
  FaChevronRight,
  FaClipboardList,
  FaCog,
  FaFileAlt,
  FaGraduationCap,
  FaHome,
  FaLayerGroup,
  FaSchool,
  FaSignOutAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa"
import { useLocation, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../config"
import "./Sidebar.css"

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState({})
  const navigate = useNavigate()
  const location = useLocation()
  const userData = JSON.parse(localStorage.getItem("userData"))
  const [currentSemestre, setCurrentSemestre] = useState(null)
  const [materias, setMaterias] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchSemestresEMaterias = async () => {
      if (!userData || userData.flgProfessor !== 1) return

      const semestresResp = await fetch(`${API_BASE_URL}/aula/retornaSemestres/1`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          "Content-Type": "application/json",
        },
      })
      if (!semestresResp.ok) return
      const semestres = await semestresResp.json()

      const today = new Date()
      const semestreAtual = semestres.find((semestre) => {
        const start = new Date(semestre.dataInicio)
        const end = new Date(semestre.dataFim)
        return today >= start && today <= end
      })
      setCurrentSemestre(semestreAtual)

      if (semestreAtual) {
        const materiasResp = await fetch(
          `${API_BASE_URL}/materiaSemestre/usuario/${userData.id}/semestre/${semestreAtual.id}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
              "Content-Type": "application/json",
            },
          },
        )
        if (!materiasResp.ok) return
        const materiasData = await materiasResp.json()
        setMaterias(materiasData)
      }
    }

    fetchSemestresEMaterias()
  }, [])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)

    const content = document.querySelector(".content")
    if (content) {
      if (!isExpanded) {
        content.classList.add("shifted")
      } else {
        content.classList.remove("shifted")
      }
    }
  }

  const toggleSubmenu = (submenuKey) => {
    if (!isExpanded) {
      setIsExpanded(true)
      const content = document.querySelector(".content")
      if (content) {
        content.classList.add("shifted")
      }
    }

    setOpenSubmenus((prev) => ({
      ...prev,
      [submenuKey]: !prev[submenuKey],
    }))
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleLogout = () => {
    localStorage.removeItem("userData")
    navigate("/")
  }

  const menuItems = [
    {
      key: "dashboard",
      icon: FaHome,
      label: "Dashboard",
      path: "/dashboard",
      type: "item",
    },
    ...(userData?.flgProfessor === 1 && materias.length > 0
      ? [
        {
          key: "minhas-materias",
          icon: FaBook,
          label: "Minhas matérias",
          type: "submenu",
          hasSearch: true,
          items: materias
            .filter((materia) => materia.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((materia) => ({
              key: `materia-${materia.id}`,
              icon: FaBook,
              label: materia.nome,
              path: `/materia/${materia.id}/${currentSemestre.id}`,
            })),
        },
      ]
      : []),
    ...(userData.isAdmin === 1
      ? [
        {
          key: "cadastros",
          icon: FaClipboardList,
          label: "Cadastros",
          type: "submenu",
          items: [
            {
              key: "semestres",
              icon: FaCalendarAlt,
              label: "Semestres",
              path: "/cadastraSemestre",
            },
            {
              key: "cursos",
              icon: FaGraduationCap,
              label: "Cursos",
              path: "/cadastraCurso",
            },
            {
              key: "materias",
              icon: FaLayerGroup,
              label: "Matérias",
              path: "/cadastraMateria",
            },
            {
              key: "laboratorios",
              icon: FaSchool,
              label: "Laboratórios",
              path: "/cadastraLaboratorio",
            },
            {
              key: "usuarios",
              icon: FaUser,
              label: "Usuários",
              path: "/cadastraProfessor",
            },
          ],
        },
        {
          key: "gestao-academica",
          icon: FaCog,
          label: "Gestão Acadêmica",
          type: "submenu",
          items: [
            {
              key: "materias-semestre",
              icon: FaFileAlt,
              label: "Matérias por semestre",
              path: "/cadastraMateriaSemestre",
            },
            {
              key: "matricula-aluno",
              icon: FaGraduationCap,
              label: "Atribuir Curso ao Aluno",
              path: "/matriculaAluno",
            },
            {
              key: "atribui-aulas",
              icon: FaUsers,
              label: "Atribuir Matéria ao Aluno",
              path: "/atribuiAulasAlunos",
            },
          ],
        },
      ]
      : []),
    {
      key: "agendamentos",
      icon: FaCalendarCheck,
      label: "Agendamentos",
      path: "/registraAulasDia",
      type: "item",
    },
    {
      key: "perfil",
      icon: FaUser,
      label: "Perfil",
      path: "/perfil",
      type: "item",
    },
    {
      key: "logout",
      icon: FaSignOutAlt,
      label: "Logout",
      type: "action",
      action: handleLogout,
    },
  ]

  const renderMenuItem = (item) => {
    if (item.type === "submenu") {
      const isOpen = openSubmenus[item.key]
      const hasActiveChild = item.items?.some((child) => location.pathname === child.path)

      return (
        <div key={item.key}>
          <li className={`submenu-header ${hasActiveChild ? "active" : ""}`} onClick={() => toggleSubmenu(item.key)}>
            <item.icon className="menu-icon" />
            {isExpanded && (
              <>
                <span>{item.label}</span>
                <div className="submenu-arrow">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</div>
              </>
            )}
          </li>
          {isExpanded && isOpen && (
            <div className="submenu-container">
              {item.hasSearch && (
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Buscar matéria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <ul className="submenu">
                {item.items.length > 0 ? (
                  item.items.map((subItem) => (
                    <li
                      key={subItem.key}
                      className={`submenu-item ${location.pathname === subItem.path ? "active" : ""}`}
                      onClick={() => handleNavigation(subItem.path)}
                    >
                      <subItem.icon className="menu-icon submenu-icon" />
                      <span>{subItem.label}</span>
                    </li>
                  ))
                ) : item.hasSearch && searchTerm ? (
                  <li className="submenu-item no-results">
                    <span>Nenhuma matéria encontrada</span>
                  </li>
                ) : null}
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (item.type === "action") {
      return (
        <li key={item.key} onClick={item.action}>
          <item.icon className="menu-icon" />
          {isExpanded && <span>{item.label}</span>}
        </li>
      )
    }

    return (
      <li
        key={item.key}
        className={location.pathname === item.path ? "active" : ""}
        onClick={() => handleNavigation(item.path)}
      >
        <item.icon className="menu-icon" />
        {isExpanded && <span>{item.label}</span>}
      </li>
    )
  }

  return (
    <div className={`sidebar ${isExpanded ? "expanded" : ""}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isExpanded ? "←" : "→"}
      </button>
      <ul className="menu">{menuItems.map(renderMenuItem)}</ul>
    </div>
  )
}

export default Sidebar
