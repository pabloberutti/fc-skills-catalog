package com.skills.fc_backend.config;

import com.skills.fc_backend.model.*;
import com.skills.fc_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PlatformRepository platformRepository;
    private final CategoryRepository categoryRepository;
    private final SkillMoveRepository skillMoveRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        inicializarUsuarios();
        inicializarCatalogo();
    }

    private void inicializarUsuarios() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            AppUser admin = new AppUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("wolfo").isEmpty()) {
            AppUser user = new AppUser();
            user.setUsername("wolfo");
            user.setPassword(passwordEncoder.encode("wolfo123"));
            user.setRole(Role.ROLE_USER);
            userRepository.save(user);
        }
    }

    private void inicializarCatalogo() {
        if (skillMoveRepository.count() > 0) return;

        // Plataformas
        Platform ps = platformRepository.findByNombreIgnoreCase("PlayStation")
                .orElseGet(() -> platformRepository.save(new Platform(null, "PlayStation")));
        Platform xbox = platformRepository.findByNombreIgnoreCase("Xbox")
                .orElseGet(() -> platformRepository.save(new Platform(null, "Xbox")));

        // Categorías
        Category cat5 = categoryRepository.save(new Category(null, "Regates de 5 Estrellas", 5));
        Category cat4 = categoryRepository.save(new Category(null, "Regates de 4 Estrellas", 4));
        Category catBanda = categoryRepository.save(new Category(null, "Fundamentales de Banda", 3));
        Category catArea = categoryRepository.save(new Category(null, "Definición en Área", 3));

        // 1. Elástica
        SkillMove elastica = new SkillMove();
        elastica.setNombre("Elástica");
        elastica.setDescripcionTactico("Movimiento letal en 1v1 para desbordar por banda o perfilarse al remate dentro del área.");
        elastica.setUrlVideo("assets/videos/elastica.mp4");
        elastica.setVistas(24);
        elastica.setCategoria(cat5);
        elastica.setComandos(List.of(
                new InputSequence(null, elastica, ps, "RS(3,9,CW)"),
                new InputSequence(null, elastica, xbox, "RS(3,9,CW)")
        ));
        skillMoveRepository.save(elastica);

        // 2. Ball Roll
        SkillMove ballRoll = new SkillMove();
        ballRoll.setNombre("Ball Roll");
        ballRoll.setDescripcionTactico("Permite abrir líneas de pase y cambiar el ángulo de tiro frente a la salida del arquero.");
        ballRoll.setUrlVideo("assets/videos/elastica.mp4");
        ballRoll.setVistas(31);
        ballRoll.setCategoria(catArea);
        ballRoll.setComandos(List.of(
                new InputSequence(null, ballRoll, ps, "RS ➡ (MANTENER) OR RS ⬆ (MANTENER)"),
                new InputSequence(null, ballRoll, xbox, "RS ➡ (MANTENER) OR RS ⬆ (MANTENER)")
        ));
        skillMoveRepository.save(ballRoll);

        // 3. Ruleta Marsellesa
        SkillMove ruleta = new SkillMove();
        ruleta.setNombre("Ruleta");
        ruleta.setDescripcionTactico("Giro de 360 grados ideal para eludir entradas frontales y cambiar el ángulo de ataque.");
        ruleta.setUrlVideo("assets/videos/elastica.mp4");
        ruleta.setVistas(19);
        ruleta.setCategoria(cat4);
        ruleta.setComandos(List.of(
                new InputSequence(null, ruleta, ps, "RS(6,12,CW) OR RS(6,12,CCW)"),
                new InputSequence(null, ruleta, xbox, "RS(6,12,CW) OR RS(6,12,CCW)")
        ));
        skillMoveRepository.save(ruleta);

        // 4. McGeady Spin
        SkillMove mcGeady = new SkillMove();
        mcGeady.setNombre("McGeady Spin");
        mcGeady.setDescripcionTactico("Giro rápido en 90 grados para cortar hacia adentro desde la banda y rematar con pierna cambiada.");
        mcGeady.setUrlVideo("assets/videos/elastica.mp4");
        mcGeady.setVistas(42);
        mcGeady.setCategoria(cat5);
        mcGeady.setComandos(List.of(
                new InputSequence(null, mcGeady, ps, "RS ⬆ + RS ➡"),
                new InputSequence(null, mcGeady, xbox, "RS ⬆ + RS ➡")
        ));
        skillMoveRepository.save(mcGeady);

        // 5. Cola de Vaca
        SkillMove colaVaca = new SkillMove();
        colaVaca.setNombre("Cola de Vaca");
        colaVaca.setDescripcionTactico("Falso remate con frenada en seco y aceleración explosiva hacia el perfil opuesto.");
        colaVaca.setUrlVideo("assets/videos/elastica.mp4");
        colaVaca.setVistas(15);
        colaVaca.setCategoria(cat5);
        colaVaca.setComandos(List.of(
                new InputSequence(null, colaVaca, ps, "■ + ✖ + LS ⬇"),
                new InputSequence(null, colaVaca, xbox, "X + A + LS ⬇")
        ));
        skillMoveRepository.save(colaVaca);

        // 6. Regate del R1+L1
        SkillMove r1l1 = new SkillMove();
        r1l1.setNombre("Regate del R1+L1");
        r1l1.setDescripcionTactico("Es muy útil para cancelarlo con un pase o engañar en el área ganando unos metros.");
        r1l1.setUrlVideo("assets/videos/elastica.mp4");
        r1l1.setVistas(37);
        r1l1.setCategoria(cat4);
        r1l1.setComandos(List.of(
                new InputSequence(null, r1l1, ps, "L1 (MANTENER) + R1 (MANTENER) + RS ⬆"),
                new InputSequence(null, r1l1, xbox, "LB (MANTENER) + RB (MANTENER) + RS ⬆")
        ));
        skillMoveRepository.save(r1l1);
    }
}
