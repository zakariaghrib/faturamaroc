package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.model.enums.TypeTiers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByIce(String ice);
    boolean existsByIce(String ice);
    List<Client> findByType(TypeTiers type);
}
