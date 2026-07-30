package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentCommercialRepository extends JpaRepository<DocumentCommercial, Long> {
    Optional<DocumentCommercial> findByNumero(String numero);
    List<DocumentCommercial> findByTypeDocument(TypeDocument typeDocument);
    List<DocumentCommercial> findByClientId(Long clientId);
    List<DocumentCommercial> findByStatut(StatutFacture statut);
    List<DocumentCommercial> findByTypeDocumentAndStatut(TypeDocument typeDocument, StatutFacture statut);
}
