package com.example.faturamaroc_backend.security;

import com.example.faturamaroc_backend.dto.auth.LoginRequest;
import com.example.faturamaroc_backend.dto.auth.RegisterRequest;
import com.example.faturamaroc_backend.model.enums.Role;
import com.example.faturamaroc_backend.repository.UtilisateurRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class AuthAndSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @BeforeEach
    void setUp() {
        utilisateurRepository.deleteAll();
    }

    @Test
    void testRegisterAndLogin_ShouldReturnValidJwtToken() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("admin.maroc@faturamaroc.ma")
                .password("SecuredPass123!")
                .nomComplet("Zakaria Ghrib")
                .role(Role.ADMINISTRATEUR)
                .build();

        // 1. Test Inscription -> 201 Created avec token JWT
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMINISTRATEUR"));

        // 2. Test Connexion -> 200 OK avec token JWT
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin.maroc@faturamaroc.ma")
                .password("SecuredPass123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("admin.maroc@faturamaroc.ma"));
    }

    @Test
    void testAccessProtectedEndpoint_WithoutToken_ShouldBeDenied() throws Exception {
        mockMvc.perform(get("/api/clients"))
                .andExpect(status().isForbidden()); // Sans JWT Bearer -> refusé par Spring Security stateless
    }

    @Test
    void testAccessProtectedEndpoint_WithValidToken_ShouldSucceed() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("comptable@faturamaroc.ma")
                .password("Password123!")
                .nomComplet("Mina Comptable")
                .role(Role.COMPTABLE)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(jsonResponse).get("token").asText();

        // Appel d'un endpoint protégé avec le JWT dans le header Authorization
        mockMvc.perform(get("/api/clients")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testRoleBasedAccessControl_CommercialCannotDelete_ShouldBeForbidden() throws Exception {
        RegisterRequest commercialReq = RegisterRequest.builder()
                .email("commercial@faturamaroc.ma")
                .password("Password123!")
                .nomComplet("Youssef Commercial")
                .role(Role.COMMERCIAL)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commercialReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();

        // Tentative de suppression (DELETE /api/clients/1) par un COMMERCIAL -> 403 Forbidden (seul ADMINISTRATEUR est autorisé)
        mockMvc.perform(delete("/api/clients/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}
