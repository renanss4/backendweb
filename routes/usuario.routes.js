import { Router } from "express";
import UsuarioController from "../controllers/usuario.controller.js";
import { tryCatch } from "../utils/tryCatch.js";
import { checkToken } from "../middlewares/authenticate.js";

const usuarioRotas = Router();

usuarioRotas.post("/", tryCatch(UsuarioController.criarUsuario));

usuarioRotas.post("/admin", tryCatch(UsuarioController.criarUsuarioAdmin));

/*
  funciona com query params

  1. /buscar - retorna todos os usuários
  2. /buscar?id=123 - retorna o usuário com o id 123
  3. /buscar?nome=fulano - retorna o usuário com o nome fulano
  4. /buscar?email=fulano@email.com - retorna o usuário com o email
  5. /buscar?nome=fulano&email=fulano@email.com - retorna o usuário com o nome e email
 */
usuarioRotas.get(
  "/buscar",
  checkToken,
  tryCatch(UsuarioController.buscarUsuarios)
);

usuarioRotas.get(
  "/logado",
  checkToken,
  tryCatch(UsuarioController.buscarUsuarioLogado)
);

usuarioRotas.get(
  "/anuncios/:id",
  checkToken,
  tryCatch(UsuarioController.listarAnunciosPorUsuario)
);

usuarioRotas.patch(
  "/:id",
  checkToken,
  tryCatch(UsuarioController.atualizarUsuario)
);

usuarioRotas.put(
  "/senha/:id",
  checkToken,
  tryCatch(UsuarioController.atualizarSenha)
);

usuarioRotas.delete(
  "/:id",
  checkToken,
  tryCatch(UsuarioController.excluirUsuario)
);

export default usuarioRotas;
