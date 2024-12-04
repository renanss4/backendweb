export const USUARIO_ERROR = {
  USUARIO_NAO_ENCONTRADO: {
    statusCode: 404,
    message: "Usuário não encontrado",
  },
  USUARIO_JA_EXISTE: {
    statusCode: 400,
    message: "Usuário já existe",
  },
  CAMPOS_NAO_PREENCHIDOS: {
    statusCode: 422,
    message: "Os campos não foram preenchidos corretamente",
  },
  LOGIN_INVALIDO: {
    statusCode: 401,
    message: "Login inválido",
  },
  USUARIO_SEM_ANUNCIOS: {
    statusCode: 404,
    message: "Usuário não possui anúncios",
  },
  SENHA_NAO_PODE_SER_ATUALIZADA: {
    statusCode: 400,
    message: "A senha não pode ser atualizada por essa rota",
  },
  SENHA_INCORRETA: {
    statusCode: 400,
    message: "Senha incorreta",
  },
};

export const ANUNCIO_ERROR = {
  ANUNCIO_NAO_ENCONTRADO: {
    statusCode: 404,
    message: "Anúncio não encontrado",
  },
  ANUNCIO_JA_EXISTE: {
    statusCode: 400,
    message: "Anúncio já existe",
  },
  USUARIO_NAO_AUTORIZADO: {
    statusCode: 403,
    message: "Usuário não autorizado",
  },
  ANUNCIO_JA_EXISTE_PARA_USUARIO: {
    statusCode: 400,
    message: "Anúncio já existe para esse usuário",
  },
  DATA_EXPIRACAO_INVALIDA: {
    statusCode: 400,
    message: "Data de expiração inválida",
  },
  USUARIOS_COMPARTILHADOS_NAO_INFORMADOS: {
    statusCode: 400,
    message: "Usuários compartilhados não informados",
  },
  ANUNCIOS_NAO_ENCONTRADOS: {
    statusCode: 404,
    message: "Anúncios não encontrados",
  },
  VISIBILIDADE_NAO_FORNECIDA: {
    statusCode: 400,
    message: "Visibilidade não fornecida",
  },
  VISIBILIDADE_INVALIDA: {
    statusCode: 400,
    message: "Visibilidade inválida",
  },
};

export const CATEGORIA_ERROR = {
  CATEGORIA_NAO_ENCONTRADA: {
    statusCode: 404,
    message: "Categoria não encontrada",
  },
  CATEGORIA_JA_EXISTE: {
    statusCode: 400,
    message: "Categoria já existe",
  },
  CAMPOS_NAO_PREENCHIDOS: {
    statusCode: 422,
    message: "Os campos não foram preenchidos corretamente",
  },
  CATEGORIA_SEM_ANUNCIOS: {
    statusCode: 404,
    message: "Categoria não possui anúncios",
  },
};

export const TOKEN_ERROR = {
  TOKEN_NAO_ENVIADO: {
    statusCode: 401,
    message: "Token não enviado",
  },
  ACESSO_NEGADO: {
    statusCode: 403,
    message: "Acesso negado",
  },
};
