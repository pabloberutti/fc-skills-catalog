package com.skills.fc_backend.dto;

import java.util.List;

public record SkillMoveRequestDTO(
        String nombre,
        String descripcionTactico,
        String urlVideo,
        Long categoriaId,
        List<InputSequenceDTO> comandos
) {}