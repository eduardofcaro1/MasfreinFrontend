import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './CadastraUsuario.css';

const CadastrarUsuario = () => {
  const [dscUsuario, setDscUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [key, setKey] = useState('');
  const [flgAtivo, setFlgAtivo] = useState('S');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [celular, setCelular] = useState('');
  const [flgProfessor, setFlgProfessor] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = {
      dscUsuario,
      senhaUsuario,
      key,
      flgAtivo: 'N',
      nomeUsuario,
      celular,
      flgProfessor: flgProfessor ? 1 : 0,
      flgMobile: 0
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert('Usuário cadastrado com sucesso!');
        navigate('/');
      } else {
        alert('Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      alert('Ocorreu um erro ao cadastrar o usuário. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="cadastrar-usuario-container">
      <form clss="cadastrar-usuario-form" onSubmit={handleSubmit}>
        <h2>Cadastrar Usuário</h2>
        <div class="input-cadastrar-usuario-container">
          <label htmlFor="dscUsuario" className='label-cadastra-usuario'>Nome do Usuário:</label>
          <input
            type="text"
            id="dscUsuario"
            value={dscUsuario}
            onChange={(e) => setDscUsuario(e.target.value)}
            required
          />
        </div>
        <div class="input-cadastrar-usuario-container">
          <label htmlFor="senhaUsuario" className='label-cadastra-usuario'>Senha:</label>
          <input
            class="input-senha-cadastro-usuario"
            type="password"
            id="senhaUsuario"
            value={senhaUsuario}
            onChange={(e) => setSenhaUsuario(e.target.value)}
            required
          />
        </div>
        <div class="input-cadastrar-usuario-container">
          <label htmlFor="key" className='label-cadastra-usuario'>Chave da instituição:</label>
          <input
            type="text"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
        <div class="input-cadastrar-usuario-container">
          <label htmlFor="nomeUsuario" className='label-cadastra-usuario'>Nome Completo:</label>
          <input
            type="text"
            id="nomeUsuario"
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
            required
          />
        </div>

        <div class="celular-checkbox-container">
          <div class="input-cadastrar-usuario-celular">
            <label htmlFor="celular" className='label-cadastra-usuario'>Celular:</label>
            <input
              type="text"
              id="celular"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              required
            />
          </div>
        </div>
        <button class="cadastrar-btn" type="submit">Cadastrar</button>

        <a>Já tem um cadastro?<span onClick={() => navigate('/')}>&nbsp;Entrar</span></a>
      </form>
    </div>
  );
};

export default CadastrarUsuario;
