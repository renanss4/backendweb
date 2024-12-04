import { Router } from "express";
import AnuncioController from "../controllers/anuncio.controller.js";
import { tryCatch } from "../utils/tryCatch.js";

const anuncioRotas = Router();

anuncioRotas.post("/", tryCatch(AnuncioController.criarAnuncio));

/*
  funciona com query params

  1. /buscar - retorna todos os anuncios
  2. /buscar?id=123 - retorna o anuncio com o id 123
  3. /buscar?titulo=fulano - retorna o anuncio com o titulo fulano
  4. /buscar?id=123&titulo=fulano - retorna o anuncio com o id e titulo
*/
anuncioRotas.get("/buscar", tryCatch(AnuncioController.buscarAnuncios));

anuncioRotas.put(
  "/:anuncio_id",
  tryCatch(AnuncioController.mudarVisibilidadeAnuncio)
);

// patch pq deve ser possível enviar mais do que um usuário para compartilhar
anuncioRotas.patch(
  "/:anuncio_id",
  tryCatch(AnuncioController.compartilharAnuncio)
);

anuncioRotas.patch("/:id", tryCatch(AnuncioController.atualizarAnuncio));

anuncioRotas.delete("/:id", tryCatch(AnuncioController.excluirAnuncio));

export default anuncioRotas;
