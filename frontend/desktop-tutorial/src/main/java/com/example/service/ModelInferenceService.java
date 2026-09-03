package com.example.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ModelInferenceService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final Path modelPath;
    private final Path labelsPath;
    private final String[] classNames;
    private final Path pythonScriptPath;

    public ModelInferenceService(
            @Value("${crop.model.path:models/crop_model.pt}") String modelPath,
            @Value("${crop.model.classes:}") String classNames) {
        this.modelPath = Path.of(modelPath).toAbsolutePath().normalize();
        this.labelsPath = this.modelPath.resolveSibling("classes.txt").toAbsolutePath().normalize();
        this.classNames = resolveClassNames(classNames);
        this.pythonScriptPath = resolvePythonScriptPath();
    }

    private String[] resolveClassNames(String configuredClassNames) {
        if (!configuredClassNames.isBlank()) {
            return configuredClassNames.split(",");
        }
        if (!Files.isRegularFile(labelsPath)) {
            return new String[0];
        }
        try {
            List<String> labels = Files.readAllLines(labelsPath).stream()
                    .map(String::trim)
                    .filter(label -> !label.isEmpty())
                    .toList();
            return labels.toArray(String[]::new);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read model labels: " + labelsPath, exception);
        }
    }

    private Path resolvePythonScriptPath() {
        try {
            ClassPathResource resource = new ClassPathResource("infer_crop_model.py");
            Path temp = Files.createTempFile("crop-model-inference-", ".py");
            try (var inputStream = resource.getInputStream()) {
                Files.copy(inputStream, temp, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            return temp.toAbsolutePath().normalize();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to locate the Python inference script in the application resources.", exception);
        }
    }

    public Map<String, Double> predict(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("An image file is required");
        }
        if (!Files.isRegularFile(modelPath)) {
            throw new IllegalStateException("Model file not found: " + modelPath);
        }

        try (var input = image.getInputStream()) {
            BufferedImage decoded = ImageIO.read(input);
            if (decoded == null || decoded.getWidth() < 160 || decoded.getHeight() < 160) {
                throw new IllegalArgumentException("The image is too small or cannot be read. Upload a clear crop leaf photo.");
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("The image could not be read. Upload a JPG or PNG crop leaf photo.", exception);
        }

        Path tempImage = null;
        try {
            tempImage = Files.createTempFile("crop-disease-", ".png");
            Files.write(tempImage, image.getBytes());

            String pythonExecutable = resolvePythonExecutable();
            Process process = new ProcessBuilder(
                    pythonExecutable,
                    pythonScriptPath.toString(),
                    "--model", modelPath.toString(),
                    "--labels", labelsPath.toString(),
                    "--image", tempImage.toString())
                    .redirectErrorStream(true)
                    .start();

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IllegalStateException("Python inference failed with exit code " + exitCode + ": " + output);
            }

            Map<String, Double> probabilities = OBJECT_MAPPER.readValue(output, new TypeReference<>() {});
            if (probabilities == null || probabilities.isEmpty()) {
                throw new IllegalStateException("Python inference returned no prediction output.");
            }

            if (classNames.length > 0 && classNames.length != probabilities.size()) {
                throw new IllegalStateException("Model outputs " + probabilities.size()
                        + " classes, but labels file contains " + classNames.length);
            }

            Map<String, Double> ordered = new LinkedHashMap<>();
            probabilities.entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .forEach(entry -> ordered.put(entry.getKey(), entry.getValue()));
            return ordered;
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Unable to run crop model inference", exception);
        } finally {
            if (tempImage != null) {
                try {
                    Files.deleteIfExists(tempImage);
                } catch (IOException ignored) {
                    // Best effort cleanup for temporary model input.
                }
            }
        }
    }

    private String resolvePythonExecutable() {
        String configured = System.getenv("PYTHON_EXE");
        if (configured != null && !configured.isBlank()) {
            return configured;
        }

        String[] candidates = new String[] {
                "C:/Users/admin/AppData/Local/Programs/Python/Python312/python.exe",
                "C:/Users/admin/AppData/Local/Programs/Python/Python313/python.exe",
                "C:/Program Files/Python312/python.exe",
                "C:/Program Files/Python313/python.exe",
                "python",
                "python3",
                "py"
        };

        for (String candidate : candidates) {
            if (candidate == null || candidate.isBlank()) {
                continue;
            }
            if (candidate.equals("py")) {
                try {
                    Process process = new ProcessBuilder("py", "-3", "--version").redirectErrorStream(true).start();
                    int exitCode = process.waitFor();
                    if (exitCode == 0) {
                        return "py";
                    }
                } catch (IOException | InterruptedException ignored) {
                    // Try next option.
                }
                continue;
            }

            Path candidatePath = Path.of(candidate);
            if (Files.isRegularFile(candidatePath)) {
                return candidatePath.toString();
            }

            if (candidate.contains("/") || candidate.contains("\\")) {
                continue;
            }

            try {
                Process process = new ProcessBuilder(candidate, "--version").redirectErrorStream(true).start();
                int exitCode = process.waitFor();
                if (exitCode == 0) {
                    return candidate;
                }
            } catch (IOException | InterruptedException ignored) {
                // Try next option.
            }
        }

        return "python";
    }
}