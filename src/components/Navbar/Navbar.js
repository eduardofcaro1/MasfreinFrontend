import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData?.isAdmin === 1;

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        {isAdmin && <li><Link to="/cadastraSemestre">Cadastrar Semestre</Link></li>}
        {isAdmin && <li><Link to="/cadastraCurso">Cadastrar Curso</Link></li>}
        {isAdmin && <li><Link to="/cadastraMateria">Cadastrar Matérias</Link></li>}
        {isAdmin && <li><Link to="/cadastraLaboratorio">Cadastrar Laboratórios</Link></li>}
        {isAdmin && <li><Link to="/cadastraProfessor">Cadastrar Professor</Link></li>}
        {isAdmin && <li><Link to="/cadastraMateriaSemestre">Registrar matérias pertencentes ao semestre</Link></li>}
        <li><Link to="/registraAulas">Registrar aulas</Link></li>
        <li><Link to="/registraAulasDia">Registrar aulas dia</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;