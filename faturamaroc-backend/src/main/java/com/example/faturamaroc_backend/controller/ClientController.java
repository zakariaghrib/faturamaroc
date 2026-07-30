package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.repository.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST haute performance pour la gestion du référentiel Tiers (Clients / Fournisseurs)
 * avec validation stricte de l'ICE marocain (15 chiffres).
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Client>> getAllClients() {
        return ResponseEntity.ok(clientRepository.findAll());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable avec l'ID : " + id));
    }

    @GetMapping("/ice/{ice}")
    @Transactional(readOnly = true)
    public ResponseEntity<Client> getClientByIce(@PathVariable String ice) {
        return clientRepository.findByIce(ice)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new EntityNotFoundException("Aucun client trouvé avec l'ICE : " + ice));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Client> createClient(@Valid @RequestBody Client client) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientRepository.save(client));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @Valid @RequestBody Client clientDetails) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable avec l'ID : " + id));

        existingClient.setRaisonSociale(clientDetails.getRaisonSociale());
        existingClient.setIce(clientDetails.getIce());
        existingClient.setIdentifiantFiscal(clientDetails.getIdentifiantFiscal());
        existingClient.setRegistreCommerce(clientDetails.getRegistreCommerce());
        existingClient.setAdresse(clientDetails.getAdresse());
        existingClient.setVille(clientDetails.getVille());
        existingClient.setPays(clientDetails.getPays());
        existingClient.setEmail(clientDetails.getEmail());
        existingClient.setTelephone(clientDetails.getTelephone());
        existingClient.setType(clientDetails.getType());

        return ResponseEntity.ok(clientRepository.save(existingClient));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        if (!clientRepository.existsById(id)) {
            throw new EntityNotFoundException("Client introuvable avec l'ID : " + id);
        }
        clientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
