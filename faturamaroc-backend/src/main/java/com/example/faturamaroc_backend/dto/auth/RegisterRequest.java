package com.example.faturamaroc_backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.example.faturamaroc_backend.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit comporter au moins 6 caractères")
    @JsonAlias({"motDePasse", "password"})
    private String password;

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    @NotNull(message = "Le rôle marocain est obligatoire (ADMINISTRATEUR, COMPTABLE, COMMERCIAL)")
    private Role role;
}
