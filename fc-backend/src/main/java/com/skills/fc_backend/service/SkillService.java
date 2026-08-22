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

    public List<Skill> obtenerTodasLasSkills() {
        return skillRepository.findAll();
    }

    public List<Skill> obtenerSkillsPorZona(Integer zonaId) {
        return skillRepository.findByZonaId(zonaId);
    }

    public Skill guardarSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public void eliminarSkill(Integer id) {
        skillRepository.deleteById(id);
    }

    public void registrarVista(Integer id) {
        Skill skill = skillRepository.findById(id).orElse(null);
        if (skill != null) {
            if (skill.getVistas() == null) skill.setVistas(0);
            skill.setVistas(skill.getVistas() + 1);
            skillRepository.save(skill);
        }
    }
}