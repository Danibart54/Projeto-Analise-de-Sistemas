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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolicitacaoService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private SolicitacaoRepository solicitacaoRepo;
    @Autowired private AlunoRepository alunoRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // ── Criação ──────────────────────────────────────────────────────────────

    @Transactional
    public SolicitacaoResponse criar(SolicitacaoRequest req, UsuarioPrincipal principal) {
        // V-05: aluno só pode criar solicitação para si mesmo
        if (!principal.id().equals(req.getAlunoId()))
            throw new AccessDeniedException("Você só pode criar solicitações para sua própria conta");

        Aluno aluno = alunoRepo.findById(req.getAlunoId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado"));

        Solicitacao sol = new Solicitacao();
        sol.setTitulo(req.getTitulo());
        sol.setDescricao(req.getDescricao());
        sol.setAluno(aluno);
        sol.setStatus(StatusSolicitacao.EM_PREENCHIMENTO);

        if (req.getFormulario() != null) {
            sol.setFormulario(mapFormulario(req.getFormulario()));
        }

        Solicitacao salva = solicitacaoRepo.save(sol);
        audit.info("SOLICITACAO_CRIADA id={} aluno={}", salva.getId(), principal.email());
        return toResponse(salva);
    }

    // ── Listagens ─────────────────────────────────────────────────────────────

    public List<SolicitacaoResponse> listarTodas() {
        return solicitacaoRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    // V-05: Aluno só vê suas próprias solicitações
    public List<SolicitacaoResponse> listarPorAluno(Long alunoId, UsuarioPrincipal principal) {
        if (!principal.id().equals(alunoId))
            throw new AccessDeniedException("Acesso negado");
        return solicitacaoRepo.findByAlunoId(alunoId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    // V-05: Verificação de propriedade no detalhe
    public SolicitacaoResponse buscarPorId(Long id, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        verificarAcesso(sol, principal);
        return toResponse(sol);
    }

    // ── Edição ───────────────────────────────────────────────────────────────

    @Transactional
    public SolicitacaoResponse atualizarFormulario(Long id, FormularioRequest req,
                                                   UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        verificarDono(sol, principal); // só o dono edita
        if (sol.getStatus() != StatusSolicitacao.EM_PREENCHIMENTO)
            throw new BusinessException("Só é possível editar solicitações em preenchimento");
        sol.setFormulario(mapFormulario(req));
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse enviarParaAnalise(Long id, UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        verificarDono(sol, principal); // só o dono envia
        if (sol.getFormulario() == null)
            throw new BusinessException("Formulário obrigatório antes de enviar");

        // V-09: máquina de estados
        sol.getStatus().validarTransicao(StatusSolicitacao.ENVIADA_PARA_ANALISE);
        sol.setStatus(StatusSolicitacao.ENVIADA_PARA_ANALISE);
        sol.setDataEnvio(LocalDateTime.now());

        audit.info("SOLICITACAO_ENVIADA id={} por={}", id, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    @Transactional
    public SolicitacaoResponse atualizarStatus(Long id, String novoStatus,
                                               UsuarioPrincipal principal) {
        Solicitacao sol = findById(id);
        StatusSolicitacao destino = parseStatus(novoStatus);

        // V-09: valida transição antes de aplicar
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

        // V-09: apenas APROVADA ou REPROVADA são destinos válidos aqui
        if (destino != StatusSolicitacao.APROVADA && destino != StatusSolicitacao.REPROVADA)
            throw new BusinessException("Resultado final deve ser APROVADA ou REPROVADA");

        sol.getStatus().validarTransicao(destino);
        StatusSolicitacao anterior = sol.getStatus();
        sol.setStatus(destino);
        sol.setPontuacaoTotal(pontuacao);

        audit.info("RESULTADO_FINAL id={} de={} para={} pontuacao={} por={}",
                id, anterior, destino, pontuacao, principal.email());
        return toResponse(solicitacaoRepo.save(sol));
    }

    public List<SolicitacaoResponse> listarPorStatus(String status) {
        return solicitacaoRepo.findByStatus(parseStatus(status))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void verificarAcesso(Solicitacao sol, UsuarioPrincipal principal) {
        boolean ehDono = sol.getAluno() != null &&
                sol.getAluno().getId().equals(principal.id());
        boolean podeVer = principal.role().equals("ORIENTADOR") ||
                principal.role().equals("COMISSAO") ||
                principal.role().equals("SECRETARIA") ||
                principal.role().equals("COORDENADORIA");
        if (!ehDono && !podeVer)
            throw new AccessDeniedException("Acesso negado a esta solicitação");
    }

    private void verificarDono(Solicitacao sol, UsuarioPrincipal principal) {
        if (sol.getAluno() == null || !sol.getAluno().getId().equals(principal.id()))
            throw new AccessDeniedException("Apenas o dono pode executar esta ação");
    }

    private Solicitacao findById(Long id) {
        return solicitacaoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação #" + id + " não encontrada"));
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
        return f;
    }

    public SolicitacaoResponse toResponse(Solicitacao s) {
        SolicitacaoResponse r = new SolicitacaoResponse();
        r.setId(s.getId());
        r.setTitulo(s.getTitulo());
        r.setDescricao(s.getDescricao());
        r.setStatus(s.getStatus());
        r.setDataEnvio(s.getDataEnvio());
        r.setPontuacaoTotal(s.getPontuacaoTotal());
        r.setTemFormulario(s.getFormulario() != null);
        if (s.getAluno() != null) {
            r.setNomeAluno(s.getAluno().getNome());
            r.setAlunoId(s.getAluno().getId());
        }
        return r;
    }
}
