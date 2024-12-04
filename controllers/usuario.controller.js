import { usuarioModel } from "../models/usuario.model.js";
import { anuncioModel } from "../models/anuncio.model.js";
import ServerError from "../ServerError.js";
import { USUARIO_ERROR, TOKEN_ERROR } from "../constants/errorCodes.js";
import { validateId } from "../utils/validateId.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class UsuarioController {
  async loginUsuario(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw new ServerError(USUARIO_ERROR.CAMPOS_NAO_PREENCHIDOS);
    }

    const usuario = await usuarioModel.findOne({ email });

    if (!usuario) {
      throw new ServerError(USUARIO_ERROR.USUARIO_NAO_ENCONTRADO);
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new ServerError(USUARIO_ERROR.LOGIN_INVALIDO);
    }

    // Gera o token de autenticação
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: usuario._id, papel: usuario.papel }, secret, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  }

  async criarUsuario(req, res) {
    const { nome, sobrenome, email, cpf, telefone, senha, papel, cep } =
      req.body;

    if (!nome || !sobrenome || !email || !cpf || !telefone || !senha || !cep) {
      throw new ServerError(USUARIO_ERROR.CAMPOS_NAO_PREENCHIDOS);
    }

    const usuarioExiste = await usuarioModel.findOne({
      $or: [{ email }, { cpf }],
    });
    if (usuarioExiste) {
      throw new ServerError(USUARIO_ERROR.USUARIO_JA_EXISTE);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedSenha = await bcrypt.hash(senha, salt);

    const novoUsuario = {
      nome,
      sobrenome,
      email,
      cpf,
      telefone,
      senha: hashedSenha,
      cep,
      papel: papel || "usuario",
    };

    await usuarioModel.create(novoUsuario);

    return res.status(201).json({ message: "Usuário criado com sucesso!" });
  }

  async criarUsuarioAdmin(req, res) {
    const { nome, sobrenome, email, cpf, telefone, senha, papel, cep } =
      req.body;

    if (!nome || !sobrenome || !email || !cpf || !telefone || !senha || !cep) {
      throw new ServerError(USUARIO_ERROR.CAMPOS_NAO_PREENCHIDOS);
    }

    const usuarioExiste = await usuarioModel.findOne({
      $or: [{ email }, { cpf }],
    });
    if (usuarioExiste) {
      throw new ServerError(USUARIO_ERROR.USUARIO_JA_EXISTE);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedSenha = await bcrypt.hash(senha, salt);

    const novoUsuario = {
      nome,
      sobrenome,
      email,
      cpf,
      telefone,
      senha: hashedSenha,
      cep,
      papel: papel || "admin",
    };

    await usuarioModel.create(novoUsuario);

    return res.status(201).json({ message: "Admin criado com sucesso!" });
  }

  async buscarUsuarios(req, res) {
    const { id, nome, email } = req.query;
    let query = {};

    if (id) {
      validateId(id);
      query._id = id;
    }

    if (nome) query.nome = nome;

    if (email) {
      query.email = email.toLowerCase();
    }

    // Busca no banco de dados
    let usuarios;
    if (id) {
      usuarios = await usuarioModel.findById(id, "-senha -__v");
    } else {
      usuarios = await usuarioModel.find(query, "-senha -__v");
    }

    if (!usuarios || (Array.isArray(usuarios) && usuarios.length === 0)) {
      return res
        .status(404)
        .json({ message: "Nenhum usuário foi encontrado." });
    }

    return res.status(200).json(usuarios);
  }

  async buscarUsuarioLogado(req, res) {
    const id = req.usuarioId;
    validateId(id);

    const usuario = await usuarioModel.findById(id, "-senha -__v");

    if (!usuario) {
      throw new ServerError(USUARIO_ERROR.USUARIO_NAO_ENCONTRADO);
    }

    return res.status(200).json(usuario);
  }

  async listarAnunciosPorUsuario(req, res) {
    const { id } = req.params;
    validateId(id);

    const anuncios = await anuncioModel
      .find({ usuario_id: id })
      .populate({
        path: "usuario_id", // Popula o campo `usuario_id`
        select: "nome", // Retorna apenas o nome do usuário
      })
      .select("-__v -categoria_id -createdAt -updatedAt"); // Exclui campos desnecessários

    if (!anuncios || anuncios.length === 0) {
      throw new ServerError(USUARIO_ERROR.USUARIO_SEM_ANUNCIOS);
    }

    return res.status(200).json(anuncios);
  }

  async atualizarUsuario(req, res) {
    const id = req.params.id;
    validateId(id);

    // Verifica se a senha foi passada nos dados da requisição
    if (req.body.senha) {
      throw new ServerError(USUARIO_ERROR.SENHA_NAO_PODE_SER_ATUALIZADA);
    }

    // Criando uma cópia do corpo da requisição, excluindo a senha
    const { senha, ...dadosAtualizados } = req.body;

    const usuarioAtualizado = await usuarioModel.findByIdAndUpdate(
      id,
      dadosAtualizados,
      {
        new: true,
      }
    );

    if (!usuarioAtualizado) {
      throw new ServerError(USUARIO_ERROR.USUARIO_NAO_ENCONTRADO);
    }

    return res.status(200).json({ message: "Usuário atualizado com sucesso!" });
  }

  async atualizarSenha(req, res) {
    const id = req.usuarioId;
    validateId(id);

    const { senhaAntiga, senhaNova } = req.body;

    if (req.usuarioId != id) {
      throw new ServerError(TOKEN_ERROR.ACESSO_NEGADO);
    }

    const usuario = await usuarioModel.findById(id);

    const senhaCorreta = await bcrypt.compare(senhaAntiga, usuario.senha);
    if (!senhaCorreta) {
      throw new ServerError(USUARIO_ERROR.SENHA_INCORRETA);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedSenha = await bcrypt.hash(senhaNova, salt);

    await usuarioModel.findByIdAndUpdate(id, { senha: hashedSenha });

    return res.status(200).json({ message: "Senha atualizada com sucesso!" });
  }

  async excluirUsuario(req, res) {
    const id = req.params.id;
    validateId(id);

    // Verifica se o usuário possui anúncios associados
    const anunciosExistentes = await anuncioModel.find({ usuario_id: id });
    if (anunciosExistentes.length > 0) {
      await anuncioModel.deleteMany({ usuario_id: id });

      // Atualiza as categorias, removendo os anúncios excluídos
      await categoriaModel.updateMany(
        { anuncios: { $elemMatch: { usuario_id: id } } },
        { $pull: { anuncios: { usuario_id: id } } }
      );
    }

    const usuarioExcluido = await usuarioModel.findByIdAndDelete(id);
    if (!usuarioExcluido) {
      throw new ServerError(USUARIO_ERROR.USUARIO_NAO_ENCONTRADO);
    }

    return res.status(200).json({ message: "Usuário excluído com sucesso!" });
  }
}

export default new UsuarioController();
