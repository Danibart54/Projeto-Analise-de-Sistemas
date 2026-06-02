package com.extensflow.service;

import com.extensflow.dto.AtribuirFuncoesRequest;
import com.extensflow.dto.RegistroRequest;
import com.extensflow.dto.UsuarioV2Request;
import com.extensflow.dto.UsuarioV2Response;
import com.extensflow.exception.BusinessException;
import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.Funcao;
import com.extensflow.model.UsuarioV2;
import com.extensflow.repository.FuncaoRepository;
import com.extensflow.repository.UsuarioV2Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioV2Service {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private UsuarioV2Repository usuarioRepo;
    @Autowired private FuncaoRepository funcaoRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    // ── Listagens ─────────────────────────────────────────────────────────────

    public List<UsuarioV2Response> listarAtivos() {
        return usuarioRepo.findAll().stream()
                .filter(UsuarioV2::isAtivo)
                .map(UsuarioV2Response::de)
                .collect(Collectors.toList());
    }

    /** Admin pode ver todos (ativos e inativos). */
    public List<UsuarioV2Response> listarTodos() {
        return usuarioRepo.findAll().stream()
                .map(UsuarioV2Response::de)
                .collect(Collectors.toList());
    }

    public List<UsuarioV2Response> listarPorFuncao(String nomeFuncao) {
        return usuarioRepo.findByFuncaoNome(nomeFuncao.toUpperCase()).stream()
                .filter(UsuarioV2::isAtivo)
                .map(UsuarioV2Response::de)
                .collect(Collectors.toList());
    }

    public UsuarioV2Response buscarPorId(Long id) {
        return UsuarioV2Response.de(findOrThrow(id));
    }

    // ── Auto-registro público ─────────────────────────────────────────────────

    private static final Set<String> FUNCOES_PUBLICAS = Set.of("ALUNO", "ORIENTADOR");

    /**
     * Auto-cadastro aberto: aceita apenas funções não-privilegiadas (ALUNO, ORIENTADOR).
     * Funções como SECRETARIO, COORDENADOR e COMISSAO_JULGADORA são bloqueadas aqui.
     */
    @Transactional
    public UsuarioV2Response registrar(RegistroRequest req) {
        String funcaoNorm = req.getFuncao().toUpperCase().trim();
        if (!FUNCOES_PUBLICAS.contains(funcaoNorm))
            throw new BusinessException("Auto-cadastro permitido apenas para ALUNO ou ORIENTADOR");

        if (usuarioRepo.existsByEmailIgnoreCase(req.getEmail()))
            throw new BusinessException("E-mail já cadastrado no sistema");

        Funcao funcao = funcaoRepo.findByNomeIgnoreCase(funcaoNorm)
                .orElseGet(() -> funcaoRepo.save(new Funcao(funcaoNorm)));

        UsuarioV2 u = new UsuarioV2();
        u.setNome(req.getNome().trim());
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setSenha(passwordEncoder.encode(req.getSenha()));
        u.setTelefone(req.getTelefone());
        u.setCurso(req.getCurso());
        u.setAtivo(true);
        u.setAdmin(false);
        u.setFuncoes(new HashSet<>(Set.of(funcao)));

        UsuarioV2 salvo = usuarioRepo.save(u);
        audit.info("REGISTRO_PUBLICO id={} email={} funcao={}", salvo.getId(), salvo.getEmail(), funcaoNorm);
        return UsuarioV2Response.de(salvo);
    }

    // ── Cadastro / Edição ─────────────────────────────────────────────────────

    @Transactional
    public UsuarioV2Response cadastrar(UsuarioV2Request req, String por) {
        if (usuarioRepo.existsByEmailIgnoreCase(req.getEmail()))
            throw new BusinessException("E-mail já cadastrado no sistema");

        Set<Funcao> funcoes = resolverFuncoes(req.getFuncoes());
        UsuarioV2 u = new UsuarioV2();
        preencherCampos(u, req, funcoes);
        UsuarioV2 salvo = usuarioRepo.save(u);
        audit.info("USUARIO_V2_CRIADO id={} email={} funcoes={} por={}",
                salvo.getId(), salvo.getEmail(), req.getFuncoes(), por);
        return UsuarioV2Response.de(salvo);
    }

    @Transactional
    public UsuarioV2Response atualizar(Long id, UsuarioV2Request req, String por) {
        UsuarioV2 u = findOrThrow(id);
        usuarioRepo.findByEmailIgnoreCase(req.getEmail())
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(__ -> { throw new BusinessException("E-mail já está em uso por outro usuário"); });

        Set<Funcao> funcoes = resolverFuncoes(req.getFuncoes());
        u.setNome(req.getNome());
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setTelefone(req.getTelefone());
        u.setCurso(req.getCurso());
        u.setSetor(req.getSetor());
        u.setFuncoes(funcoes);
        if (req.getSenha() != null && !req.getSenha().isBlank())
            u.setSenha(passwordEncoder.encode(req.getSenha()));

        audit.info("USUARIO_V2_ATUALIZADO id={} funcoes={} por={}", id, req.getFuncoes(), por);
        return UsuarioV2Response.de(usuarioRepo.save(u));
    }

    /**
     * Admin atribui (ou substitui) funções de qualquer usuário e pode
     * promover / rebaixar o flag de admin.
     *
     * @param alvoId  ID do usuário cujas funções serão alteradas.
     * @param req     Nova lista de funções + flag admin opcional.
     * @param adminId ID do admin que está fazendo a operação (auditoria).
     */
    @Transactional
    public UsuarioV2Response atribuirFuncoes(Long alvoId, AtribuirFuncoesRequest req, Long adminId) {
        UsuarioV2 alvo = findOrThrow(alvoId);

        // Substitui funções completamente pelo novo conjunto
        Set<Funcao> novasFuncoes = resolverFuncoes(req.getFuncoes());
        alvo.setFuncoes(novasFuncoes);

        // Atualiza flag de admin se veio no payload
        if (req.getAdmin() != null) {
            // Um admin não pode rebaixar a si mesmo
            if (alvo.getId().equals(adminId) && Boolean.FALSE.equals(req.getAdmin()))
                throw new BusinessException("Você não pode remover o próprio acesso de admin");
            alvo.setAdmin(req.getAdmin());
        }

        UsuarioV2 salvo = usuarioRepo.save(alvo);
        audit.info("FUNCOES_ATRIBUIDAS alvoId={} novasFuncoes={} admin={} por={}",
                alvoId, req.getFuncoes(), req.getAdmin(), adminId);
        return UsuarioV2Response.de(salvo);
    }

    @Transactional
    public void desativar(Long id, String por) {
        UsuarioV2 u = findOrThrow(id);
        u.setAtivo(false);
        usuarioRepo.save(u);
        audit.info("USUARIO_V2_DESATIVADO id={} por={}", id, por);
    }

    @Transactional
    public void reativar(Long id, String por) {
        UsuarioV2 u = findOrThrow(id);
        u.setAtivo(true);
        usuarioRepo.save(u);
        audit.info("USUARIO_V2_REATIVADO id={} por={}", id, por);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UsuarioV2 findOrThrow(Long id) {
        return usuarioRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário #" + id + " não encontrado"));
    }

    private void preencherCampos(UsuarioV2 u, UsuarioV2Request req, Set<Funcao> funcoes) {
        u.setNome(req.getNome().trim());
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setSenha(passwordEncoder.encode(req.getSenha()));
        u.setTelefone(req.getTelefone());
        u.setCurso(req.getCurso());
        u.setSetor(req.getSetor());
        u.setAtivo(true);
        u.setFuncoes(funcoes);
    }

    private Set<Funcao> resolverFuncoes(List<String> nomes) {
        Set<Funcao> funcoes = new HashSet<>();
        if (nomes == null) return funcoes;
        for (String nome : nomes) {
            String norm = nome.toUpperCase().trim();
            Funcao f = funcaoRepo.findByNomeIgnoreCase(norm)
                    .orElseGet(() -> funcaoRepo.save(new Funcao(norm)));
            funcoes.add(f);
        }
        return funcoes;
    }
}
