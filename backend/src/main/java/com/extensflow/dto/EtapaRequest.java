package com.extensflow.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class EtapaRequest {

    @NotBlank(message = "Nome da etapa é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nome;

    @NotNull(message = "Peso é obrigatório")
    @DecimalMin(value = "0.0", message = "Peso mínimo é 0.0")
    @DecimalMax(value = "1.0", message = "Peso máximo é 1.0")
    private Double peso;

    @NotNull(message = "Ordem é obrigatória")
    @Min(value = 1,   message = "Ordem mínima é 1")
    @Max(value = 100, message = "Ordem máxima é 100")
    private Integer ordem;

    // IDs de avaliadores — validados existência no service via findAllById
    @Size(max = 10, message = "Máximo de 10 avaliadores por etapa")
    private List<Long> avaliadoresIds;

    public String       getNome()                          { return nome; }
    public void         setNome(String nome)               { this.nome = nome; }
    public Double       getPeso()                          { return peso; }
    public void         setPeso(Double peso)               { this.peso = peso; }
    public Integer      getOrdem()                         { return ordem; }
    public void         setOrdem(Integer ordem)            { this.ordem = ordem; }
    public List<Long>   getAvaliadoresIds()                { return avaliadoresIds; }
    public void         setAvaliadoresIds(List<Long> ids)  { this.avaliadoresIds = ids; }
}
