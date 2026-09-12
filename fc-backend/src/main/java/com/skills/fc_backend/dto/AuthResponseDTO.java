package com.skills.fc_backend.dto;

public record AuthResponseDTO(
        String username,
        String role,
        String mensaje
) {}
