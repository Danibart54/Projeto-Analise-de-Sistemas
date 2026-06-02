package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Registra o voto de um coordenador em uma solicitação.
 *
 * Regras:
 * - Cada coordenador pode votar apenas uma vez por solicitação.
 * - O voto pode ser APROVADO ou RECUSADO.
 * - Ao atingir 2 votos APROVADO → status APROVADA_COORDENADORES.
 * - Ao atingir 2 votos RECUSADO → status RECUSADA_COORDENADORES.
 * - O terceiro voto pode ser registrado mesmo que o resultado já esteja definido
 *   (registro histórico), mas não altera mais o status.
 */
@Entity
@Table(
    name = "aprovacoes_solicitacao",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_aprovacao_coordenador",
        columnNames = {"solicitacao_id", "coordenador_id"}
    )
)
public class AprovacaoSolicitacao {

    public enum Voto { APROVADO, RECUSADO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordenador_id", nullable = false)
    private Usuario coordenador;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Voto voto;

    @Column(name = "data_aprovacao", nullable = false)
    private LocalDateTime dataAprovacao = LocalDateTime.now();

    public AprovacaoSolicitacao() {}

    public AprovacaoSolicitacao(Solicitacao solicitacao, Usuario coordenador, Voto voto) {
        this.solicitacao   = solicitacao;
        this.coordenador   = coordenador;
        this.voto          = voto;
        this.dataAprovacao = LocalDateTime.now();
    }

    public Long getId()                             { return id; }
    public Solicitacao getSolicitacao()             { return solicitacao; }
    public void setSolicitacao(Solicitacao s)       { this.solicitacao = s; }
    public Usuario getCoordenador()                 { return coordenador; }
    public void setCoordenador(Usuario c)           { this.coordenador = c; }
    public Voto getVoto()                           { return voto; }
    public void setVoto(Voto voto)                  { this.voto = voto; }
    public LocalDateTime getDataAprovacao()         { return dataAprovacao; }
}
