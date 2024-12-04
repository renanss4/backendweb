import { anuncioModel } from "../models/anuncio.model.js";
import { categoriaModel } from "../models/categoria.model.js";
import { usuarioModel } from "../models/usuario.model.js";
import ServerError from "../ServerError.js";
import {
  ANUNCIO_ERROR,
  CATEGORIA_ERROR,
  USUARIO_ERROR,
} from "../constants/errorCodes.js";
import { validateId } from "../utils/validateId.js";

class AnuncioController {
  async criarAnuncio(req, res) {
    const {
      titulo,
      descricao,
      preco,
      categoria_id,
      usuario_id,
      visibilidade,
      compartilhado_com,
      data_expiracao,
    } = req.body;

    if (
      !titulo ||
      !descricao ||
      !preco ||
      !categoria_id ||
      !usuario_id ||
      !data_expiracao
    ) {
      throw new ServerError(ANUNCIO_ERROR.CAMPOS_NAO_PREENCHIDOS);
    }

    validateId(categoria_id);
    validateId(usuario_id);

    // Verifica se a categoria existe
    const categoriaExiste = await categoriaModel.findById(categoria_id);
    if (!categoriaExiste) {
      throw new ServerError(CATEGORIA_ERROR.CATEGORIA_NAO_ENCONTRADA);
    }

    // Verifica se o usuário existe
    const usuarioExiste = await usuarioModel.findById(usuario_id);
    if (!usuarioExiste) {
      throw new ServerError(USUARIO_ERROR.USUARIO_NAO_ENCONTRADO);
    }

    // Verifica se o usuário é o mesmo que está logado
    if (usuario_id !== req.usuarioId) {
      throw new ServerError(ANUNCIO_ERROR.USUARIO_NAO_AUTORIZADO);
    }

    // Verifica se o título já existe para o mesmo usuário
    const anuncioExiste = await anuncioModel.findOne({ titulo, usuario_id });
    if (anuncioExiste) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIO_JA_EXISTE_PARA_USUARIO);
    }

    // Valida data de expiração
    const now = new Date();
    if (new Date(data_expiracao) <= now) {
      throw new ServerError(ANUNCIO_ERROR.DATA_EXPIRACAO_INVALIDA);
    }

    // Se visibilidade for compartilhada, verificar se tem usuários compartilhados
    if (
      visibilidade === "compartilhado" &&
      (!compartilhado_com || compartilhado_com.length === 0)
    ) {
      throw new ServerError(
        ANUNCIO_ERROR.USUARIOS_COMPARTILHADOS_NAO_INFORMADOS
      );
    }

    // Criar o anúncio
    const novoAnuncio = {
      titulo,
      descricao,
      preco,
      categoria_id,
      usuario_id,
      visibilidade: visibilidade || "privado",
      compartilhado_com,
      data_expiracao,
    };

    const anuncioCriado = await anuncioModel.create(novoAnuncio);

    // FORMA 1: Atualizar o usuário vinculado
    await usuarioModel.findByIdAndUpdate(usuario_id, {
      $push: { anuncios: { anuncio_id: anuncioCriado._id } },
    });

    // FORMA 2: Atualizar o usuário vinculado
    // OLHAR O MODELO DE USUÁRIO PARA ENTENDER
    // await usuarioModel.findByIdAndUpdate(usuario_id, {
    //   $push: { anuncios: anuncioCriado._id },
    // });

    // Atualizar a categoria vinculada
    await categoriaModel.findByIdAndUpdate(categoria_id, {
      $push: { anuncios: { anuncio_id: anuncioCriado._id } },
    });

    return res.status(201).json(anuncioCriado);
  }

  async buscarAnuncios(req, res) {
    const { id, titulo, usuario_id, categoria_id, visibilidade } = req.query;
    const usuarioAutenticadoId = req.usuarioId; // Supondo que o ID do usuário autenticado esteja disponível em `req.usuario.id`

    let query = {};

    if (id) {
      validateId(id);
      query._id = id;
    }

    if (titulo) {
      query.titulo = { $regex: titulo, $options: "i" }; // Busca por título parcial, case insensitive
    }

    if (usuario_id) {
      validateId(usuario_id);
      query.usuario_id = usuario_id;
    }

    if (categoria_id) {
      validateId(categoria_id);
      query.categoria_id = categoria_id;
    }

    if (visibilidade) {
      query.visibilidade = visibilidade;
    }

    // Buscar anúncios com o populate para carregar o campo `compartilhado_com`
    const anuncios = await anuncioModel
      .find(query, "-__v -createdAt -updatedAt")
      .populate({
        path: "compartilhado_com",
        select: "_id nome", // Selecionar apenas o ID e o nome dos usuários
      });

    // Filtrar anúncios com base nas permissões
    const anunciosPermitidos = anuncios.filter((anuncio) => {
      const { visibilidade, usuario_id, compartilhado_com } = anuncio;

      // Se o anúncio for privado, apenas o dono pode vê-lo
      if (
        visibilidade === "privado" &&
        usuario_id.toString() !== usuarioAutenticadoId
      ) {
        return false;
      }

      // Se o anúncio não for privado, verificar se o usuário está na lista de compartilhamento (se aplicável)
      if (
        visibilidade === "compartilhado" &&
        !compartilhado_com.some(
          (compartilhado) =>
            compartilhado._id.toString() === usuarioAutenticadoId
        )
      ) {
        return false;
      }

      // Anúncio é público ou o usuário tem permissão para vê-lo
      return true;
    });

    if (!anunciosPermitidos.length) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIOS_NAO_ENCONTRADOS);
    }

    return res.status(200).json(anunciosPermitidos);
  }

  async mudarVisibilidadeAnuncio(req, res) {
    const { anuncio_id } = req.params;
    const { visibilidade } = req.body;

    validateId(anuncio_id);

    // Validar se o campo `visibilidade` foi fornecido
    if (!visibilidade) {
      throw new ServerError(ANUNCIO_ERROR.VISIBILIDADE_NAO_FORNECIDA);
    }

    // Validar valores permitidos para `visibilidade`
    const valoresPermitidos = ["publico", "privado", "compartilhado"];
    if (!valoresPermitidos.includes(visibilidade)) {
      throw new ServerError(ANUNCIO_ERROR.VISIBILIDADE_INVALIDA);
    }

    // Buscar o anúncio antes de atualizar
    const anuncio = await anuncioModel.findById(anuncio_id);
    if (!anuncio) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIO_NAO_ENCONTRADO);
    }

    // Verificar se o usuário autenticado é o dono do anúncio
    if (anuncio.usuario_id.toString() !== req.usuarioId) {
      throw new ServerError(ANUNCIO_ERROR.USUARIO_NAO_AUTORIZADO);
    }

    // Atualizar a visibilidade do anúncio
    const anuncioAtualizado = await anuncioModel.findByIdAndUpdate(
      anuncio_id,
      { visibilidade },
      { new: true, select: "titulo descricao visibilidade" } // Retornar apenas os campos relevantes
    );

    return res.status(200).json({
      message: "Visibilidade do anúncio atualizada com sucesso.",
      anuncio: anuncioAtualizado,
    });
  }

  async compartilharAnuncio(req, res) {
    const { anuncio_id } = req.params; // ID do anúncio na rota
    const { compartilhado_com } = req.body; // Lista de IDs de usuários no corpo da requisição

    validateId(anuncio_id);

    // Validar se a lista `compartilhado_com` foi fornecida
    if (!Array.isArray(compartilhado_com) || compartilhado_com.length === 0) {
      throw new ServerError(
        ANUNCIO_ERROR.USUARIOS_COMPARTILHADOS_NAO_INFORMADOS
      );
    }

    // Buscar o anúncio antes de atualizar
    const anuncio = await anuncioModel.findById(anuncio_id);
    if (!anuncio) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIO_NAO_ENCONTRADO);
    }

    // Verificar se o usuário autenticado é o dono do anúncio
    if (anuncio.usuario_id.toString() !== req.usuarioId) {
      throw new ServerError(ANUNCIO_ERROR.USUARIO_NAO_AUTORIZADO);
    }

    // Validar se os usuários a serem adicionados existem
    for (const usuarioId of compartilhado_com) {
      validateId(usuarioId);

      const usuarioExiste = await usuarioModel.findById(usuarioId);
      if (!usuarioExiste) {
        throw new ServerError(USUARIO_ERROR.USUARIO_NAO_ENCONTRADO);
      }
    }

    // Atualizar a lista de compartilhamento, adicionando novos usuários sem duplicar
    const anuncioAtualizado = await anuncioModel.findByIdAndUpdate(
      anuncio_id,
      {
        // $addToSet: { compartilhado_com: { $each: compartilhado_com } }, // Adiciona usuários à lista, evitando duplicatas
        compartilhado_com,
      },
      { new: true, select: "titulo descricao visibilidade compartilhado_com" } // Seleciona os campos relevantes
    );

    return res.status(200).json({
      message: "Anúncio compartilhado com sucesso.",
      anuncio: anuncioAtualizado,
    });
  }

  async atualizarAnuncio(req, res) {
    const id = req.params.id;
    validateId(id);

    // Buscar o anúncio antes de atualizar
    const anuncio = await anuncioModel.findById(id);
    if (!anuncio) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIO_NAO_ENCONTRADO);
    }

    // Validar se o campo `data_expiracao` está sendo atualizado e se é válido
    if (
      req.body.data_expiracao &&
      new Date(req.body.data_expiracao) <= new Date()
    ) {
      throw new ServerError(ANUNCIO_ERROR.DATA_EXPIRACAO_INVALIDA);
    }

    // Atualizar o anúncio
    const anuncioAtualizado = await anuncioModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!anuncioAtualizado) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIO_NAO_ENCONTRADO);
    }

    return res.status(204).send();
  }

  async excluirAnuncio(req, res) {
    const id = req.params.id;
    validateId(id);

    // Buscar o anúncio antes de excluir
    const anuncio = await anuncioModel.findById(id);
    if (!anuncio) {
      throw new ServerError(ANUNCIO_ERROR.ANUNCIO_NAO_ENCONTRADO);
    }

    // Remover o anúncio da lista de anúncios da categoria
    await categoriaModel.findByIdAndUpdate(anuncio.categoria_id, {
      $pull: { anuncios: { anuncio_id: id } },
    });

    // Remover o anúncio da lista de anúncios do usuário
    await usuarioModel.findByIdAndUpdate(anuncio.usuario_id, {
      $pull: { anuncios: { anuncio_id: id } },
    });

    // Excluir o anúncio
    await anuncioModel.findByIdAndDelete(id);

    return res.status(204).send();
  }
}

export default new AnuncioController();
