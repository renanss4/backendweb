import ServerError from "../ServerError.js";
import { TOKEN_ERROR } from "../constants/errorCodes.js";
import jwt from "jsonwebtoken";

// Middleware to check the token sent by the user
export function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new ServerError(TOKEN_ERROR.TOKEN_NAO_ENVIADO);
  }

  const secret = process.env.JWT_SECRET;
  jwt.verify(token, secret, (error, payload) => {
    if (error) {
      throw new ServerError(TOKEN_ERROR.ACESSO_NEGADO);
    }
    req.usuarioId = payload.id;
    req.usuarioPapel = payload.papel;
    // console.log("Payload: ", payload);
    next();
  });
}
