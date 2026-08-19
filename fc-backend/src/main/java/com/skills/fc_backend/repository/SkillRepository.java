package com.skills.fc_backend.repository;

import com.skills.fc_backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Integer> {
    // Solo con ponerle este nombre en inglés al metod0,
    // Spring crea el SQL automaticamente para filtrar por zona.
    List<Skill> findByZonaId(Integer zonaId);
}
