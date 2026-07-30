package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.dto.auth.AuthResponse;
import com.example.faturamaroc_backend.dto.auth.LoginRequest;
import com.example.faturamaroc_backend.dto.auth.RegisterRequest;
import com.example.faturamaroc_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur d'authentification REST fournissant les endpoints publics
 * d'inscription (/api/auth/register) et de connexion (/api/auth/login).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
