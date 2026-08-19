package com.skills.fc_backend.controller;

import com.skills.fc_backend.model.Skill;
import com.skills.fc_backend.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
public class SkillController {

    @Autowired
    private SkillService skillService;

    // Ruta para pedir T0do el catálogo
    @GetMapping
    public List<Skill> obtenerTodas() {
        return skillService.obtenerTodasLasSkills();
    }

    // Ruta para pedir skills filtradas por zona
    @GetMapping("/zona/{zonaId}")
    public List<Skill> obtenerPorZona(@PathVariable Integer zonaId) {
        return skillService.obtenerSkillsPorZona(zonaId);
    }
}