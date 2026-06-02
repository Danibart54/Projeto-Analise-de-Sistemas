package com.extensflow.config;

import com.extensflow.model.*;
import com.extensflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired private UsuarioV2Repository usuarioV2Repo;
    @Autowired private TipoApoRepository   tipoApoRepo;
    @Autowired private CursoRepository     cursoRepo;
    @Autowired private PasswordEncoder     passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${app.seed.senha:#{null}}")
    private String seedSenha;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (!seedEnabled || seedSenha == null || seedSenha.isBlank()) return;
            if (usuarioV2Repo.count() > 0) return;

            String hash = passwordEncoder.encode(seedSenha);

            // ── Cursos ─────────────────────────────────────────────────────────
            Curso mestrado = new Curso();
            mestrado.setNome("Mestrado em Computação Aplicada — PPGCA");
            mestrado.setNivel("MESTRADO");
            mestrado.setCreditosNecessarios(12);
            cursoRepo.save(mestrado);

            Curso doutorado = new Curso();
            doutorado.setNome("Doutorado em Computação Aplicada — PPGCA");
            doutorado.setNivel("DOUTORADO");
            doutorado.setCreditosNecessarios(24);
            cursoRepo.save(doutorado);

            // ── Tipos de APO ───────────────────────────────────────────────────
            seedTiposApo();

            // ── Admin ──────────────────────────────────────────────────────────
            usuarioV2Repo.save(usuario(hash, "Administrador",
                    "admin@edu.br", true, List.of("SECRETARIO")));

            // ── Orientador ─────────────────────────────────────────────────────
            UsuarioV2 orientador = usuario(hash, "Prof. Carlos Oliveira",
                    "carlos@orientador.edu.br", false, List.of("ORIENTADOR"));
            orientador.setAreaAtuacao("Sistemas Distribuídos");
            orientador.setTitulacao("Doutor");
            orientador = usuarioV2Repo.save(orientador);

            // ── Secretaria ─────────────────────────────────────────────────────
            usuarioV2Repo.save(usuario(hash, "Secretária Ana",
                    "secretaria@edu.br", false, List.of("SECRETARIO")));

            // ── Comissão Julgadora ─────────────────────────────────────────────
            usuarioV2Repo.save(usuario(hash, "Dra. Ana Paula",
                    "ana@comissao.edu.br", false, List.of("COMISSAO_JULGADORA")));
            usuarioV2Repo.save(usuario(hash, "Dr. Roberto Lima",
                    "roberto@comissao.edu.br", false, List.of("COMISSAO_JULGADORA")));

            // ── Coordenação ────────────────────────────────────────────────────
            usuarioV2Repo.save(usuario(hash, "Coordenadora Maria",
                    "coordenacao@edu.br", false, List.of("COORDENADOR")));

            // ── Multiperfil (demo) ─────────────────────────────────────────────
            usuarioV2Repo.save(usuario(hash, "João Multiperfil",
                    "joao.multiperfil@edu.br", false,
                    List.of("ORIENTADOR", "COMISSAO_JULGADORA")));

            // ── Alunos ─────────────────────────────────────────────────────────
            UsuarioV2 aluno1 = usuario(hash, "João Silva",
                    "joao@aluno.edu.br", false, List.of("ALUNO"));
            aluno1.setMatricula("2024001");
            aluno1.setCurso("Mestrado em Computação Aplicada");
            aluno1.setTipoAluno("MESTRADO");
            aluno1.setOrientadorVinculadoId(orientador.getId());
            usuarioV2Repo.save(aluno1);

            UsuarioV2 aluno2 = usuario(hash, "Maria Santos",
                    "maria@aluno.edu.br", false, List.of("ALUNO"));
            aluno2.setMatricula("2024002");
            aluno2.setCurso("Doutorado em Computação Aplicada");
            aluno2.setTipoAluno("DOUTORADO");
            aluno2.setOrientadorVinculadoId(orientador.getId());
            usuarioV2Repo.save(aluno2);

            log.info("=== SEED APO-PPGCA (MongoDB) CARREGADO ===");
            log.info("Admin:       admin@edu.br / {}", seedSenha);
            log.info("Orientador:  carlos@orientador.edu.br / {}", seedSenha);
            log.info("Secretaria:  secretaria@edu.br / {}", seedSenha);
            log.info("Comissão:    ana@comissao.edu.br, roberto@comissao.edu.br");
            log.info("Coordenação: coordenacao@edu.br / {}", seedSenha);
            log.info("Multiperfil: joao.multiperfil@edu.br (Orientador + Comissão)");
            log.info("Alunos:      joao@aluno.edu.br, maria@aluno.edu.br / {}", seedSenha);
        };
    }

    private UsuarioV2 usuario(String hash, String nome, String email,
                               boolean admin, List<String> funcoes) {
        UsuarioV2 u = new UsuarioV2();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha(hash);
        u.setAdmin(admin);
        u.setFuncoes(funcoes);
        return u;
    }

    private void seedTiposApo() {
        List<Object[]> tipos = List.of(
            new Object[]{"Desenvolvimento e disponibilização de artefato tecnológico", 3, null},
            new Object[]{"Submissão de artigo em periódico/evento qualificado", 1, 2},
            new Object[]{"Aceite de artigo em periódico/evento qualificado", 2, 4},
            new Object[]{"Publicação de artigo em periódico/evento qualificado", 3, 6},
            new Object[]{"Depósito de patente", 3, null},
            new Object[]{"Desenvolvimento de projeto com empresas", 2, 4},
            new Object[]{"Registro de programa de computador", 2, null},
            new Object[]{"Participação em evento interno do PPGCA", 1, 2},
            new Object[]{"Participação em evento externo nacional", 1, 2},
            new Object[]{"Participação em evento externo internacional", 2, 4},
            new Object[]{"Representante discente", 1, 2},
            new Object[]{"Monitoria/Estágio docente", 2, null},
            new Object[]{"Organização de evento científico", 2, null},
            new Object[]{"Revisão de artigo científico", 1, 2}
        );

        tipos.forEach(t -> {
            TipoApo tipo = new TipoApo();
            tipo.setNome((String) t[0]);
            tipo.setCreditos((Integer) t[1]);
            tipo.setLimiteCreditos((Integer) t[2]);
            tipo.setAplicavelPara("AMBOS");
            tipo.setAnoRegra("AMBOS");
            tipo.setAtivo(true);
            tipoApoRepo.save(tipo);
        });

        log.info("Tipos de APO carregados: {} tipos", tipos.size());
    }
}
