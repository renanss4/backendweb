import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import { connectToDatabase } from "./database/connect.js";
import routes from "./routes/routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

config();

const startServer = () => {
  const server = express();

  server.use(bodyParser.json());
  server.use(cors());
  server.use("/", routes);
  server.use(errorHandler);

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Rodando na porta ${port}!`);
    console.log(`Abra seu navegador em: http://127.0.0.1:${port}`);
  });
};

// Tenta conectar ao banco e iniciar o servidor
const initApp = async () => {
  try {
    await connectToDatabase();
    startServer();
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1); // Encerra o processo com erro
  }
};

initApp();
