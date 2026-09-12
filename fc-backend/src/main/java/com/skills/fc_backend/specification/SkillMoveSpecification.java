package com.skills.fc_backend.specification;

import com.skills.fc_backend.model.SkillMove;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class SkillMoveSpecification {

    public static Specification<SkillMove> filtrar(String nombre, Integer estrellas, Long categoriaId, String plataforma) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro parcial por nombre (case-insensitive)
            if (nombre != null && !nombre.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nombre")), "%" + nombre.toLowerCase() + "%"));
            }

            // 2. Filtro exacto por estrellas requeridas
            if (estrellas != null) {
                predicates.add(cb.equal(root.get("categoria").get("estrellasRequeridas"), estrellas));
            }

            // 3. Filtro por categoría específica
            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }

            // 4. Filtro por plataforma (PlayStation / Xbox)
            if (plataforma != null && !plataforma.isBlank()) {
                Join<Object, Object> comandosJoin = root.join("comandos");
                predicates.add(cb.equal(cb.lower(comandosJoin.get("plataforma").get("nombre")), plataforma.toLowerCase()));
                query.distinct(true); // Evita duplicados en el join
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
