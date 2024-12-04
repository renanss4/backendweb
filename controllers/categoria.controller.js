import { categoriaModel } from "../models/categoria.model.js";
import { anuncioModel } from "../models/anuncio.model.js";
import ServerError from "../ServerError.js";
import { CATEGORIA_ERROR } from "../constants/errorCodes.js";
import { validateId } from "../utils/validateId.js";

class CategoriaController {
  async criarCategoria(req, res) {
    const { nome, descricao } = req.body;

    if (!nome || !descricao) {
      throw new ServerError(CATEGORIA_ERROR.CAMPOS_NAO_PREENCHIDOS);
    }

    const categoriaExiste = await categoriaModel.findOne({ nome });
    if (categoriaExiste) {
      throw new ServerError(CATEGORIA_ERROR.CATEGORIA_JA_EXISTE);
    }

    const novaCategoria = {
      nome,
      descricao,
    };

    await categoriaModel.create(novaCategoria);

    return res.status(201).json({ message: "Categoria criada com sucesso!" });
  }

  async buscarCategorias(req, res) {
    const { id, nome } = req.query;
    let query = {};

    if (id) {
      validateId(id);
      query._id = id;
    }

    if (nome) {
      query.nome = { $regex: nome, $options: "i" };
    }

    // Busca no banco de dados
    let categorias;
    if (id) {
      categorias = await categoriaModel
        .findById(query, "-__v -createdAt -updatedAt")
        .populate({
          path: "anuncios.anuncio_id",
          select: "titulo descricao preco -_id",
        });
    } else {
      categorias = await categoriaModel
        .find(query, "-__v -createdAt -updatedAt")
        .populate({
          path: "anuncios.anuncio_id",
          select: "titulo descricao preco -_id",
        });
    }

    if (!categorias || (Array.isArray(categorias) && categorias.length === 0)) {
      // throw new ServerError(CATEGORIA_ERROR.CATEGORIA_NAO_ENCONTRADA);
      return res
        .status(404)
        .json({ message: "Nenhuma categoria foi encontrada" });
    }

    return res.status(200).json(categorias);
  }

  async listarAnunciosPorCategoria(req, res) {
    const { id } = req.params;
    validateId(id);

    const anuncios = await anuncioModel
      .find({ categoria_id: id })
      .populate({
        path: "usuario_id",
        select: "nome",
      })
      .select("-__v -categoria_id -createdAt -updatedAt");

    if (!anuncios || anuncios.length === 0) {
      throw new ServerError(CATEGORIA_ERROR.CATEGORIA_SEM_ANUNCIOS);
    }

    return res.status(200).json(anuncios);
  }

  async atualizarCategoria(req, res) {
    const id = req.params.id;
    validateId(id);

    // Atualiza a categoria com os dados fornecidos
    const categoriaAtualizada = await categoriaModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    if (!categoriaAtualizada) {
      // return res
      //   .status(404)
      //   .json({ message: "Categoria não encontrada para atualização." });
      throw new ServerError(CATEGORIA_ERROR.CATEGORIA_NAO_ENCONTRADA);
    }

    return res.status(200).json({
      message: "Categoria atualizada com sucesso!",
      // categoria: categoriaAtualizada,
    });
  }

  async excluirCategoria(req, res) {
    const id = req.params.id;
    validateId(id);

    // Verifica se a categoria possui anúncios associados
    const anunciosExistentes = await anuncioModel.find({ categoria_id: id });
    if (anunciosExistentes.length > 0) {
      await anuncioModel.deleteMany({ categoria_id: id });

      // Atualiza os usuários, removendo os anúncios excluídos
      await usuarioModel.updateMany(
        { anuncios: { $elemMatch: { categoria_id: id } } },
        { $pull: { anuncios: { categoria_id: id } } }
      );
    }

    const categoriaExcluida = await categoriaModel.findByIdAndDelete(id);
    if (!categoriaExcluida) {
      throw new ServerError(CATEGORIA_ERROR.CATEGORIA_NAO_ENCONTRADA);
    }

    return res.status(200).json({ message: "Categoria excluída com sucesso!" });
  }
}

export default new CategoriaController();
