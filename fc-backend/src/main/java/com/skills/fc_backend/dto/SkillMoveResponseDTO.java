package com.skills.fc_backend.dto;

import java.util.List;

public record SkillMoveResponseDTO(
        Long id,
        String nombre,
        String descripcionTactico,
        String urlVideo,
        Integer vistas,
        String categoria,
        Integer estrellas,
        List<InputSequenceDTO> comandos
) {}