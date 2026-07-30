package com.example.faturamaroc_backend.dto.auth;

import com.example.faturamaroc_backend.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private Long id;
    private String email;
    private String nomComplet;
    private Role role;
}
