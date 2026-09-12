package com.skills.fc_backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SkillMove {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcionTactico;

    @Column(nullable = false)
    private String urlVideo;

    @Column(nullable = false)
    private Integer vistas = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Category categoria;

    @OneToMany(mappedBy = "skillMove", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InputSequence> comandos = new ArrayList<>();
}