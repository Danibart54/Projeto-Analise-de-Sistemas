package com.extensflow.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "usuarios_legado")
public class MembroComissao extends Usuario {

    private String especialidade;
    private String instituicao;

    public String getEspecialidade()                        { return especialidade; }
    public void   setEspecialidade(String especialidade)    { this.especialidade = especialidade; }
    public String getInstituicao()                          { return instituicao; }
    public void   setInstituicao(String instituicao)        { this.instituicao = instituicao; }
}
