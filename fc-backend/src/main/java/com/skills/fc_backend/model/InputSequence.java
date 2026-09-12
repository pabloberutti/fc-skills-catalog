package com.skills.fc_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "secuencias_comando")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InputSequence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private SkillMove skillMove;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plataforma_id", nullable = false)
    private Platform plataforma;

    @Column(nullable = false, length = 255)
    private String comando; // Ej: "R1 + RS ➡" en PS vs "RB + RS ➡" en Xbox
}
