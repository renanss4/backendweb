import { Router } from "express";
import UsuarioController from "../controllers/usuario.controller.js";
import { checkToken } from "../middlewares/authenticate.js";
import { tryCatch } from "../utils/tryCatch.js";
import usuarioRotas from "./usuario.routes.js";
import categoriaRotas from "./categoria.routes.js";
import anuncioRotas from "./anuncio.routes.js";

const routes = Router();

// Rota do Hello World
routes.get("/", (req, res) => {
  res.send({ Msg: "Hello World!" });
});

// Rota pública
routes.post("/login", tryCatch(UsuarioController.loginUsuario));

// Rota privada
routes.use("/usuario", usuarioRotas);
routes.use("/categoria", checkToken, categoriaRotas);
routes.use("/anuncio", checkToken, anuncioRotas);

// 404 - Not Found
routes.use((req, res) => {
  res.status(404).send({ Msg: "404 - Not Found" });
});

export default routes;
