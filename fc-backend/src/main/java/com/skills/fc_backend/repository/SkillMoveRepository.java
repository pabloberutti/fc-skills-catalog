package com.skills.fc_backend.repository;

import com.skills.fc_backend.model.SkillMove;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SkillMoveRepository extends JpaRepository<SkillMove, Long>, JpaSpecificationExecutor<SkillMove> {
    boolean existsByNombreIgnoreCase(String nombre);
}
