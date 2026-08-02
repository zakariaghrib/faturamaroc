package com.example.faturamaroc_backend.config;

import com.example.faturamaroc_backend.model.Utilisateur;
import com.example.faturamaroc_backend.model.enums.Role;
import com.example.faturamaroc_backend.repository.UtilisateurRepository;
import com.example.faturamaroc_backend.service.SocieteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Initialiseur de données au démarrage de l'application.
 * Crée automatiquement les comptes de démonstration RBAC marocains requis par le frontend
 * ainsi que les informations de la société émettrice par défaut si la base de données est vide.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final SocieteService societeService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Initialiser la société par défaut si inexistante
        societeService.getSocietePrincipale();

        // 2. Compte Administrateur (Accès total) - admin@faturamaroc.ma / password123
        if (utilisateurRepository.findByEmail("admin@faturamaroc.ma").isEmpty()) {
            Utilisateur admin = Utilisateur.builder()
                    .email("admin@faturamaroc.ma")
                    .password(passwordEncoder.encode("password123"))
                    .nomComplet("Admin FaturaMaroc")
                    .role(Role.ADMINISTRATEUR)
                    .build();
            utilisateurRepository.save(admin);
            log.info("Compte administrateur par défaut créé : admin@faturamaroc.ma / password123");
        }

        // 3. Compte Comptable (Gestion des paiements) - comptable@faturamaroc.ma / password123
        if (utilisateurRepository.findByEmail("comptable@faturamaroc.ma").isEmpty()) {
            Utilisateur comptable = Utilisateur.builder()
                    .email("comptable@faturamaroc.ma")
                    .password(passwordEncoder.encode("password123"))
                    .nomComplet("Comptable FaturaMaroc")
                    .role(Role.COMPTABLE)
                    .build();
            utilisateurRepository.save(comptable);
            log.info("Compte comptable par défaut créé : comptable@faturamaroc.ma / password123");
        }

        // 4. Compte Commercial (Devis / Facturation) - commercial@faturamaroc.ma / password123
        if (utilisateurRepository.findByEmail("commercial@faturamaroc.ma").isEmpty()) {
            Utilisateur commercial = Utilisateur.builder()
                    .email("commercial@faturamaroc.ma")
                    .password(passwordEncoder.encode("password123"))
                    .nomComplet("Commercial FaturaMaroc")
                    .role(Role.COMMERCIAL)
                    .build();
            utilisateurRepository.save(commercial);
            log.info("Compte commercial par défaut créé : commercial@faturamaroc.ma / password123");
        }
    }
}
