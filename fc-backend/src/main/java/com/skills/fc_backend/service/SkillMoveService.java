package com.skills.fc_backend.service;

import com.skills.fc_backend.dto.SkillMoveRequestDTO;
import com.skills.fc_backend.dto.SkillMoveResponseDTO;
import com.skills.fc_backend.exception.BadRequestException;
import com.skills.fc_backend.exception.ResourceNotFoundException;
import com.skills.fc_backend.mapper.SkillMoveMapper;
import com.skills.fc_backend.model.*;
import com.skills.fc_backend.repository.CategoryRepository;
import com.skills.fc_backend.repository.PlatformRepository;
import com.skills.fc_backend.repository.SkillMoveRepository;
import com.skills.fc_backend.repository.UserRepository;
import com.skills.fc_backend.specification.SkillMoveSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillMoveService {

    private final SkillMoveRepository skillMoveRepository;
    private final SkillMoveMapper mapper;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PlatformRepository platformRepository;


    @Transactional(readOnly = true)
    public Page<SkillMoveResponseDTO> listarTodas(String nombre, Integer estrellas, Long categoriaId, String plataforma, Pageable pageable) {
        var spec = SkillMoveSpecification.filtrar(nombre, estrellas, categoriaId, plataforma);
        return skillMoveRepository.findAll(spec, pageable).map(mapper::toDTO);
    }

    @Transactional(readOnly = true)
    public SkillMoveResponseDTO obtenerPorId(Long id) {
        SkillMove entity = skillMoveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill no encontrada con ID: " + id));
        return mapper.toDTO(entity);
    }

    @Transactional
    public SkillMoveResponseDTO crear(SkillMoveRequestDTO request) {
        if (skillMoveRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new BadRequestException("Ya existe una skill registrada con el nombre: " + request.nombre());
        }
        SkillMove nueva = mapper.toEntity(request);
        return mapper.toDTO(skillMoveRepository.save(nueva));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!skillMoveRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill no encontrada con ID: " + id);
        }
        skillMoveRepository.deleteById(id);
    }

    @Transactional
    public void registrarVista(Long id) {
        SkillMove skill = skillMoveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill no encontrada con ID: " + id));
        skill.setVistas(skill.getVistas() + 1);
        skillMoveRepository.save(skill);
    }

    @Transactional
    public void toggleFavorito(Long skillId, String username) {
        AppUser usuario = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        SkillMove skill = skillMoveRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill no encontrada con ID: " + skillId));

        if (usuario.getFavoritos().contains(skill)) {
            usuario.getFavoritos().remove(skill);
        } else {
            usuario.getFavoritos().add(skill);
        }
        userRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public java.util.List<SkillMoveResponseDTO> listarFavoritos(String username) {
        AppUser usuario = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        return usuario.getFavoritos().stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Transactional
    public SkillMoveResponseDTO actualizar(Long id, SkillMoveRequestDTO dto) {
        SkillMove skill = skillMoveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill no encontrada con ID: " + id));

        Category categoria = categoryRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        skill.setNombre(dto.nombre());
        skill.setCategoria(categoria);
        skill.setUrlVideo(dto.urlVideo());
        skill.setDescripcionTactico(dto.descripcionTactico());

        // Limpiar comandos previos y reasignar los actualizados
        skill.getComandos().clear();
        if (dto.comandos() != null) {
            for (var cmdDTO : dto.comandos()) {
                Platform p = platformRepository.findByNombreIgnoreCase(cmdDTO.plataforma())
                        .orElseGet(() -> platformRepository.save(new Platform(null, cmdDTO.plataforma())));
                skill.getComandos().add(new InputSequence(null, skill, p, cmdDTO.comando()));
            }
        }

        return mapper.toDTO(skillMoveRepository.save(skill));
    }
}
