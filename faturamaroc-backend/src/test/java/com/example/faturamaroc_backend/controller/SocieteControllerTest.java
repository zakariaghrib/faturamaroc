package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Societe;
import com.example.faturamaroc_backend.security.CustomUserDetailsService;
import com.example.faturamaroc_backend.security.JwtAuthenticationFilter;
import com.example.faturamaroc_backend.security.JwtService;
import com.example.faturamaroc_backend.service.SocieteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SocieteController.class)
@AutoConfigureMockMvc(addFilters = false)
class SocieteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SocieteService societeService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetSocietePrincipale_ShouldReturn200() throws Exception {
        Societe societe = Societe.builder()
                .id(1L)
                .raisonSociale("FaturaMaroc S.A.R.L.")
                .ice("001524896325000")
                .identifiantFiscal("15246892")
                .registreCommerce("458920 CASA")
                .build();

        when(societeService.getSocietePrincipale()).thenReturn(societe);

        mockMvc.perform(get("/api/societe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.raisonSociale").value("FaturaMaroc S.A.R.L."))
                .andExpect(jsonPath("$.ice").value("001524896325000"));
    }

    @Test
    void testUpdateSociete_ShouldReturn200() throws Exception {
        Societe societe = Societe.builder()
                .id(1L)
                .raisonSociale("FaturaMaroc S.A.R.L.")
                .ice("001524896325000")
                .identifiantFiscal("15246892")
                .registreCommerce("458920 CASA")
                .build();

        when(societeService.updateSociete(any(Societe.class))).thenReturn(societe);

        mockMvc.perform(put("/api/societe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(societe)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.raisonSociale").value("FaturaMaroc S.A.R.L."));
    }
}
