import mongoose from "mongoose";
import ServerError from "../ServerError.js";

export function errorHandler(error, req, res, next) {
  if (error instanceof mongoose.Error.ValidationError) {
    console.log("Erro de Validação:", error);
    return res.status(400).send({
      error: true,
      type: "ValidationError",
      message: error.message,
    });
  }

  if (error.code === 11000) {
    console.log("Duplicate Key Error:", error);
    return res.status(400).send({
      error: true,
      type: "DuplicateKeyError",
      message: error.message,
    });
  }

  if (error instanceof ServerError) {
    console.log("Server Error:", error);
    return res.status(error.statusCode).send({
      error: true,
      type: "ServerError",
      message: error.message,
    });
  }

  console.log("Erro interno no Servidor:", error);
  return res.status(500).send({
    message: error.message,
  });
}
