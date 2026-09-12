package com.skills.fc_backend.repository;

import com.skills.fc_backend.model.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlatformRepository extends JpaRepository<Platform, Long> {
    Optional<Platform> findByNombreIgnoreCase(String nombre);
}
