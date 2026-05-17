package com.extensflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SolicitacaoRequest {

    @NotBlank(message = "Título é obrigatório")
    @Size(min = 5, max = 200, message = "Título deve ter entre 5 e 200 caracteres")
    private String titulo;

    @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
    private String descricao;

    @NotNull(message = "ID do aluno é obrigatório")
    private Long alunoId;

    @Valid   // propaga validação para o objeto aninhado
    private FormularioRequest formulario;

    public String getTitulo()                        { return titulo; }
    public void   setTitulo(String titulo)           { this.titulo = titulo; }
    public String getDescricao()                     { return descricao; }
    public void   setDescricao(String descricao)     { this.descricao = descricao; }
    public Long   getAlunoId()                       { return alunoId; }
    public void   setAlunoId(Long alunoId)           { this.alunoId = alunoId; }
    public FormularioRequest getFormulario()         { return formulario; }
    public void setFormulario(FormularioRequest f)   { this.formulario = f; }
}
