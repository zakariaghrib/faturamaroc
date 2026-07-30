package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.Societe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocieteRepository extends JpaRepository<Societe, Long> {
}
