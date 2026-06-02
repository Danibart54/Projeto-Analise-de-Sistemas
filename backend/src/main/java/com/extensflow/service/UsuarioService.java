package com.extensflow.service;

import com.extensflow.dto.UsuarioRequest;
import com.extensflow.dto.UsuarioResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.model.*;
import com.extensflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private AlunoRepository alunoRepository;
    @Autowired private OrientadorRepository orientadorRepository;
    @Autowired private MembroComissaoRepository membroRepository;
    @Autowired private PasswordEncoder passwordEncoder;   // V-01: hash de senha

    // ── Listagens (retornam DTO sem senha) ───────────────────────────────────

    public List<UsuarioResponse> listarAlunos() {
        return alunoRepository.findAll().stream().map(UsuarioResponse::de).toList();
    }

    public List<UsuarioResponse> listarOrientadores() {
        return orientadorRepository.findAll().stream().map(UsuarioResponse::de).toList();
    }

    public List<UsuarioResponse> listarMembros() {
        return membroRepository.findAll().stream().map(UsuarioResponse::de).toList();
    }

    // ── Auto-cadastro público (apenas Aluno) ─────────────────────────────────

    public UsuarioResponse cadastrarAluno(UsuarioRequest req) {
        validarEmailUnico(req.getEmail());
        Aluno a = new Aluno();
        preencherBase(a, req);
        a.setMatricula(req.getMatricula());
        a.setCurso(req.getCurso());
        a.setTipoUsuario(TipoUsuario.ALUNO);
        audit.info("USUARIO_CRIADO tipo=ALUNO email={}", req.getEmail());
        return UsuarioResponse.de(alunoRepository.save(a));
    }

    // ── Cadastro admin — restrito à Secretaria (@PreAuthorize no controller) ─

    public UsuarioResponse cadastrar(UsuarioRequest req, String quemCadastrou) {
        validarEmailUnico(req.getEmail());

        Usuario salvo = switch (req.getTipo().toLowerCase()) {
            case "orientador" -> {
                Orientador o = new Orientador();
                preencherBase(o, req);
                o.setAreaAtuacao(req.getAreaAtuacao());
                o.setTitulacao(req.getTitulacao());
                o.setTipoUsuario(TipoUsuario.ORIENTADOR);
                yield orientadorRepository.save(o);
            }
            case "membro_comissao" -> {
                MembroComissao m = new MembroComissao();
                preencherBase(m, req);
                m.setEspecialidade(req.getEspecialidade());
                m.setInstituicao(req.getInstituicao());
                m.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
                yield membroRepository.save(m);
            }
            default -> throw new BusinessException("Tipo inválido: " + req.getTipo());
        };

        audit.info("USUARIO_CRIADO tipo={} email={} por={}", req.getTipo(), req.getEmail(), quemCadastrou);
        return UsuarioResponse.de(salvo);
    }

    public void desativar(Long id, String quemDesativou) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        u.setAtivo(false);
        usuarioRepository.save(u);
        audit.info("USUARIO_DESATIVADO id={} por={}", id, quemDesativou);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validarEmailUnico(String email) {
        if (usuarioRepository.existsByEmail(email))
            throw new BusinessException("E-mail já cadastrado");
    }

    private void preencherBase(Usuario u, UsuarioRequest req) {
        u.setNome(req.getNome());
        u.setEmail(req.getEmail());
        u.setSenha(passwordEncoder.encode(req.getSenha()));  // V-01: BCrypt
        u.setAtivo(true);
    }
}
