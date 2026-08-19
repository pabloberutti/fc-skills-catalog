package com.skills.fc_backend.repository;

import com.skills.fc_backend.model.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Integer> {
    // Al extender de JpaRepository, ya tenemos gratis métodos como:
    // findAll() para traer todas las zonas
    // findById(id) para buscar una sola
}
