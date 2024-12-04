# Backend do Projeto

Este é o backend do projeto **Serviços UFSC**. Ele fornece as APIs e a lógica necessária para o funcionamento do sistema.

## Pré-requisitos

Certifique-se de que você tenha instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MongoDB](https://www.mongodb.com/) (em execução localmente ou em um serviço de nuvem)

## Como rodar o backend

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/artlemes/projeto_ppw
   ```

2. **Acesse a pasta do backend:**
   ```bash
   cd back
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Crie o arquivo `.env`:**
   Na raiz da pasta `back`, crie um arquivo chamado `.env` e adicione as variáveis de ambiente necessárias. Exemplo:
   ```env
   # SERVER
	PORT=8080

	# DATABASE
	# MONGO_URI=mongodb://127.0.0.1:27017/servicos_ufsc
	MONGODB_URL=127.0.0.1
	MONGODB_PORT=27017
	MONGODB_DBNAME=servicos_ufsc

	# JWT
	JWT_SECRET=secret
   ```

5. **Inicie o servidor:**
   ```bash
   npm start
   ```

6. **Acesse o backend:**
   O servidor estará rodando em [http://127.0.0.1:8080](http://127.0.0.1:8080).

## Observações

- **Banco de Dados:** Certifique-se de que o MongoDB está instalado e em execução localmente (ou configure a variável `MONGODB_URL` para apontar para um banco em nuvem, como o MongoDB Atlas).
- **Ambiente de Desenvolvimento:** Para desenvolvimento, você pode usar o `nodemon` para reiniciar o servidor automaticamente ao alterar o código:
  ```bash
  npm install -g nodemon
  nodemon server.js
  ```


