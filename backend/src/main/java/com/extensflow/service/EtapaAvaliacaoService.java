package com.extensflow.service;

import com.extensflow.dto.EtapaRequest;
import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.*;
import com.extensflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EtapaAvaliacaoService {

    @Autowired private EtapaAvaliacaoRepository etapaRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private ProcessoAvaliacaoRepository processoRepo;

    @Transactional
    public EtapaAvaliacao criar(EtapaRequest req) {
        EtapaAvaliacao etapa = new EtapaAvaliacao();
        etapa.setNome(req.getNome());
        etapa.setPeso(req.getPeso());
        etapa.setOrdem(req.getOrdem());

        if (req.getAvaliadoresIds() != null) {
            List<Usuario> avaliadores = usuarioRepo.findAllById(req.getAvaliadoresIds());
            etapa.setAvaliadores(avaliadores);
        }

        return etapaRepo.save(etapa);
    }

    public List<EtapaAvaliacao> listarTodas() {
        return etapaRepo.findAll();
    }

    @Transactional
    public EtapaAvaliacao adicionarAvaliador(Long etapaId, Long avaliadorId) {
        EtapaAvaliacao etapa = etapaRepo.findById(etapaId)
            .orElseThrow(() -> new ResourceNotFoundException("Etapa", etapaId));
        Usuario avaliador = usuarioRepo.findById(avaliadorId)
            .orElseThrow(() -> new ResourceNotFoundException("Avaliador", avaliadorId));
        etapa.getAvaliadores().add(avaliador);
        return etapaRepo.save(etapa);
    }

    @Transactional
    public EtapaAvaliacao encerrar(Long etapaId) {
        EtapaAvaliacao etapa = etapaRepo.findById(etapaId)
            .orElseThrow(() -> new ResourceNotFoundException("Etapa", etapaId));
        etapa.setStatus("ENCERRADA");
        return etapaRepo.save(etapa);
    }
}
