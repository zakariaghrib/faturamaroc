package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.model.enums.TypeTiers;
import com.example.faturamaroc_backend.repository.ClientRepository;
import com.example.faturamaroc_backend.security.CustomUserDetailsService;
import com.example.faturamaroc_backend.security.JwtAuthenticationFilter;
import com.example.faturamaroc_backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
@AutoConfigureMockMvc(addFilters = false)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllClients_ShouldReturnListAnd200Ok() throws Exception {
        Client client = Client.builder()
                .id(1L)
                .raisonSociale("SOCIETE MAROC SARL")
                .ice("001122334455667")
                .type(TypeTiers.CLIENT)
                .build();

        when(clientRepository.findAll()).thenReturn(List.of(client));

        mockMvc.perform(get("/api/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].raisonSociale").value("SOCIETE MAROC SARL"))
                .andExpect(jsonPath("$[0].ice").value("001122334455667"));
    }

    @Test
    void testCreateClient_WithValidIce_ShouldReturn201Created() throws Exception {
        Client client = Client.builder()
                .raisonSociale("MAROC INFORMATIQUE SARL")
                .ice("123456789012345") // 15 chiffres exacts
                .type(TypeTiers.CLIENT)
                .build();

        when(clientRepository.save(any(Client.class))).thenReturn(client);

        mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.raisonSociale").value("MAROC INFORMATIQUE SARL"))
                .andExpect(jsonPath("$.ice").value("123456789012345"));
    }

    @Test
    void testCreateClient_WithInvalidIce_ShouldReturn400BadRequest() throws Exception {
        Client client = Client.builder()
                .raisonSociale("CLIENT INVALID ICE")
                .ice("12345") // 5 chiffres seulement -> invalide
                .type(TypeTiers.CLIENT)
                .build();

        mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Error"));
    }

    @Test
    void testGetClientById_NotFound_ShouldReturn404() throws Exception {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/clients/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
