package com.skills.fc_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "skills")
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String nombre;
    private Integer estrellas;

    // Le aclaramos cómo se llama la columna exacta en MySQL
    @Column(name = "url_video")
    private String urlVideo;

    @Column(name = "url_comando")
    private String urlComando;

    // Acá hacemos la "magia" relacional: Muchas skills pertenecen a una Zona
    @ManyToOne
    @JoinColumn(name = "zona_id")
    private Zona zona;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getEstrellas() { return estrellas; }
    public void setEstrellas(Integer estrellas) { this.estrellas = estrellas; }

    public String getUrlVideo() { return urlVideo; }
    public void setUrlVideo(String urlVideo) { this.urlVideo = urlVideo; }

    public String getUrlComando() { return urlComando; }
    public void setUrlComando(String urlComando) { this.urlComando = urlComando; }

    public Zona getZona() { return zona; }
    public void setZona(Zona zona) { this.zona = zona; }
}
