package com.extensflow.config;

import com.extensflow.model.*;
import com.extensflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    // Senha vem de variável de ambiente — nunca hardcoded no código
    @Value("${app.seed.senha:#{null}}")
    private String seedSenha;

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private AlunoRepository alunoRepository;
    @Autowired private OrientadorRepository orientadorRepository;
    @Autowired private MembroComissaoRepository membroRepository;
    @Autowired private PasswordEncoder passwordEncoder;   // V-01: BCrypt

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;
        if (seedSenha == null || seedSenha.isBlank()) {
            log.warn("Seed habilitado mas APP_SEED_SENHA não configurado — abortando seed.");
            return;
        }
        if (usuarioRepository.count() > 0) return;

        String senhaHash = passwordEncoder.encode(seedSenha); // V-01: hash antes de salvar

        Aluno aluno = new Aluno();
        aluno.setNome("João Silva");
        aluno.setEmail("joao@aluno.edu");
        aluno.setSenha(senhaHash);
        aluno.setMatricula("2021001");
        aluno.setCurso("Ciência da Computação");
        aluno.setTipoUsuario(TipoUsuario.ALUNO);
        alunoRepository.save(aluno);

        Orientador orientador = new Orientador();
        orientador.setNome("Prof. Maria Santos");
        orientador.setEmail("maria@prof.edu");
        orientador.setSenha(senhaHash);
        orientador.setAreaAtuacao("Engenharia de Software");
        orientador.setTitulacao("Doutora");
        orientador.setTipoUsuario(TipoUsuario.ORIENTADOR);
        orientadorRepository.save(orientador);

        MembroComissao membro = new MembroComissao();
        membro.setNome("Dr. Carlos Oliveira");
        membro.setEmail("carlos@comissao.edu");
        membro.setSenha(senhaHash);
        membro.setEspecialidade("Extensão Universitária");
        membro.setInstituicao("IFSP");
        membro.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
        membroRepository.save(membro);

        // V-01: sem credenciais em texto puro nos logs
        log.info("Dados de demonstração carregados (perfil dev). Emails: joao@aluno.edu, maria@prof.edu, carlos@comissao.edu");
    }
}
