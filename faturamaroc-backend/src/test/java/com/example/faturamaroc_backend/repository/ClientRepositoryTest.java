package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.model.enums.TypeTiers;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ClientRepositoryTest {

    @Autowired
    private ClientRepository clientRepository;

    @Test
    void testSaveClientWithValidIce_ShouldSucceed() {
        Client client = Client.builder()
                .type(TypeTiers.CLIENT)
                .raisonSociale("SOCIETE TEST SARL")
                .ice("001122334455667") // exactement 15 chiffres
                .ville("Casablanca")
                .build();

        Client saved = clientRepository.saveAndFlush(client);
        assertNotNull(saved.getId());
        assertEquals("001122334455667", saved.getIce());
    }

    @Test
    void testSaveClientWithInvalidIce_ShouldThrowValidationException() {
        Client client = Client.builder()
                .type(TypeTiers.CLIENT)
                .raisonSociale("SOCIETE INVALID ICE")
                .ice("12345") // Incorrect : 5 chiffres seulement
                .build();

        assertThrows(ConstraintViolationException.class, () -> {
            clientRepository.saveAndFlush(client);
        });
    }
}
