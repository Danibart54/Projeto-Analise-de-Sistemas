import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use(config => {
  const token = sessionStorage.getItem('extensflow_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('extensflow_token')
      sessionStorage.removeItem('extensflow_session')
      window.location.href = '/'
    }
    const msg = err.response?.data?.error || err.response?.data?.message || err.message
    return Promise.reject(new Error(msg))
  }
)

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Adiciona timestamp como parâmetro para forçar requisição fresca ao servidor,
 * evitando que o browser ou proxies reutilizem respostas antigas em cache.
 */
function nocache(params = {}) {
  return { ...params, _t: Date.now() }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = async ({ email, senha }) => {
  const { data } = await client.post('/auth/login', { email, senha })
  return data
}

export const registrar = async (body) => {
  const { data } = await client.post('/auth/registro', body)
  return data
}

// ─── APOs (novo fluxo) ────────────────────────────────────────────────────────

export const getApos = async (params = {}) => {
  const { data } = await client.get('/apos', { params: nocache(params) })
  return Array.isArray(data) ? data : (data.content ?? data)
}

export const getAposPorAluno = async (alunoId) => {
  const { data } = await client.get(`/apos/aluno/${alunoId}`, { params: nocache() })
  return data
}

export const getApo = async (id) => {
  const { data } = await client.get(`/apos/${id}`, { params: nocache() })
  return data
}

export const getHistoricoApo = async (id) => {
  const { data } = await client.get(`/apos/${id}/historico`, { params: nocache() })
  return data
}

export const criarApo = async (body) => {
  const { data } = await client.post('/apos', body)
  return data
}

export const enviarApoOrientador = async (id) => {
  const { data } = await client.put(`/apos/${id}/enviar-orientador`)
  return data
}

// Orientador
export const orientadorAprovar = async (id, justificativa = '') => {
  const { data } = await client.put(`/apos/${id}/orientador/aprovar`, { justificativa })
  return data
}
export const orientadorDevolver = async (id, justificativa) => {
  const { data } = await client.put(`/apos/${id}/orientador/devolver`, { justificativa })
  return data
}
export const orientadorAbster = async (id, justificativa) => {
  const { data } = await client.put(`/apos/${id}/orientador/abster`, { justificativa })
  return data
}
export const orientadorIniciarAvaliacao = async (id) => {
  const { data } = await client.put(`/apos/${id}/orientador/iniciar-avaliacao`)
  return data
}

// Comissão Julgadora
export const comissaoAprovar = async (id, tipoApoId = null, justificativa = '') => {
  const { data } = await client.put(`/apos/${id}/comissao/aprovar`, { tipoApoId, justificativa })
  return data
}
export const comissaoDevolver = async (id, justificativa) => {
  const { data } = await client.put(`/apos/${id}/comissao/devolver`, { justificativa })
  return data
}
export const comissaoReprovar = async (id, justificativa) => {
  const { data } = await client.put(`/apos/${id}/comissao/reprovar`, { justificativa })
  return data
}
export const comissaoIniciarAvaliacao = async (id) => {
  const { data } = await client.put(`/apos/${id}/comissao/iniciar-avaliacao`)
  return data
}

// Coordenação
export const coordenacaoAprovar = async (id, tipoApoId = null, justificativa = '') => {
  const { data } = await client.put(`/apos/${id}/coordenacao/aprovar`, { tipoApoId, justificativa })
  return data
}
export const coordenacaoDevolver = async (id, justificativa) => {
  const { data } = await client.put(`/apos/${id}/coordenacao/devolver`, { justificativa })
  return data
}
export const coordenacaoReprovar = async (id, justificativa) => {
  const { data } = await client.put(`/apos/${id}/coordenacao/reprovar`, { justificativa })
  return data
}
export const coordenacaoIniciarAvaliacao = async (id) => {
  const { data } = await client.put(`/apos/${id}/coordenacao/iniciar-avaliacao`)
  return data
}

// Secretaria
export const secretariaAguardarAssinatura = async (id) => {
  const { data } = await client.put(`/apos/${id}/secretaria/aguardar-assinatura`)
  return data
}
export const secretariaAssinar = async (id) => {
  const { data } = await client.put(`/apos/${id}/secretaria/assinar`)
  return data
}
export const secretariaArquivar = async (id) => {
  const { data } = await client.put(`/apos/${id}/secretaria/arquivar`)
  return data
}
export const secretariaLancarSistema = async (id) => {
  const { data } = await client.put(`/apos/${id}/secretaria/lancar-sistema`)
  return data
}

// Créditos
export const getCreditosAlunos = async (params = {}) => {
  const { data } = await client.get('/apos/creditos/alunos', { params: nocache(params) })
  return data
}

// Tipos de APO
export const getTiposApo = async () => {
  const { data } = await client.get('/tipos-apo', { params: nocache() })
  return data
}

// Cursos
export const getCursos = async () => {
  const { data } = await client.get('/cursos', { params: nocache() })
  return data
}

// ─── Solicitações (legado — mantido para compatibilidade) ──────────────────────

/**
 * Lista solicitações sempre com cache busting — resolve o problema de dados
 * antigos serem exibidos após criar uma nova solicitação.
 */
export const getSolicitacoes = async (params = {}) => {
  const { data } = await client.get('/solicitacoes', { params: nocache(params) })
  // Backend retorna Page<T>: extrai o array .content
  return Array.isArray(data) ? data : (data.content ?? data)
}

export const getSolicitacoesPorAluno = async (alunoId) => {
  const { data } = await client.get(`/solicitacoes/aluno/${alunoId}`, {
    params: nocache()
  })
  return data
}

export const getSolicitacao = async (id) => {
  const { data } = await client.get(`/solicitacoes/${id}`, { params: nocache() })
  return data
}

/**
 * Cria uma solicitação e retorna o objeto recém-criado do backend.
 * O estado no frontend deve ser atualizado com este retorno — não confiar
 * em dados locais do formulário para evitar inconsistências.
 */
export const criarSolicitacao = async (body) => {
  const { data } = await client.post('/solicitacoes', body)
  return data  // objeto atualizado vindo do banco
}

export const enviarSolicitacao = async (id) => {
  const { data } = await client.put(`/solicitacoes/${id}/enviar`)
  return data
}

export const atualizarFormularioSolicitacao = async (id, body) => {
  const { data } = await client.put(`/solicitacoes/${id}/formulario`, body)
  return data
}

export const atualizarStatusSolicitacao = async (id, status) => {
  const { data } = await client.put(`/solicitacoes/${id}/status`, { status })
  return data
}

export const resultadoFinal = async (id, status, pontuacao) => {
  const { data } = await client.put(`/solicitacoes/${id}/resultado-final`, { status, pontuacao })
  return data
}

// ─── Votação dos coordenadores ─────────────────────────────────────────────────

/** Coordenador vota APROVADO ou RECUSADO em uma solicitação. */
export const votarSolicitacao = async (solicitacaoId, voto) => {
  const { data } = await client.post(`/solicitacoes/${solicitacaoId}/votar`, { voto })
  return data
}

/** Compat retroativa — envia voto APROVADO */
export const aprovarSolicitacao = async (solicitacaoId) =>
  votarSolicitacao(solicitacaoId, 'APROVADO')

export const getAprovacoes = async (solicitacaoId) => {
  const { data } = await client.get(`/solicitacoes/${solicitacaoId}/aprovacoes`, {
    params: nocache()
  })
  return data
}

export const contarAprovacoes = async (solicitacaoId) => {
  const { data } = await client.get(`/solicitacoes/${solicitacaoId}/aprovacoes/count`, {
    params: nocache()
  })
  return data
}

// ─── Aval final da comissão julgadora ─────────────────────────────────────────

export const darAvalFinal = async (solicitacaoId, aprovado, justificativa = '') => {
  const { data } = await client.put(`/solicitacoes/${solicitacaoId}/aval-final`, {
    aprovado, justificativa
  })
  return data
}

// ─── Usuários legados ─────────────────────────────────────────────────────────

export const listarAlunos = async () => {
  const { data } = await client.get('/usuarios/alunos', { params: nocache() })
  return data
}

export const listarOrientadores = async () => {
  const { data } = await client.get('/usuarios/orientadores', { params: nocache() })
  return data
}

export const listarMembros = async () => {
  const { data } = await client.get('/usuarios/membros-comissao', { params: nocache() })
  return data
}

export const cadastrarUsuarioAdmin = async (body) => {
  const { data } = await client.post('/usuarios/admin', body)
  return data
}

// ─── Usuários V2 (múltiplas funções) ─────────────────────────────────────────

export const listarUsuariosV2 = async (apenasAtivos = true) => {
  const { data } = await client.get('/v2/usuarios', {
    params: nocache({ apenasAtivos })
  })
  return data
}

export const listarPorFuncao = async (nomeFuncao) => {
  const { data } = await client.get(`/v2/usuarios/funcao/${nomeFuncao}`, {
    params: nocache()
  })
  return data
}

export const cadastrarUsuarioV2 = async (body) => {
  const { data } = await client.post('/v2/usuarios', body)
  return data
}

export const atualizarUsuarioV2 = async (id, body) => {
  const { data } = await client.put(`/v2/usuarios/${id}`, body)
  return data
}

export const desativarUsuarioV2 = async (id) => {
  await client.delete(`/v2/usuarios/${id}`)
}

// ─── Avaliações ───────────────────────────────────────────────────────────────

export const getAvaliacoes = async (params = {}) => {
  const { data } = await client.get('/avaliacoes/avaliador/minhas', {
    params: nocache(params)
  })
  return data
}

export const registrarAvaliacao = async (solicitacaoId, body) => {
  const { data } = await client.post(`/avaliacoes/solicitacao/${solicitacaoId}`, body)
  return data
}

// ─── Notificações ─────────────────────────────────────────────────────────────

export const getNotificacoes = async () => {
  const { data } = await client.get('/notificacoes/minhas', { params: nocache() })
  return data
}

export const marcarLida = async (id) => {
  const { data } = await client.put(`/notificacoes/${id}/lida`)
  return data
}

// ─── Etapas ───────────────────────────────────────────────────────────────────

export const getEtapas = async () => {
  const { data } = await client.get('/etapas', { params: nocache() })
  return data
}

export const criarEtapa = async (body) => {
  const { data } = await client.post('/etapas', body)
  return data
}

export const encerrarEtapa = async (id) => {
  const { data } = await client.put(`/etapas/${id}/encerrar`)
  return data
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export const gerarDocumento = async (solicitacaoId, tipo) => {
  const { data } = await client.post(`/documentos/solicitacao/${solicitacaoId}`, { tipo })
  return data
}

export const assinarDocumento = async (id) => {
  const { data } = await client.put(`/documentos/${id}/assinar`)
  return data
}

// ─── Objeto api (compatibilidade retroativa) ──────────────────────────────────

export const api = {
  login,
  getSolicitacoes,
  criarSolicitacao,
  enviarSolicitacao,
  atualizarStatus: atualizarStatusSolicitacao,
  resultadoFinal,
  aprovarSolicitacao,
  getAprovacoes,
  getAvaliacoes,
  registrarAvaliacao,
  getUsuarios: async () => {
    const [alunos, orientadores, membros] = await Promise.all([
      listarAlunos(), listarOrientadores(), listarMembros()
    ])
    return [...alunos, ...orientadores, ...membros]
  },
  cadastrar: cadastrarUsuarioAdmin,
  desativarUsuario: desativarUsuarioV2,
  getNotificacoes,
  marcarLida,
  getEtapas,
  criarEtapa,
  encerrarEtapa,
  gerarDocumento,
  assinarDocumento,
}

export default client

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminListarUsuarios = async () => {
  const { data } = await client.get('/admin/usuarios', { params: nocache() })
  return data
}

export const adminBuscarUsuario = async (id) => {
  const { data } = await client.get(`/admin/usuarios/${id}`, { params: nocache() })
  return data
}

export const adminCriarUsuario = async (body) => {
  const { data } = await client.post('/admin/usuarios', body)
  return data
}

export const adminAtualizarUsuario = async (id, body) => {
  const { data } = await client.put(`/admin/usuarios/${id}`, body)
  return data
}

export const adminAtribuirFuncoes = async (id, funcoesOuBody, isAdmin) => {
  // Aceita tanto adminAtribuirFuncoes(id, { funcoes, admin }) quanto
  // adminAtribuirFuncoes(id, ['COORDENADOR'], true)
  let body
  if (funcoesOuBody && typeof funcoesOuBody === 'object' && !Array.isArray(funcoesOuBody)) {
    body = funcoesOuBody  // já é { funcoes, admin }
  } else {
    body = { funcoes: funcoesOuBody }
    if (isAdmin !== undefined) body.admin = isAdmin
  }
  const { data } = await client.patch(`/admin/usuarios/${id}/funcoes`, body)
  return data
}

export const adminDesativarUsuario = async (id) => {
  await client.delete(`/admin/usuarios/${id}`)
}

export const adminReativarUsuario = async (id) => {
  const { data } = await client.put(`/admin/usuarios/${id}/reativar`)
  return data
}
