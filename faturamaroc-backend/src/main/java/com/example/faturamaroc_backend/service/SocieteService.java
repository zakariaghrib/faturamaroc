package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.Societe;
import com.example.faturamaroc_backend.repository.SocieteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion de la société émettrice et de ses coordonnées fiscales marocaines (ICE, IF, RC, RIB).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SocieteService {

    private final SocieteRepository societeRepository;

    @Transactional
    public Societe getSocietePrincipale() {
        List<Societe> societes = societeRepository.findAll();
        if (!societes.isEmpty()) {
            return societes.get(0);
        }
        // Initialiser avec des coordonnées par défaut conformes aux tests et à la DGI Maroc
        Societe defaultSociete = Societe.builder()
                .raisonSociale("FaturaMaroc S.A.R.L.")
                .adresse("123 Boulevard Zerktouni, Maarif")
                .ville("Casablanca")
                .pays("Maroc")
                .ice("001524896325000") // 15 chiffres obligatoires
                .identifiantFiscal("15246892")
                .registreCommerce("458920 CASA")
                .rib("007 780 0001234567890123 45")
                .telephone("+212 522 12 34 56")
                .email("contact@faturamaroc.ma")
                .build();

        return societeRepository.save(defaultSociete);
    }

    @Transactional
    public Societe updateSociete(Societe societeModifiee) {
        Societe actuelle = getSocietePrincipale();
        actuelle.setRaisonSociale(societeModifiee.getRaisonSociale());
        actuelle.setAdresse(societeModifiee.getAdresse());
        actuelle.setVille(societeModifiee.getVille());
        actuelle.setPays(societeModifiee.getPays() != null ? societeModifiee.getPays() : "Maroc");
        actuelle.setIce(societeModifiee.getIce());
        actuelle.setIdentifiantFiscal(societeModifiee.getIdentifiantFiscal());
        actuelle.setRegistreCommerce(societeModifiee.getRegistreCommerce());
        actuelle.setRib(societeModifiee.getRib());
        actuelle.setTelephone(societeModifiee.getTelephone());
        actuelle.setEmail(societeModifiee.getEmail());
        actuelle.setLogoUrl(societeModifiee.getLogoUrl());
        return societeRepository.save(actuelle);
    }
}
