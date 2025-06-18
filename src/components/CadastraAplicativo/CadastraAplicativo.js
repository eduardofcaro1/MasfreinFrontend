import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import './CadastraAplicativo.css';

const CadastraAplicativo = () => {

    const [nomeApp, setNomeApp] = useState('')
    const handleCadastrarAplicativo = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;
        const instituicaoId = userData?.instituicao?.id;

        if (!nomeApp) {
            setError('Preencha todos os campos');
            setOpenSnackErro(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/aplicativos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nomeApp,
                }),
            });

            if (response.ok) {
                setNomeApp('');
            } else {
                setError('Erro ao cadastrar aplicativo');
                setOpenSnackErro(true);
            }
        } catch (error) {
            console.error('Erro ao cadastrar aplicativo:', error);
            setError('Ocorreu um erro ao cadastrar o aplicativo. Tente novamente mais tarde.');
            setOpenSnackErro(true);
        }
    };

    return (
        <div>
            <form onSubmit={handleCadastrarAplicativo}>
                <label htmlFor='nomeApp'>Aplicação</label>
                <input
                    type='text'
                />
                <button type='submit'>Salvar</button>
            </form>
        </div>
    )
}