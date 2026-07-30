package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.dto.auth.AuthResponse;
import com.example.faturamaroc_backend.dto.auth.LoginRequest;
import com.example.faturamaroc_backend.dto.auth.RegisterRequest;
import com.example.faturamaroc_backend.model.Utilisateur;
import com.example.faturamaroc_backend.repository.UtilisateurRepository;
import com.example.faturamaroc_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service gérant l'authentification et l'inscription des utilisateurs
 * avec hachage BCrypt et émission de jeton JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Un utilisateur existe déjà avec cet email : " + request.getEmail());
        }

        var user = Utilisateur.builder()
                .email(request.getEmail())
                .nomComplet(request.getNomComplet())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        utilisateurRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .nomComplet(user.getNomComplet())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .nomComplet(user.getNomComplet())
                .role(user.getRole())
                .build();
    }
}
