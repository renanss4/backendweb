import mongoose, { Schema } from "mongoose";

const usuarioSchema = new Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é necessário!"],
      trim: true,
      minlength: [2, "O nome precisa ter pelo menos 2 caracteres!"],
      maxlength: [50, "O nome precisa ter no máximo 50 caracteres!"],
    },
    sobrenome: {
      type: String,
      required: [true, "O sobrenome é necessário!"],
      trim: true,
      minlength: [2, "O sobrenome precisa ter pelo menos 2 caracteres!"],
      maxlength: [50, "O sobrenome precisa ter no máximo 50 caracteres!"],
    },
    email: {
      type: String,
      required: [true, "O email é necessário!"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        // email@dominio.com
        validator: (email) =>
          /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-z]{2,})$/.test(email),
        message: (props) => `${props.value} não é um email válido!`,
      },
    },
    cpf: {
      type: String,
      required: [true, "O CPF é necessário!"],
      unique: true,
      trim: true,
      validate: {
        // xxx.xxx.xxx-xx
        validator: (cpf) => /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(cpf),
        message: (props) => `${props.value} não é um CPF válido!`,
      },
    },
    telefone: {
      type: String,
      required: [true, "O telefone é necessário!"],
      trim: true,
      validate: {
        // (xx) xxxx-xxxx ou (xx) xxxxx-xxxx
        validator: (telefone) => /\(\d{2}\)\s\d{4,5}-\d{4}/.test(telefone),
        message: (props) => `${props.value} não é um telefone válido!`,
      },
    },
    senha: {
      type: String,
      required: [true, "A senha é necessário!"],
      minlength: [6, "A senha precisa ter pelo menos 6 caracteres!"],
    },
    papel: {
      type: String,
      enum: ["admin", "usuario"],
      default: "usuario",
    },
    cep: {
      type: String,
      required: [true, "O CEP é necessário!"],
      trim: true,
      validate: {
        // xxxxx-xxx
        validator: (cep) => /\d{5}-\d{3}/.test(cep),
        message: (props) => `${props.value} não é um CEP válido!`,
      },
    },
    anuncios: [
      // FORMA 1: Atualizar o usuário vinculado
      {
        anuncio_id: {
          type: Schema.Types.ObjectId,
          ref: "Anuncios",
          required: true,
        },
      },
      // FORMA 2: Atualizar o usuário vinculado
      // OLHAR O CONTROLLER DE ANÚNCIO PARA ENTENDER
      // {
      //   type: Schema.Types.ObjectId,
      //   ref: "Anuncios",
      //   required: true,
      // },
    ],
  },
  {
    timestamps: true,
  }
);

export const usuarioModel = mongoose.model("Usuarios", usuarioSchema);
