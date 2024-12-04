import ServerError from "../ServerError.js";
import { USUARIO_ERROR } from "../constants/errorCodes.js";

export function validateId(id) {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ServerError(USUARIO_ERROR.ID_INVALIDO);
  }
}
