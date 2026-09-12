package com.skills.fc_backend.mapper;

import com.skills.fc_backend.dto.InputSequenceDTO;
import com.skills.fc_backend.dto.SkillMoveRequestDTO;
import com.skills.fc_backend.dto.SkillMoveResponseDTO;
import com.skills.fc_backend.exception.ResourceNotFoundException;
import com.skills.fc_backend.model.Category;
import com.skills.fc_backend.model.InputSequence;
import com.skills.fc_backend.model.Platform;
import com.skills.fc_backend.model.SkillMove;
import com.skills.fc_backend.repository.CategoryRepository;
import com.skills.fc_backend.repository.PlatformRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SkillMoveMapper {

    private final CategoryRepository categoryRepository;
    private final PlatformRepository platformRepository;

    public SkillMoveResponseDTO toDTO(SkillMove entity) {
        List<InputSequenceDTO> comandosDTO = entity.getComandos().stream()
                .map(cmd -> new InputSequenceDTO(cmd.getPlataforma().getNombre(), cmd.getComando()))
                .toList();

        return new SkillMoveResponseDTO(
                entity.getId(),
                entity.getNombre(),
                entity.getDescripcionTactico(),
                entity.getUrlVideo(),
                entity.getVistas(),
                entity.getCategoria().getNombre(),
                entity.getCategoria().getEstrellasRequeridas(),
                comandosDTO
        );
    }

    public SkillMove toEntity(SkillMoveRequestDTO dto) {
        Category categoria = categoryRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.categoriaId()));

        SkillMove entity = new SkillMove();
        entity.setNombre(dto.nombre());
        entity.setDescripcionTactico(dto.descripcionTactico());
        entity.setUrlVideo(dto.urlVideo());
        entity.setCategoria(categoria);
        entity.setVistas(0);

        if (dto.comandos() != null) {
            List<InputSequence> secuencias = dto.comandos().stream().map(c -> {
                Platform plataforma = platformRepository.findByNombreIgnoreCase(c.plataforma())
                        .orElseThrow(() -> new ResourceNotFoundException("Plataforma no válida: " + c.plataforma()));

                InputSequence seq = new InputSequence();
                seq.setSkillMove(entity);
                seq.setPlataforma(plataforma);
                seq.setComando(c.comando());
                return seq;
            }).toList();

            entity.setComandos(secuencias);
        }

        return entity;
    }
}
