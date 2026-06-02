package com.extensflow.service;

import com.extensflow.dto.FormularioRequest;
import com.extensflow.dto.SolicitacaoRequest;
import com.extensflow.dto.SolicitacaoResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.*;
import com.extensflow.repository.*;
import com.extensflow.security.UsuarioPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SolicitacaoService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");
    private static final int APROVACOES_NECESSARIAS = 3;

    @Autowired private SolicitacaoRepository       solicitacaoRepo;
    @Autowired private AlunoRepository             alunoRepo;
    @Autowired private UsuarioRepository           usuarioRepo;
    @Autowired private UsuarioV2Repository         usuarioV2Repo;
    @Autowired private AprovacaoSolicitacaoRepository aprovacaoRepo;
    @Autowired private TipoApoRepository           tipoApoRepo;
    @Autowired private HistoricoApoRepository      historicoRepo;

    // ── Criação (legado) ──────────────────────────────────────────────────────

    @Transactional
    public SolicitacaoResponse criar(SolicitacaoRequest req, UsuarioPrincipal principal) {
        if (!principal.id().equals(req.getAlunoId()))
            throw new AccessDeniedException("Você só pode criar APOs para sua própria conta");

        Aluno aluno = alunoRepo.findById(req.getAlunoId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado"));

        Solicitacao sol = new Solicitacao();
        sol.setTitulo(req.getTitulo());
        sol.setDescricao(req.getDescricao());
        sol.setAluno(aluno);
        sol.setStatus(StatusSolicitacao.EM_PREENCHIMENTO);

        if (req.getFormulario() != null) sol.setFormulario(mapFormulario(req.getFormulario()));

        Solicitacao salva = solicitacaoRepo.save(sol);
        audit.info("APO_CRIADA id={} aluno={}", salva.getId(), principal.email());
        return toResponse(salva);
    }

    // ── Criação APO (novo fluxo) ──────────────────────────────────────────────

    @Transactional
    public SolicitacaoResponse criarApo(SolicitacaoRequest req, UsuarioPrincipal principal) {
        Aluno aluno = alunoRepo.findById(req.getAlunoId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado"));

        Solicitacao sol = new Solicitacao();
        sol.setTitulo(req.getTitulo());
        sol.setDescricao(req.getDescricao());
        sol.setAluno(aluno);
        sol.setStatus(StatusSolicitacao.RASCUNHO);
        sol.setResponsavelAtual("ALUNO");

        if (req.getTipoApoId() != null) {
            sol.setTipoApoId(req.getTipoApoId());
            tipoApoRepo.findById(req.getTipoApoId()).ifPresent(t -> {
                sol.setNomeTipoApo(t.getNome());
                if (req.getCreditosPrevistos() == null) sol.setCreditosPrevistos(t.getCreditos());
            });
        }
        if (req.getCreditosPrevistos() != null) sol.setCreditosPrevistos(req.getCreditosPrevistos());

        if (req.getOrientadorId() != null) {
            sol.setOrientadorId(req.getOrientadorId());
            usuarioV2Repo.findById(req.getOrientadorId())
                    .ifPresent(u -> sol.setNomeOrientador(u.getNome()));
        }

        if (req.getFormulario() != null) sol.setFormulario(mapFormulario(req.getFormulario()));

        Solicitacao salva = solicitacaoRepo.save(sol);
        registrarHistorico(salva, principal, "CRIADA", null, StatusSolicitacao.RASCUNHO, null);
        audit.info("APO_CRIADA id={} por={}", salva.getId(), principal.email());
        return toResponse(salva);
    }

    // ── Listagens ──────────────────────────────────────────────────────────────

    public List<SolicitacaoResponse> listarTodas() {
        return solicitacaoRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<SolicitacaoResponse> listarTodasPaginado(Pageable pageable) {
        return solicitacaoRepo.findAll(pageable).map(this::toResponse);
    }

    public Page<SolicitacaoResponse> listarPorStatusPaginado(String status, Pageable pageable) {
        Page<Solicitacao> page = solicitacaoRepo.findByStatus(parseStatus(status), pageable);
        return page.map(this::toResponse);
    }

    public Page<SolicitacaoResponse> listarPorOrientador(Long orientadorId, Pageable pageable) {
        List<Solicitacao> todos = solicitacaoRepo.findAll().stream()
                .filter(s -> orientadorId.equals(s.getOrientadorId()))
                .collect(Collectors.toList());
        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), todos.size());
        List<Solicitacao> sub = start > todos.size() ? List.of() : todos.subList(start, end);
        return new PageImpl<>(sub.stream().map(this::toResponse).collect(Collectors.toList()), pageable, todos.size());
    }

    public List<SolicitacaoResponse> listarPorAluno(Long alunoId, UsuarioPrincipal principal) {
        if (!principal.id().equals(alunoId))
            throw new AccessDeniedException("Acesso negado");
        return solicitacaoRepo.findByAlunoId(alunoId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<SolicitacaoResponse> listarPorAlunoV2(Long alunoId, UsuarioPrincipal principal) {
        return solicitacaoRepo.findByAlunoId(alunoId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public SolicitacaoResponse buscarPorId(Long id, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        verificarAcesso(sol, principal);
        return toResponse(sol);
    }

    // ── Edição ─────────────────────────────────────────────────────────────────

    @Transactional
    public SolicitacaoResponse atualizarFormulario(Long id, FormularioRequest req,
                                                    UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        verificarDono(sol, principal);
        boolean podeEditar = sol.getStatus() == StatusSolicitacao.EM_PREENCHIMENTO
                || sol.getStatus() == StatusSolicitacao.RASCUNHO
                || sol.getStatus() == StatusSolicitacao.DEVOLVIDA_ALUNO;
        if (!podeEditar)
            throw new BusinessException("APO só pode ser editada em rascunho ou quando devolvida ao aluno");
        sol.setFormulario(mapFormulario(req));
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse enviarParaAnalise(Long id, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        verificarDono(sol, principal);
        if (sol.getFormulario() == null)
            throw new BusinessException("Formulário obrigatório antes de enviar");
        sol.getStatus().validarTransicao(StatusSolicitacao.ENVIADA_PARA_ANALISE);
        sol.setStatus(StatusSolicitacao.ENVIADA_PARA_ANALISE);
        sol.setDataEnvio(LocalDateTime.now());
        audit.info("APO_ENVIADA id={} por={}", id, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse atualizarStatus(Long id, String novoStatus,
                                                UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        StatusSolicitacao destino = parseStatus(novoStatus);
        sol.getStatus().validarTransicao(destino);
        StatusSolicitacao anterior = sol.getStatus();
        sol.setStatus(destino);
        audit.info("STATUS_CHANGE id={} de={} para={} por={}", id, anterior, destino, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse definirResultadoFinal(Long id, String status,
                                                      Double pontuacao,
                                                      UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        StatusSolicitacao destino = parseStatus(status);
        boolean statusValido = destino == StatusSolicitacao.APROVADA_FINAL
                || destino == StatusSolicitacao.RECUSADA_FINAL
                || destino == StatusSolicitacao.APROVADA
                || destino == StatusSolicitacao.REPROVADA;
        if (!statusValido)
            throw new BusinessException("Resultado final deve ser APROVADA_FINAL ou RECUSADA_FINAL");
        sol.getStatus().validarTransicao(destino);
        sol.setStatus(destino);
        sol.setPontuacaoTotal(pontuacao);
        audit.info("RESULTADO_FINAL id={} para={} pontuacao={} por={}", id, destino, pontuacao, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse darAvalFinal(Long id, boolean aprovado,
                                             String justificativa,
                                             UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        if (!sol.getStatus().aguardandoComissao())
            throw new BusinessException("Aval final só é possível quando aguardando comissão. Status: " + sol.getStatus().name());
        StatusSolicitacao destino = aprovado ? StatusSolicitacao.APROVADA_FINAL : StatusSolicitacao.RECUSADA_FINAL;
        sol.getStatus().validarTransicao(destino);
        sol.setStatus(destino);
        audit.info("AVAL_FINAL id={} resultado={} por={}", id, destino, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    // ── Fluxo APO ──────────────────────────────────────────────────────────────

    @Transactional
    public SolicitacaoResponse transicionarStatus(Long id, StatusSolicitacao destino,
                                                   UsuarioPrincipal principal,
                                                   String acao, String justificativa) {
        Solicitacao sol = findById(id);
        StatusSolicitacao anterior = sol.getStatus();
        anterior.validarTransicao(destino);
        sol.setStatus(destino);
        if (justificativa != null) sol.setJustificativaAtual(justificativa);
        atualizarResponsavel(sol, destino);
        if (destino == StatusSolicitacao.ENVIADA_ORIENTADOR) sol.setDataEnvio(LocalDateTime.now());
        registrarHistorico(sol, principal, acao, anterior, destino, justificativa);
        audit.info("APO_FLUXO id={} acao={} de={} para={} por={}", id, acao, anterior, destino, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse comissaoAprovar(Long id, Long novoTipoApoId,
                                                String justificativa, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        if (novoTipoApoId != null) {
            sol.setTipoApoId(novoTipoApoId);
            tipoApoRepo.findById(novoTipoApoId).ifPresent(t -> {
                sol.setNomeTipoApo(t.getNome());
                sol.setCreditosAprovados(t.getCreditos());
            });
        }
        return transicionarStatus(id, StatusSolicitacao.APROVADA_COMISSAO, principal, "APROVADA_COMISSAO", justificativa);
    }

    @Transactional
    public SolicitacaoResponse coordenacaoAprovar(Long id, Long novoTipoApoId,
                                                   String justificativa, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        if (novoTipoApoId != null) {
            sol.setTipoApoId(novoTipoApoId);
            tipoApoRepo.findById(novoTipoApoId).ifPresent(t -> {
                sol.setNomeTipoApo(t.getNome());
                sol.setCreditosAprovados(t.getCreditos());
            });
        }
        return transicionarStatus(id, StatusSolicitacao.APROVADA_COORDENACAO, principal, "APROVADA_COORDENACAO", justificativa);
    }

    @Transactional
    public SolicitacaoResponse lancarNoSistema(Long id, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        if (sol.getStatus() != StatusSolicitacao.ARQUIVADA)
            throw new BusinessException("APO precisa estar arquivada antes de ser lançada no sistema");

        // Verifica se o aluno completou os créditos necessários
        Long alunoId = sol.getAluno() != null ? sol.getAluno().getId() : null;
        if (alunoId != null) {
            int totalCreditos = calcularCreditosAprovados(alunoId);
            // Creditos aprovados incluem esta APO (status = ARQUIVADA com creditos_aprovados)
        }

        SolicitacaoResponse resp = transicionarStatus(id, StatusSolicitacao.LANCADA_SISTEMA, principal, "LANCADA_SISTEMA", null);
        // Atualiza créditos do aluno na tabela usuarios_v2
        if (sol.getAluno() != null) {
            atualizarCreditosAluno(sol.getAluno().getId());
        }
        return resp;
    }

    // ── Créditos ───────────────────────────────────────────────────────────────

    public int calcularCreditosAprovados(Long alunoId) {
        return solicitacaoRepo.findByAlunoId(alunoId).stream()
                .filter(s -> s.getStatus() == StatusSolicitacao.LANCADA_SISTEMA
                          || s.getStatus() == StatusSolicitacao.FINALIZADA
                          || s.getStatus() == StatusSolicitacao.ARQUIVADA
                          || s.getStatus() == StatusSolicitacao.APROVADA_FINAL
                          || s.getStatus() == StatusSolicitacao.APROVADA)
                .mapToInt(s -> s.getCreditosAprovados() != null ? s.getCreditosAprovados() : 0)
                .sum();
    }

    public List<Map<String, Object>> resumoCreditosAlunos(String tipoAluno, Long orientadorId) {
        List<Map<String, Object>> resultado = new ArrayList<>();
        usuarioV2Repo.findAll().stream()
                .filter(u -> u.temFuncao("ALUNO"))
                .filter(u -> tipoAluno == null || tipoAluno.equalsIgnoreCase(u.getTipoAluno()))
                .filter(u -> orientadorId == null || orientadorId.equals(u.getOrientadorVinculadoId()))
                .forEach(u -> {
                    int creditosNecessarios = calcularCreditosNecessarios(u.getTipoAluno());
                    int creditosAcumulados  = u.getCreditosAprovados() != null ? u.getCreditosAprovados() : 0;
                    Map<String, Object> item = new HashMap<>();
                    item.put("id",                 u.getId());
                    item.put("nome",               u.getNome());
                    item.put("email",              u.getEmail());
                    item.put("matricula",          u.getMatricula());
                    item.put("curso",              u.getCurso());
                    item.put("tipoAluno",          u.getTipoAluno());
                    item.put("orientadorId",       u.getOrientadorVinculadoId());
                    item.put("creditosAprovados",  creditosAcumulados);
                    item.put("creditosNecessarios",creditosNecessarios);
                    item.put("completo",           creditosAcumulados >= creditosNecessarios);
                    resultado.add(item);
                });
        return resultado;
    }

    private int calcularCreditosNecessarios(String tipoAluno) {
        if ("DOUTORADO".equalsIgnoreCase(tipoAluno)) return 24;
        if ("MESTRADO".equalsIgnoreCase(tipoAluno))  return 12;
        return 0;
    }

    private void atualizarCreditosAluno(Long alunoId) {
        // Tenta encontrar no UsuarioV2 pelo mesmo ID (se migrado)
        usuarioV2Repo.findById(alunoId).ifPresent(u -> {
            int total = calcularCreditosAprovados(alunoId);
            u.setCreditosAprovados(total);
            usuarioV2Repo.save(u);
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void atualizarResponsavel(Solicitacao sol, StatusSolicitacao status) {
        String resp = switch (status) {
            case RASCUNHO, DEVOLVIDA_ALUNO -> "ALUNO";
            case ENVIADA_ORIENTADOR, EM_AVALIACAO_ORIENTADOR -> "ORIENTADOR";
            case ENVIADA_COMISSAO, EM_AVALIACAO_COMISSAO -> "COMISSAO";
            case ABSTENCAO_ORIENTADOR, ENVIADA_COORDENACAO, EM_AVALIACAO_COORDENACAO -> "COORDENACAO";
            case APROVADA_COORDENACAO, ENVIADA_SECRETARIA, AGUARDANDO_ASSINATURA, ASSINADA, ARQUIVADA -> "SECRETARIA";
            default -> sol.getResponsavelAtual();
        };
        sol.setResponsavelAtual(resp);
    }

    private void registrarHistorico(Solicitacao sol, UsuarioPrincipal principal,
                                     String acao, StatusSolicitacao anterior,
                                     StatusSolicitacao novo, String justificativa) {
        HistoricoApo h = new HistoricoApo();
        h.setSolicitacao(sol);
        h.setUsuarioId(principal.id());
        h.setNomeUsuario(principal.email());
        h.setPerfilUsuario(principal.role());
        h.setAcao(acao);
        h.setStatusAnterior(anterior != null ? anterior.name() : null);
        h.setStatusNovo(novo != null ? novo.name() : null);
        h.setJustificativa(justificativa);
        h.setData(LocalDateTime.now());
        historicoRepo.save(h);
    }

    private void verificarAcesso(Solicitacao sol, UsuarioPrincipal principal) {
        if (principal.admin()) return;
        boolean ehDono = sol.getAluno() != null && sol.getAluno().getId().equals(principal.id());
        boolean podeVer = principal.role().equals("ORIENTADOR") || principal.role().equals("COMISSAO")
                || principal.role().equals("SECRETARIA") || principal.role().equals("COORDENADORIA")
                || principal.role().equals("COORDENACAO") || principal.role().equals("ADMIN");
        if (!ehDono && !podeVer)
            throw new AccessDeniedException("Acesso negado a esta APO");
    }

    private void verificarDono(Solicitacao sol, UsuarioPrincipal principal) {
        if (sol.getAluno() == null || !sol.getAluno().getId().equals(principal.id()))
            throw new AccessDeniedException("Apenas o dono pode executar esta ação");
    }

    public List<SolicitacaoResponse> listarPorStatus(String status) {
        return solicitacaoRepo.findByStatus(parseStatus(status))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private Solicitacao findById(Long id) {
        return solicitacaoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("APO #" + id + " não encontrada"));
    }

    private StatusSolicitacao parseStatus(String status) {
        try {
            return StatusSolicitacao.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + status);
        }
    }

    private Formulario mapFormulario(FormularioRequest req) {
        Formulario f = new Formulario();
        f.setTitulo(req.getTitulo());
        f.setDescricao(req.getDescricao());
        f.setObjetivos(req.getObjetivos());
        f.setMetodologia(req.getMetodologia());
        f.setResultadosEsperados(req.getResultadosEsperados());
        f.setPublicoAlvo(req.getPublicoAlvo());
        return f;
    }

    public SolicitacaoResponse toResponse(Solicitacao s) {
        SolicitacaoResponse r = new SolicitacaoResponse();
        r.setId(s.getId());
        r.setTitulo(s.getTitulo());
        r.setDescricao(s.getDescricao());
        r.setStatus(s.getStatus());
        r.setDataEnvio(s.getDataEnvio());
        r.setDataAtividade(s.getDataAtividade());
        r.setDataCriacao(s.getDataCriacao());
        r.setDataAtualizacao(s.getDataAtualizacao());
        r.setPontuacaoTotal(s.getPontuacaoTotal());
        r.setCreditosPrevistos(s.getCreditosPrevistos());
        r.setCreditosAprovados(s.getCreditosAprovados());
        r.setTipoApoId(s.getTipoApoId());
        r.setNomeTipoApo(s.getNomeTipoApo());
        r.setResponsavelAtual(s.getResponsavelAtual());
        r.setJustificativaAtual(s.getJustificativaAtual());
        r.setOrientadorId(s.getOrientadorId());
        r.setNomeOrientador(s.getNomeOrientador());
        r.setTemFormulario(s.getFormulario() != null);
        if (s.getAluno() != null) {
            r.setNomeAluno(s.getAluno().getNome());
            r.setAlunoId(s.getAluno().getId());
        }
        long total = aprovacaoRepo.countBySolicitacaoId(s.getId());
        r.setTotalAprovacoes((int) total);
        r.setAprovacoesRestantes(Math.max(0, APROVACOES_NECESSARIAS - (int) total));
        return r;
    }
}
