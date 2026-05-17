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

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired private UsuarioRepository     usuarioRepo;
    @Autowired private AlunoRepository       alunoRepo;
    @Autowired private SolicitacaoRepository solicitacaoRepo;
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

            Aluno aluno1 = new Aluno();
            aluno1.setNome("João Silva");
            aluno1.setEmail("joao@aluno.edu.br");
            aluno1.setSenha(hash);
            aluno1.setMatricula("2024001");
            aluno1.setCurso("Engenharia de Software");
            aluno1.setTipoUsuario(TipoUsuario.ALUNO);
            alunoRepo.save(aluno1);

            Aluno aluno2 = new Aluno();
            aluno2.setNome("Maria Santos");
            aluno2.setEmail("maria@aluno.edu.br");
            aluno2.setSenha(hash);
            aluno2.setMatricula("2024002");
            aluno2.setCurso("Ciência da Computação");
            aluno2.setTipoUsuario(TipoUsuario.ALUNO);
            alunoRepo.save(aluno2);

            Orientador orientador = new Orientador();
            orientador.setNome("Prof. Carlos Oliveira");
            orientador.setEmail("carlos@docente.edu.br");
            orientador.setSenha(hash);
            orientador.setAreaAtuacao("Sistemas Distribuídos");
            orientador.setTitulacao("Doutor");
            orientador.setTipoUsuario(TipoUsuario.ORIENTADOR);
            usuarioRepo.save(orientador);

            MembroComissao membro1 = new MembroComissao();
            membro1.setNome("Dra. Ana Paula");
            membro1.setEmail("ana@comissao.edu.br");
            membro1.setSenha(hash);
            membro1.setEspecialidade("Inteligência Artificial");
            membro1.setInstituicao("UFBA");
            membro1.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
            usuarioRepo.save(membro1);

            MembroComissao membro2 = new MembroComissao();
            membro2.setNome("Dr. Roberto Lima");
            membro2.setEmail("roberto@comissao.edu.br");
            membro2.setSenha(hash);
            membro2.setEspecialidade("Banco de Dados");
            membro2.setInstituicao("USP");
            membro2.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
            usuarioRepo.save(membro2);

            Formulario form = new Formulario();
            form.setTitulo("Sistema de Gestão Escolar");
            form.setDescricao("Desenvolvimento de plataforma web para gestão de atividades escolares.");
            form.setObjetivos("Digitalizar os processos internos da escola parceira");
            form.setMetodologia("Desenvolvimento ágil com Scrum");
            form.setPublicoAlvo("Gestores e professores de escolas públicas");

            Solicitacao sol = new Solicitacao();
            sol.setTitulo("Sistema de Gestão Escolar");
            sol.setDescricao("Proposta de extensão para desenvolvimento de sistema digital");
            sol.setAluno(aluno1);
            sol.setFormulario(form);
            sol.setStatus(StatusSolicitacao.EM_AVALIACAO);
            solicitacaoRepo.save(sol);

            Solicitacao sol2 = new Solicitacao();
            sol2.setTitulo("App de Saúde Comunitária");
            sol2.setDescricao("Aplicativo móvel para monitoramento de indicadores de saúde");
            sol2.setAluno(aluno2);
            sol2.setStatus(StatusSolicitacao.ENVIADA_PARA_ANALISE);
            solicitacaoRepo.save(sol2);

            log.info("Dados de demonstração carregados. Emails: joao@aluno.edu.br, maria@aluno.edu.br, carlos@docente.edu.br, ana@comissao.edu.br");
        };
    }
}
