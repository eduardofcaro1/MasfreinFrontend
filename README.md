# MasfreinFrontend

Este projeto é o **frontend** do sistema **Masfrein**, desenvolvido como parte do Trabalho de Conclusão de Curso (TCC). Ele é responsável por fornecer a interface gráfica para interação com a API do backend, permitindo a gestão de cursos, matrículas, semestres e outras funcionalidades relacionadas.

---

## ✅ Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

Caso o `yarn` não esteja instalado, você pode instalá-lo com o comando:

```bash
npm install -g yarn
```

---

## ⚙️ Configuração do Ambiente

Clone o repositório do frontend:

```bash
git clone https://github.com/eduardofcaro1/MasfreinFrontend
cd MasfreinFrontend
```

Instale as dependências do projeto:

```bash
yarn install
```

Configure o arquivo `config.js` na pasta src do projeto e defina a URL da API do backend. Exemplo:

```env
export const API_BASE_URL = 'http://localhost:8080';
```

---

## 🚀 Como Executar o Projeto

Certifique-se de que o **backend** está rodando e acessível na URL configurada no `.env`.

Inicie o servidor de desenvolvimento:

```bash
yarn start
```

Acesse o projeto em: [http://localhost:3000](http://localhost:3000)

---

## 📦 Scripts Disponíveis

- `yarn start`: Inicia o servidor de desenvolvimento.
- `yarn build`: Gera uma versão otimizada do projeto para produção.
- `yarn test`: Executa os testes configurados no projeto.

---

## 🗂 Estrutura do Projeto

O projeto segue a estrutura padrão de aplicações React criadas com **Create React App**. Os principais diretórios são:

- `src/components`: Componentes reutilizáveis da aplicação.
- `src/pages`: Páginas principais do sistema.
- `src/services`: Configuração das chamadas à API.

---

## 🔐 Login Inicial

Após configurar o backend e o frontend, você pode acessar o sistema com as **credenciais padrão** fornecidas na documentação do backend.