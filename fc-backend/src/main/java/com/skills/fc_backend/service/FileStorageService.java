package com.skills.fc_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:frontend/assets/videos}")
    private String uploadDir;

    public String guardarVideo(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo de video no puede estar vacío");
        }

        try {
            Path directorioDestino = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(directorioDestino)) {
                Files.createDirectories(directorioDestino);
            }

            String nombreOriginal = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "video.mp4");
            String extension = nombreOriginal.contains(".") ? nombreOriginal.substring(nombreOriginal.lastIndexOf(".")) : ".mp4";
            String nombreFinal = UUID.randomUUID().toString() + extension;

            Path rutaDestino = directorioDestino.resolve(nombreFinal);
            Files.copy(file.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

            // Retorna la ruta relativa que consume el frontend/Nginx
            return "assets/videos/" + nombreFinal;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo de video en el servidor", e);
        }
    }
}
