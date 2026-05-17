import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use(config => {
  const token = sessionStorage.getItem('ef_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('ef_token')
      localStorage.removeItem('ef_user')
      window.location.href = '/'
    }
    const msg = err.response?.data?.error || err.response?.data?.message || err.message
    return Promise.reject(new Error(msg))
  }
)

// Objeto api com métodos — compatível com as páginas do projeto
export const api = {

  // Auth
  login: async ({ email, senha }) => {
    const { data } = await client.post('/auth/login', { email, senha })
    if (data.token) sessionStorage.setItem('ef_token', data.token)
    return data
  },

  // Solicitações
  getSolicitacoes: async (params = {}) => {
    const { data } = await client.get('/solicitacoes', { params })
    return data
  },
  criarSolicitacao: async (body) => {
    const { data } = await client.post('/solicitacoes', body)
    return data
  },
  enviarSolicitacao: async (id) => {
    const { data } = await client.put(`/solicitacoes/${id}/enviar`)
    return data
  },
  atualizarStatus: async (id, status) => {
    const { data } = await client.put(`/solicitacoes/${id}/status`, { status })
    return data
  },
  resultadoFinal: async (id, status, pontuacao) => {
    const { data } = await client.put(`/solicitacoes/${id}/resultado-final`, { status, pontuacao })
    return data
  },

  // Avaliações
  getAvaliacoes: async (params = {}) => {
    const { data } = await client.get('/avaliacoes/avaliador/minhas', { params })
    return data
  },
  registrarAvaliacao: async (solicitacaoId, body) => {
    const { data } = await client.post(`/avaliacoes/solicitacao/${solicitacaoId}`, body)
    return data
  },

  // Usuários
  getUsuarios: async () => {
    const [alunos, orientadores, membros] = await Promise.all([
      client.get('/usuarios/alunos').then(r => r.data),
      client.get('/usuarios/orientadores').then(r => r.data),
      client.get('/usuarios/membros-comissao').then(r => r.data),
    ])
    return [...alunos, ...orientadores, ...membros]
  },
  cadastrar: async (body) => {
    const tipo = body.perfil === 'ALUNO' ? 'aluno'
               : body.perfil === 'ORIENTADOR' ? 'orientador'
               : 'membro_comissao'
    const endpoint = body.perfil === 'ALUNO' ? '/usuarios/registro' : '/usuarios/admin'
    const { data } = await client.post(endpoint, { ...body, tipo })
    return data
  },
  desativarUsuario: async (id) => {
    const { data } = await client.delete(`/usuarios/${id}`)
    return data
  },

  // Notificações
  getNotificacoes: async () => {
    const { data } = await client.get('/notificacoes/minhas')
    return data
  },
  marcarLida: async (id) => {
    const { data } = await client.put(`/notificacoes/${id}/lida`)
    return data
  },

  // Etapas
  getEtapas: async () => {
    const { data } = await client.get('/etapas')
    return data
  },
  criarEtapa: async (body) => {
    const { data } = await client.post('/etapas', body)
    return data
  },
  encerrarEtapa: async (id) => {
    const { data } = await client.put(`/etapas/${id}/encerrar`)
    return data
  },

  // Documentos
  gerarDocumento: async (solicitacaoId, tipo) => {
    const { data } = await client.post(`/documentos/solicitacao/${solicitacaoId}`, { tipo })
    return data
  },
  assinarDocumento: async (id) => {
    const { data } = await client.put(`/documentos/${id}/assinar`)
    return data
  },
}

export default client
