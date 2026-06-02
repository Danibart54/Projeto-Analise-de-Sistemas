package com.extensflow.service;

import com.extensflow.exception.BusinessException;
import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.Documento;
import com.extensflow.model.Solicitacao;
import com.extensflow.repository.DocumentoRepository;
import com.extensflow.repository.SolicitacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentoService {

    // V-10: logger de auditoria — assinar documento é evento juridicamente relevante
    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private DocumentoRepository documentoRepo;
    @Autowired private SolicitacaoRepository solicitacaoRepo;

    @Transactional
    public Documento gerar(Long solicitacaoId, String tipo, String geradoPor) {
        Solicitacao sol = solicitacaoRepo.findById(solicitacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));

        // Validar tipo de documento — evitar valores arbitrários persistidos
        validarTipoDocumento(tipo);

        Documento doc = new Documento();
        doc.setTipo(tipo);
        doc.setSolicitacao(sol);

        Documento salvo = documentoRepo.save(doc);
        // V-10: registro da geração
        audit.info("DOCUMENTO_GERADO id={} tipo={} solicitacao={} por={}",
                salvo.getId(), tipo, solicitacaoId, geradoPor);
        return salvo;
    }

    @Transactional
    public Documento assinar(Long documentoId, String assinadoPor) {
        Documento doc = documentoRepo.findById(documentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));

        if (doc.isAssinado())
            throw new BusinessException("Documento já foi assinado anteriormente");

        doc.setAssinado(true);
        doc.setDataAssinatura(LocalDateTime.now());
        doc.setAssinadoPor(assinadoPor);

        Documento salvo = documentoRepo.save(doc);

        // V-10: assinatura é evento crítico — registrar com timestamp preciso
        audit.info("DOCUMENTO_ASSINADO id={} tipo={} solicitacao={} assinadoPor={} em={}",
                salvo.getId(),
                salvo.getTipo(),
                salvo.getSolicitacao() != null ? salvo.getSolicitacao().getId() : "N/A",
                assinadoPor,
                salvo.getDataAssinatura());
        return salvo;
    }

    public List<Documento> listarPorSolicitacao(Long solicitacaoId) {
        return documentoRepo.findBySolicitacaoId(solicitacaoId);
    }

    /** Whitelist de tipos de documento aceitos — rejeita valores arbitrários. */
    private void validarTipoDocumento(String tipo) {
        List<String> tiposValidos = List.of(
                "SOLICITACAO", "AVALIACAO", "DECISAO_FINAL", "COMPROVANTE");
        if (!tiposValidos.contains(tipo))
            throw new BusinessException("Tipo de documento inválido: " + tipo);
    }
}
