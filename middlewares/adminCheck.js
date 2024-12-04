import ServerError from "../ServerError.js";
import { TOKEN_ERROR } from "../constants/errorCodes.js";

export const adminCheck = (req, res, next) => {
  // console.log(req.usuarioPapel);
  if (req.usuarioPapel !== "admin") {
    throw new ServerError(TOKEN_ERROR.ACESSO_NEGADO);
  }
  next();
};
