package com.extensflow.dto;

import com.extensflow.model.StatusSolicitacao;
import jakarta.validation.constraints.NotBlank;

public class SolicitacaoDTO {

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    private String descricao;
    private Long alunoId;

    // Formulário embutido
    private String formTitulo;
    private String formDescricao;
    private String formObjetivos;
    private String formMetodologia;
    private String formPublicoAlvo;

    private StatusSolicitacao status;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Long getAlunoId() { return alunoId; }
    public void setAlunoId(Long alunoId) { this.alunoId = alunoId; }

    public String getFormTitulo() { return formTitulo; }
    public void setFormTitulo(String formTitulo) { this.formTitulo = formTitulo; }

    public String getFormDescricao() { return formDescricao; }
    public void setFormDescricao(String formDescricao) { this.formDescricao = formDescricao; }

    public String getFormObjetivos() { return formObjetivos; }
    public void setFormObjetivos(String formObjetivos) { this.formObjetivos = formObjetivos; }

    public String getFormMetodologia() { return formMetodologia; }
    public void setFormMetodologia(String formMetodologia) { this.formMetodologia = formMetodologia; }

    public String getFormPublicoAlvo() { return formPublicoAlvo; }
    public void setFormPublicoAlvo(String formPublicoAlvo) { this.formPublicoAlvo = formPublicoAlvo; }

    public StatusSolicitacao getStatus() { return status; }
    public void setStatus(StatusSolicitacao status) { this.status = status; }
}
