package com.example.faturamaroc_backend.config;

import com.example.faturamaroc_backend.security.CustomUserDetailsService;
import com.example.faturamaroc_backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration principale Spring Security (Stateless JWT + Rôles Marocains RBAC)
 * Sécurisation granulaire selon les rôles : ADMINISTRATEUR, COMPTABLE, COMMERCIAL.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {}) // Prise en compte de WebConfig CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Points d'entrée publics (authentification & enregistrement)
                        .requestMatchers("/api/auth/**").permitAll()
                        // Rôles Marocains : Suppression réservée aux ADMINISTRATEUR
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMINISTRATEUR")
                        // Enregistrement de règlements réservé aux COMPTABLE & ADMINISTRATEUR
                        .requestMatchers("/api/paiements/**").hasAnyRole("ADMINISTRATEUR", "COMPTABLE")
                        // Gestion commerciale et catalogue
                        .requestMatchers("/api/documents/**", "/api/clients/**", "/api/produits/**", "/api/societe/**")
                            .hasAnyRole("ADMINISTRATEUR", "COMPTABLE", "COMMERCIAL")
                        // Tout autre endpoint nécessite une authentification
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // BCrypt force 12 (sécurité maximale)
    }
}
