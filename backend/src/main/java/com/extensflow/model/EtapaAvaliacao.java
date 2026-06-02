package com.extensflow.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "etapas_avaliacao")
public class EtapaAvaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String  nome;
    private Double  peso;
    private Integer ordem;
    private String  status = "PENDENTE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id")
    private ProcessoAvaliacao processo;

    @ManyToMany
    @JoinTable(name = "etapa_avaliadores",
        joinColumns        = @JoinColumn(name = "etapa_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id"))
    private List<Usuario> avaliadores = new ArrayList<>();

    @OneToMany(mappedBy = "etapa", cascade = CascadeType.ALL)
    private List<Avaliacao> avaliacoes = new ArrayList<>();

    public Long              getId()                          { return id; }
    public String            getNome()                        { return nome; }
    public void              setNome(String nome)             { this.nome = nome; }
    public Double            getPeso()                        { return peso; }
    public void              setPeso(Double peso)             { this.peso = peso; }
    public Integer           getOrdem()                       { return ordem; }
    public void              setOrdem(Integer ordem)          { this.ordem = ordem; }
    public String            getStatus()                      { return status; }
    public void              setStatus(String status)         { this.status = status; }
    public ProcessoAvaliacao getProcesso()                    { return processo; }
    public void              setProcesso(ProcessoAvaliacao p) { this.processo = p; }
    public List<Usuario>     getAvaliadores()                 { return avaliadores; }
    public void              setAvaliadores(List<Usuario> av) { this.avaliadores = av; }
    public List<Avaliacao>   getAvaliacoes()                  { return avaliacoes; }
}
