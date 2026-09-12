package com.skills.fc_backend.controller;

import com.skills.fc_backend.dto.SkillMoveRequestDTO;
import com.skills.fc_backend.dto.SkillMoveResponseDTO;
import com.skills.fc_backend.service.FileStorageService;
import com.skills.fc_backend.service.SkillMoveService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(
        origins = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS}
)
@RequiredArgsConstructor
public class SkillMoveController {

    private final SkillMoveService skillMoveService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<SkillMoveResponseDTO>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Integer estrellas,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String plataforma,
            @ParameterObject @PageableDefault(size = 10, sort = "id") Pageable pageable) {

        return ResponseEntity.ok(skillMoveService.listarTodas(nombre, estrellas, categoriaId, plataforma, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SkillMoveResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(skillMoveService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<SkillMoveResponseDTO> crear(@RequestBody SkillMoveRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillMoveService.crear(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        skillMoveService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/vista")
    public ResponseEntity<Void> registrarVista(@PathVariable Long id) {
        skillMoveService.registrarVista(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favorito")
    public ResponseEntity<Void> toggleFavorito(
            @PathVariable Long id,
            @RequestParam String username) {
        skillMoveService.toggleFavorito(id, username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/favoritos")
    public ResponseEntity<java.util.List<SkillMoveResponseDTO>> listarFavoritos(
            @RequestParam String username) {
        return ResponseEntity.ok(skillMoveService.listarFavoritos(username));
    }

    @PostMapping(value = "/upload-video", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<java.util.Map<String, String>> subirVideo(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String rutaRelativa = fileStorageService.guardarVideo(file);
        return ResponseEntity.ok(java.util.Map.of("urlVideo", rutaRelativa));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillMoveResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestBody SkillMoveRequestDTO dto) {
        return ResponseEntity.ok(skillMoveService.actualizar(id, dto));
    }
}
