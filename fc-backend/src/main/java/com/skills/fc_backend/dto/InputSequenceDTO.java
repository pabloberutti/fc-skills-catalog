package com.skills.fc_backend.dto;

public record InputSequenceDTO(
        String plataforma, // "PlayStation", "Xbox", "PC"
        String comando     // Ej: "L1 + RS ➡"
) {}