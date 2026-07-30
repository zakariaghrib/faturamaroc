package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.model.enums.TypeTiers;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import com.example.faturamaroc_backend.service.DocumentCommercialService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentCommercialController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentCommercialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentCommercialService documentService;

    @MockBean
    private DocumentCommercialRepository documentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Client client;
    private DocumentCommercial facture;

    @BeforeEach
    void setUp() {
        client = Client.builder()
                .id(1L)
                .raisonSociale("CLIENT MAROC SARL")
                .ice("001122334455667")
                .type(TypeTiers.CLIENT)
                .build();

        facture = DocumentCommercial.builder()
                .id(10L)
                .numero("FAC-2026-0001")
                .typeDocument(TypeDocument.FACTURE)
                .statut(StatutFacture.IMPAYEE)
                .dateEmission(LocalDate.now())
                .client(client)
                .totalHT(new BigDecimal("1000.00"))
                .totalTVA(new BigDecimal("200.00"))
                .totalTTC(new BigDecimal("1200.00"))
                .soldeRestantDu(new BigDecimal("1200.00"))
                .build();
    }

    @Test
    void testGetAllDocuments_ShouldReturnListAnd200Ok() throws Exception {
        when(documentService.getAllDocuments()).thenReturn(List.of(facture));

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numero").value("FAC-2026-0001"))
                .andExpect(jsonPath("$[0].totalTTC").value(1200.00));
    }

    @Test
    void testCreateDocument_ShouldReturn201Created() throws Exception {
        when(documentService.createDocument(any(DocumentCommercial.class))).thenReturn(facture);

        mockMvc.perform(post("/api/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facture)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numero").value("FAC-2026-0001"))
                .andExpect(jsonPath("$.statut").value("IMPAYEE"));
    }

    @Test
    void testConvertDevisToFacture_ShouldReturn201Created() throws Exception {
        when(documentService.convertirDevisEnFacture(50L)).thenReturn(facture);

        mockMvc.perform(post("/api/documents/50/convert"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numero").value("FAC-2026-0001"))
                .andExpect(jsonPath("$.typeDocument").value("FACTURE"));
    }
}
