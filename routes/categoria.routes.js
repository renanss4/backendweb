import { Router } from "express";
import CategoriaController from "../controllers/categoria.controller.js";
import { tryCatch } from "../utils/tryCatch.js";
import { adminCheck } from "../middlewares/adminCheck.js";

const categoriaRotas = Router();

categoriaRotas.post(
  "/",
  adminCheck,
  tryCatch(CategoriaController.criarCategoria)
);

/*
  funciona com query params

  1. /buscar - retorna todas as categorias
  2. /buscar?id=123 - retorna a categoria com o id 123
  3. /buscar?nome=fulano - retorna a categoria com o nome fulano
  4. /buscar?id=123&nome=fulano - retorna a categoria com o id e nome
*/
categoriaRotas.get("/buscar", tryCatch(CategoriaController.buscarCategorias));

categoriaRotas.get(
  "/anuncios/:id",
  tryCatch(CategoriaController.listarAnunciosPorCategoria)
);

categoriaRotas.patch(
  "/:id",
  adminCheck,
  tryCatch(CategoriaController.atualizarCategoria)
);

categoriaRotas.delete(
  "/:id",
  adminCheck,
  tryCatch(CategoriaController.excluirCategoria)
);

export default categoriaRotas;
