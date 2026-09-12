package com.skills.fc_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "plataformas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Platform {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre; // Ej: "PlayStation", "Xbox", "PC"
}
