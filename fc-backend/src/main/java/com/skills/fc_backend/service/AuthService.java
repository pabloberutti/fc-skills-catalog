package com.skills.fc_backend.service;
import com.skills.fc_backend.dto.AuthRequestDTO;
import com.skills.fc_backend.dto.AuthResponseDTO;
import com.skills.fc_backend.exception.BadRequestException;
import com.skills.fc_backend.exception.ResourceNotFoundException;
import com.skills.fc_backend.model.AppUser;
import com.skills.fc_backend.model.Role;
import com.skills.fc_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponseDTO registrar(AuthRequestDTO dto) {
        if (userRepository.existsByUsername(dto.username())) {
            throw new BadRequestException("El nombre de usuario ya existe: " + dto.username());
        }

        AppUser usuario = new AppUser();
        usuario.setUsername(dto.username());
        usuario.setPassword(passwordEncoder.encode(dto.password()));
        usuario.setRole(Role.ROLE_USER);

        userRepository.save(usuario);
        return new AuthResponseDTO(usuario.getUsername(), usuario.getRole().name(), "Usuario registrado con éxito");
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(AuthRequestDTO dto) {
        AppUser usuario = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new ResourceNotFoundException("Credenciales no válidas"));

        if (!passwordEncoder.matches(dto.password(), usuario.getPassword())) {
            throw new BadRequestException("Credenciales no válidas");
        }

        return new AuthResponseDTO(usuario.getUsername(), usuario.getRole().name(), "Sesión iniciada correctamente");
    }
}
