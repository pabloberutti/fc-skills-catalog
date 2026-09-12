package com.skills.fc_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre; // Ej: "Regates de 5 Estrellas", "Fintas de Cuerpo"

    @Column(nullable = false)
    private Integer estrellasRequeridas; // 1 a 5
}
