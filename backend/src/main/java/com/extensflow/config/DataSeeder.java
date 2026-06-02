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

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired private UsuarioRepository     usuarioRepo;
    @Autowired private UsuarioV2Repository   usuarioV2Repo;
    @Autowired private FuncaoRepository      funcaoRepo;
    @Autowired private AlunoRepository       alunoRepo;
    @Autowired private SolicitacaoRepository solicitacaoRepo;
    @Autowired private TipoApoRepository     tipoApoRepo;
    @Autowired private CursoRepository       cursoRepo;
    @Autowired private PasswordEncoder       passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${app.seed.senha:#{null}}")
    private String seedSenha;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (!seedEnabled || seedSenha == null || seedSenha.isBlank()) return;
            if (usuarioRepo.count() > 0) return;

            String hash = passwordEncoder.encode(seedSenha);

            // ── Funções ─────────────────────────────────────────────────────
            funcaoRepo.saveAll(Set.of(
                new Funcao("COORDENADOR"),
                new Funcao("ORIENTADOR"),
                new Funcao("SECRETARIO"),
                new Funcao("COMISSAO_JULGADORA"),
                new Funcao("ALUNO")
            ));
            funcaoRepo.flush();

            Funcao fCoordenador = funcaoRepo.findByNomeIgnoreCase("COORDENADOR").orElseThrow();
            Funcao fOrientador  = funcaoRepo.findByNomeIgnoreCase("ORIENTADOR").orElseThrow();
            Funcao fSecretario  = funcaoRepo.findByNomeIgnoreCase("SECRETARIO").orElseThrow();
            Funcao fComissao    = funcaoRepo.findByNomeIgnoreCase("COMISSAO_JULGADORA").orElseThrow();
            Funcao fAluno       = funcaoRepo.findByNomeIgnoreCase("ALUNO").orElseThrow();

            // ── Cursos ───────────────────────────────────────────────────────
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

            // ── Tipos de APO ─────────────────────────────────────────────────
            seedTiposApo();

            // ── Admin ────────────────────────────────────────────────────────
            UsuarioV2 admin = new UsuarioV2();
            admin.setNome("Administrador");
            admin.setEmail("admin@edu.br");
            admin.setSenha(hash);
            admin.setAdmin(true);
            admin.setFuncoes(new HashSet<>(Set.of(fSecretario)));
            usuarioV2Repo.save(admin);

            // ── Orientador V2 ────────────────────────────────────────────────
            UsuarioV2 orientador1 = new UsuarioV2();
            orientador1.setNome("Prof. Carlos Oliveira");
            orientador1.setEmail("carlos@orientador.edu.br");
            orientador1.setSenha(hash);
            orientador1.setFuncoes(new HashSet<>(Set.of(fOrientador)));
            usuarioV2Repo.save(orientador1);

            // ── Secretaria ───────────────────────────────────────────────────
            UsuarioV2 secretaria = new UsuarioV2();
            secretaria.setNome("Secretária Ana");
            secretaria.setEmail("secretaria@edu.br");
            secretaria.setSenha(hash);
            secretaria.setFuncoes(new HashSet<>(Set.of(fSecretario)));
            usuarioV2Repo.save(secretaria);

            // ── Comissão Julgadora ───────────────────────────────────────────
            UsuarioV2 comissao1 = new UsuarioV2();
            comissao1.setNome("Dra. Ana Paula");
            comissao1.setEmail("ana@comissao.edu.br");
            comissao1.setSenha(hash);
            comissao1.setFuncoes(new HashSet<>(Set.of(fComissao)));
            usuarioV2Repo.save(comissao1);

            UsuarioV2 comissao2 = new UsuarioV2();
            comissao2.setNome("Dr. Roberto Lima");
            comissao2.setEmail("roberto@comissao.edu.br");
            comissao2.setSenha(hash);
            comissao2.setFuncoes(new HashSet<>(Set.of(fComissao)));
            usuarioV2Repo.save(comissao2);

            // ── Coordenação ──────────────────────────────────────────────────
            UsuarioV2 coordenacao = new UsuarioV2();
            coordenacao.setNome("Coordenadora Maria");
            coordenacao.setEmail("coordenacao@edu.br");
            coordenacao.setSenha(hash);
            coordenacao.setFuncoes(new HashSet<>(Set.of(fCoordenador)));
            usuarioV2Repo.save(coordenacao);

            // ── Usuário com múltiplos perfis (demo) ──────────────────────────
            UsuarioV2 multiperfil = new UsuarioV2();
            multiperfil.setNome("João Multiperfil");
            multiperfil.setEmail("joao.multiperfil@edu.br");
            multiperfil.setSenha(hash);
            multiperfil.setFuncoes(new HashSet<>(Set.of(fOrientador, fComissao)));
            usuarioV2Repo.save(multiperfil);

            // ── Alunos legados (compatibilidade) ─────────────────────────────
            Aluno aluno1 = new Aluno();
            aluno1.setNome("João Silva");
            aluno1.setEmail("joao@aluno.edu.br");
            aluno1.setSenha(hash);
            aluno1.setMatricula("2024001");
            aluno1.setCurso("Mestrado em Computação Aplicada");
            aluno1.setTipoUsuario(TipoUsuario.ALUNO);
            alunoRepo.save(aluno1);

            Aluno aluno2 = new Aluno();
            aluno2.setNome("Maria Santos");
            aluno2.setEmail("maria@aluno.edu.br");
            aluno2.setSenha(hash);
            aluno2.setMatricula("2024002");
            aluno2.setCurso("Doutorado em Computação Aplicada");
            aluno2.setTipoUsuario(TipoUsuario.ALUNO);
            alunoRepo.save(aluno2);

            Orientador orientadorLegado = new Orientador();
            orientadorLegado.setNome("Prof. Carlos Oliveira");
            orientadorLegado.setEmail("carlos@docente.edu.br");
            orientadorLegado.setSenha(hash);
            orientadorLegado.setAreaAtuacao("Sistemas Distribuídos");
            orientadorLegado.setTitulacao("Doutor");
            orientadorLegado.setTipoUsuario(TipoUsuario.ORIENTADOR);
            usuarioRepo.save(orientadorLegado);

            MembroComissao membro1 = new MembroComissao();
            membro1.setNome("Dra. Fernanda Costa");
            membro1.setEmail("fernanda@comissao.edu.br");
            membro1.setSenha(hash);
            membro1.setEspecialidade("Ciência de Dados");
            membro1.setInstituicao("UNICAMP");
            membro1.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
            usuarioRepo.save(membro1);

            MembroComissao membro2 = new MembroComissao();
            membro2.setNome("Dr. Paulo Mendes");
            membro2.setEmail("paulo@comissao.edu.br");
            membro2.setSenha(hash);
            membro2.setEspecialidade("Engenharia de Software");
            membro2.setInstituicao("USP");
            membro2.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
            usuarioRepo.save(membro2);

            MembroComissao membro3 = new MembroComissao();
            membro3.setNome("Dra. Lúcia Pereira");
            membro3.setEmail("lucia@comissao.edu.br");
            membro3.setSenha(hash);
            membro3.setEspecialidade("Inteligência Artificial");
            membro3.setInstituicao("UFBA");
            membro3.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
            usuarioRepo.save(membro3);

            log.info("=== SEED APO-PPGCA CARREGADO ===");
            log.info("Admin:          admin@edu.br / {}", seedSenha);
            log.info("Orientador:     carlos@orientador.edu.br / {}", seedSenha);
            log.info("Secretaria:     secretaria@edu.br / {}", seedSenha);
            log.info("Comissão:       ana@comissao.edu.br, roberto@comissao.edu.br");
            log.info("Coordenação:    coordenacao@edu.br / {}", seedSenha);
            log.info("Multiperfil:    joao.multiperfil@edu.br (Orientador + Comissão)");
            log.info("Alunos(legado): joao@aluno.edu.br, maria@aluno.edu.br / {}", seedSenha);
        };
    }

    private void seedTiposApo() {
        List<Object[]> tipos = List.of(
            new Object[]{"Desenvolvimento e disponibilização de artefato tecnológico",
                "Desenvolvimento de software, hardware ou outro artefato tecnológico disponibilizado publicamente.", 3, null, "AMBOS", "AMBOS"},
            new Object[]{"Submissão de artigo em periódico/evento qualificado",
                "Submissão de artigo científico em periódico ou evento de qualidade reconhecida.", 1, 2, "AMBOS", "AMBOS"},
            new Object[]{"Aceite de artigo em periódico/evento qualificado",
                "Aceite de artigo científico em periódico ou evento de qualidade reconhecida.", 2, 4, "AMBOS", "AMBOS"},
            new Object[]{"Publicação de artigo em periódico/evento qualificado",
                "Publicação efetiva de artigo científico.", 3, 6, "AMBOS", "AMBOS"},
            new Object[]{"Depósito de patente",
                "Depósito de patente junto ao INPI ou equivalente.", 3, null, "AMBOS", "AMBOS"},
            new Object[]{"Desenvolvimento de projeto com empresas",
                "Participação em projeto de P&D em parceria com empresas.", 2, 4, "AMBOS", "AMBOS"},
            new Object[]{"Registro de programa de computador",
                "Registro de software junto ao INPI.", 2, null, "AMBOS", "AMBOS"},
            new Object[]{"Participação em evento interno do PPGCA",
                "Participação como apresentador ou ouvinte em evento interno do programa.", 1, 2, "AMBOS", "AMBOS"},
            new Object[]{"Participação em evento externo nacional",
                "Participação em evento científico externo de âmbito nacional.", 1, 2, "AMBOS", "AMBOS"},
            new Object[]{"Participação em evento externo internacional",
                "Participação em evento científico externo de âmbito internacional.", 2, 4, "AMBOS", "AMBOS"},
            new Object[]{"Representante discente",
                "Atuação como representante discente em órgão colegiado.", 1, 2, "AMBOS", "AMBOS"},
            new Object[]{"Monitoria/Estágio docente",
                "Atuação como monitor ou estagiário docente em disciplina do programa.", 2, null, "AMBOS", "AMBOS"},
            new Object[]{"Organização de evento científico",
                "Participação na organização de evento científico reconhecido.", 2, null, "AMBOS", "AMBOS"},
            new Object[]{"Revisão de artigo científico",
                "Atuação como revisor de artigo para periódico ou evento científico.", 1, 2, "AMBOS", "AMBOS"}
        );

        tipos.forEach(t -> {
            TipoApo tipo = new TipoApo();
            tipo.setNome((String) t[0]);
            tipo.setDescricao((String) t[1]);
            tipo.setCreditos((Integer) t[2]);
            tipo.setLimiteCreditos((Integer) t[3]);
            tipo.setAplicavelPara((String) t[4]);
            tipo.setAnoRegra((String) t[5]);
            tipo.setObrigatoria(false);
            tipo.setAtivo(true);
            tipoApoRepo.save(tipo);
        });

        log.info("Tipos de APO carregados: {} tipos", tipos.size());
    }
}
