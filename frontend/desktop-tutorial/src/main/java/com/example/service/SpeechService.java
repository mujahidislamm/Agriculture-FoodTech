package com.example.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.vosk.Model;
import org.vosk.Recognizer;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SpeechService {

    private static final List<String> MODEL_PATHS = List.of(
            "vosk-model-small-en-us-0.15",
            "../../vosk-model-small-en-us-0.15",
            "../vosk-model-small-en-us-0.15",
            "D:/vosk-model-small-en-us-0.15",
            "C:/vosk-model-small-en-us-0.15",
            "/opt/vosk-model-small-en-us-0.15"
    );

    public String transcribe(MultipartFile audio) throws IOException {
        if (audio == null || audio.isEmpty()) {
            throw new IllegalArgumentException("Audio recording is required.");
        }

        String resolvedModelPath = resolveModelPath();
        if (resolvedModelPath == null) {
            throw new IllegalStateException("Speech model is missing. Download the Vosk English model to the project root.");
        }

        byte[] pcm = toPcm(audio.getBytes());
        if (pcm.length == 0) {
            throw new IllegalArgumentException("The uploaded audio could not be decoded.");
        }

        try (Model model = new Model(resolvedModelPath);
             Recognizer recognizer = new Recognizer(model, 16000.0f)) {
            recognizer.acceptWaveForm(pcm, pcm.length);
            String result = recognizer.getFinalResult();
            String transcript = extractText(result);
            if (transcript.isBlank()) {
                transcript = extractText(recognizer.getResult());
            }
            return transcript;
        }
    }

    private String resolveModelPath() {
        for (String path : MODEL_PATHS) {
            java.io.File file = new java.io.File(path);
            if (file.exists() && file.isDirectory()) {
                return path;
            }
        }
        return null;
    }

    private byte[] toPcm(byte[] recordedBytes) throws IOException {
        try (ByteArrayInputStream input = new ByteArrayInputStream(recordedBytes);
             AudioInputStream original = AudioSystem.getAudioInputStream(input)) {
            AudioFormat targetFormat = new AudioFormat(16000.0f, 16, 1, true, false);
            try (AudioInputStream pcmStream = AudioSystem.getAudioInputStream(targetFormat, original);
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int read;
                while ((read = pcmStream.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                return out.toByteArray();
            }
        } catch (Exception ex) {
            return recordedBytes;
        }
    }

    private String extractText(String json) {
        if (json == null || json.isBlank()) {
            return "";
        }

        Matcher matcher = Pattern.compile("\\\"text\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"])*?)\\\"")
                .matcher(json);
        if (matcher.find()) {
            String text = matcher.group(1).replace("\\n", " ").replace("\\\"", "\"");
            return text.trim();
        }

        return "";
    }
}
