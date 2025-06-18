import React from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AtribuiMateriasAlunos from './components/AtribuiMateriasAlunos/AtribuiMateriasAlunos';
import CadastraCurso from './components/CadastraCurso/CadastraCurso';
import CadastraLaboratorio from './components/CadastraLaboratorio/CadastraLaboratorio';
import CadastraMateria from './components/CadastraMateria/CadastraMateria';
import CadastraMateriaSemestre from './components/CadastraMateriaSemestre/CadastraMateriaSemestre';
import CadastraProfessor from './components/CadastraProfessor/CadastraProfessor';
import CadastraSemestre from './components/CadastraSemestre/CadastraSemestre';
import CadastraUsuario from './components/CadastraUsuario/CadastraUsuario';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Materia from './components/Materia/Materia';
import MatricularAlunoCurso from './components/MatricularAlunoCurso/MatricularAlunoCurso';
import Perfil from './components/Perfil/Perfil';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import RegistraAulas from './components/RegistraAulas/RegistraAulas';
import RegistraAulasDia from './components/RegistraAulasDia/RegistraAulasDia';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';

const App = () => {
  const location = useLocation();

  const shouldShowSidebar = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <div className="App">
      {shouldShowSidebar && <Sidebar />}
      <div className="main-content">
        {shouldShowSidebar && <Toolbar />}
        <div className={`content ${shouldShowSidebar ? 'content' : ''}`} style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<CadastraUsuario />} />
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/cadastraSemestre" element={<ProtectedRoute element={CadastraSemestre} adminOnly />} />
            <Route path="/cadastraCurso" element={<ProtectedRoute element={CadastraCurso} adminOnly />} />
            <Route path="/cadastraLaboratorio" element={<ProtectedRoute element={CadastraLaboratorio} adminOnly />} />
            <Route path="/cadastraProfessor" element={<ProtectedRoute element={CadastraProfessor} adminOnly />} />
            <Route path="/cadastraMateriaSemestre" element={<ProtectedRoute element={CadastraMateriaSemestre} adminOnly />} />
            <Route path="/cadastraMateria" element={<ProtectedRoute element={CadastraMateria} adminOnly />} />
            <Route path="/atribuiAulasAlunos" element={<ProtectedRoute element={AtribuiMateriasAlunos} adminOnly />} />
            <Route path="/matriculaAluno" element={<ProtectedRoute element={MatricularAlunoCurso} adminOnly />} />
            <Route path="/registraAulas" element={<ProtectedRoute element={RegistraAulas} />} />
            <Route path="/registraAulasDia" element={<ProtectedRoute element={RegistraAulasDia} />} />
            <Route path="/materia/:id/:semestreId" element={<ProtectedRoute element={Materia} />} />
            <Route path="/perfil" element={<ProtectedRoute element={Perfil} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const MainApp = () => (
  <Router>
    <App />
  </Router>
);

export default MainApp;