package com.skills.fc_backend.controller;

import com.skills.fc_backend.model.Zona;
import com.skills.fc_backend.service.ZonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zonas")
@CrossOrigin(origins = "*") // Esto le da permiso a la web local (HTML) para leer estos datos sin que el navegador la bloquee.
public class ZonaController {

    @Autowired
    private ZonaService zonaService;

    @GetMapping
    public List<Zona> obtenerZonas() {
        return zonaService.obtenerTodasLasZonas();
    }
}