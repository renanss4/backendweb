import mongoose, { Schema } from "mongoose";

const categoriaSchema = new Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é necessário!"],
      trim: true,
      minlength: [2, "O nome precisa ter pelo menos 2 caracteres!"],
      maxlength: [50, "O nome precisa ter no máximo 50 caracteres!"],
    },
    descricao: {
      type: String,
      required: [true, "A descrição é necessária!"],
      trim: true,
      minlength: [2, "A descrição precisa ter pelo menos 2 caracteres!"],
      maxlength: [100, "A descrição precisa ter no máximo 100 caracteres!"],
    },
    anuncios: [
      {
        anuncio_id: {
          type: Schema.Types.ObjectId,
          ref: "Anuncios",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const categoriaModel = mongoose.model("Categorias", categoriaSchema);
