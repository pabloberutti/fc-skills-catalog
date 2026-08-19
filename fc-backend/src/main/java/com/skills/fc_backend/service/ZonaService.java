package com.skills.fc_backend.service;

import com.skills.fc_backend.model.Zona;
import com.skills.fc_backend.repository.ZonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZonaService {

    // @Autowired le dice a Spring que inyecte (conecte) el repositorio automáticamente
    @Autowired
    private ZonaRepository zonaRepository;

    // Método para devolver la lista de todas las zonas
    public List<Zona> obtenerTodasLasZonas() {
        return zonaRepository.findAll();
    }
}