package com.skills.fc_backend.service;

import com.skills.fc_backend.model.Skill;
import com.skills.fc_backend.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    // Método 1: Trae el catálogo completo
    public List<Skill> obtenerTodasLasSkills() {
        return skillRepository.findAll();
    }

    // Método 2: Trae solo las skills de la zona que le pidamos
    public List<Skill> obtenerSkillsPorZona(Integer zonaId) {
        return skillRepository.findByZonaId(zonaId);
    }
}