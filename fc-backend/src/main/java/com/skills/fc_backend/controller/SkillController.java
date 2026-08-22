package com.skills.fc_backend.controller;

import com.skills.fc_backend.model.Skill;
import com.skills.fc_backend.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.web.multipart.MultipartFile;

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

    // Ruta para CREAR una skill nueva (POST)
    @PostMapping
    public Skill crearSkill(@RequestBody Skill skill) {
        return skillService.guardarSkill(skill);
    }

    // Ruta para ACTUALIZAR una skill existente (PUT)
    @PutMapping("/{id}")
    public Skill actualizarSkill(@PathVariable Integer id, @RequestBody Skill skill) {
        // Nos aseguramos de que el ID de la URL coincida con el que vamos a guardar
        skill.setId(id);
        return skillService.guardarSkill(skill);
    }

    // Ruta para BORRAR una skill (DELETE)
    @DeleteMapping("/{id}")
    public void eliminarSkill(@PathVariable Integer id) {
        skillService.eliminarSkill(id);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/upload")
    public String subirVideo(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Agarramos el nombre original
            String nombreOriginal = file.getOriginalFilename();

            // 2. Reemplazamos los espacios por guiones medios
            assert nombreOriginal != null;
            String nombreLimpio = nombreOriginal.replace(" ", "-");

            String directorio = "P:/fc-skills-catalog/frontend/assets/videos/";
            Path ruta = Paths.get(directorio + nombreLimpio);

            Files.createDirectories(ruta.getParent());
            Files.write(ruta, file.getBytes());

            System.out.println("✅ VIDEO GUARDADO EN: " + ruta.toAbsolutePath());

            // 3. Devolvemos la ruta limpia a la base de datos
            return "assets/videos/" + nombreLimpio;

        } catch (Exception e) {
            System.out.println("❌ ERROR: " + e.getMessage());
            throw new RuntimeException("Error al subir el archivo");
        }
    }

    // Ruta invisible para sumar +1 a las vistas
    @CrossOrigin(origins = "*") // Por si acaso para que no bloquee la web
    @PutMapping("/{id}/vista")
    public void registrarVista(@PathVariable Integer id) {
        skillService.registrarVista(id);
    }
}