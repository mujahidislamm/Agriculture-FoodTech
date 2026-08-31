package com.example.service;

import ai.djl.inference.Predictor;
import ai.djl.modality.cv.Image;
import ai.djl.modality.cv.ImageFactory;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.translate.TranslateException;
import ai.djl.translate.Translator;
import ai.djl.translate.TranslatorContext;
import ai.djl.ndarray.NDArray;
import ai.djl.ndarray.NDList;
import ai.djl.ndarray.types.Shape;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ModelInferenceService {

    private final Path modelPath;
    private final String[] classNames;
    private volatile ZooModel<Image, float[]> model;

    public ModelInferenceService(
            @Value("${crop.model.path:models/crop_model.pt}") String modelPath,
            @Value("${crop.model.classes:}") String classNames) {
        this.modelPath = Path.of(modelPath);
        this.classNames = resolveClassNames(classNames);
    }

    private String[] resolveClassNames(String configuredClassNames) {
        if (!configuredClassNames.isBlank()) {
            return configuredClassNames.split(",");
        }
        Path labelsPath = modelPath.resolveSibling("classes.txt");
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

    public Map<String, Double> predict(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("An image file is required");
        }

        try {
            Image input = ImageFactory.getInstance().fromInputStream(image.getInputStream());
            try (Predictor<Image, float[]> predictor = getModel().newPredictor()) {
                float[] scores = predictor.predict(input);
                return probabilities(scores);
            }
        } catch (IOException | TranslateException exception) {
            throw new IllegalStateException("Unable to run crop model inference", exception);
        }
    }

    public boolean hasDatasetCoverage(String cropType) {
        if (cropType == null || cropType.isBlank()) return false;
        String crop = cropType.toLowerCase();
        String aliases = switch (crop) {
            case "maize" -> "maize corn";
            case "chilli" -> "chilli pepper bell_pepper";
            case "brinjal" -> "brinjal eggplant aubergine";
            default -> crop;
        };
        return java.util.Arrays.stream(classNames)
                .map(String::toLowerCase)
                .anyMatch(label -> java.util.Arrays.stream(aliases.split(" "))
                        .anyMatch(label::contains));
    }

    private ZooModel<Image, float[]> getModel() {
        ZooModel<Image, float[]> loaded = model;
        if (loaded == null) {
            synchronized (this) {
                loaded = model;
                if (loaded == null) {
                    if (!Files.isRegularFile(modelPath)) {
                        throw new IllegalStateException("Model file not found: " + modelPath);
                    }
                    try {
                        Criteria<Image, float[]> criteria = Criteria.builder()
                                .setTypes(Image.class, float[].class)
                                .optModelPath(modelPath)
                                .optEngine("PyTorch")
                                .optTranslator(new ImageTranslator())
                                .build();
                        model = loaded = criteria.loadModel();
                    } catch (Exception exception) {
                        throw new IllegalStateException("Unable to load crop model: " + modelPath, exception);
                    }
                }
            }
        }
        return loaded;
    }

    private Map<String, Double> probabilities(float[] scores) {
        double max = Double.NEGATIVE_INFINITY;
        for (float score : scores) {
            max = Math.max(max, score);
        }
        double total = 0;
        double[] normalized = new double[scores.length];
        for (int index = 0; index < scores.length; index++) {
            normalized[index] = Math.exp(scores[index] - max);
            total += normalized[index];
        }
        Map<String, Double> result = new LinkedHashMap<>();
        if (classNames.length > 0 && classNames.length != scores.length) {
            throw new IllegalStateException("Model outputs " + scores.length
                + " classes, but labels file contains " + classNames.length);
        }
        for (int index = 0; index < scores.length; index++) {
            String className = index < classNames.length ? classNames[index].trim() : "class-" + index;
            result.put(className, normalized[index] / total);
        }
        return result;
    }

    private static final class ImageTranslator implements Translator<Image, float[]> {
        @Override
        public NDList processInput(TranslatorContext context, Image input) {
            var manager = context.getNDManager();
            NDArray mean = manager.create(new float[]{0.485f, 0.456f, 0.406f}, new Shape(3, 1, 1));
            NDArray standardDeviation = manager.create(
                new float[]{0.229f, 0.224f, 0.225f}, new Shape(3, 1, 1));
            NDArray array = input.resize(224, 224, false)
                    .toNDArray(context.getNDManager(), Image.Flag.COLOR)
                    .toType(ai.djl.ndarray.types.DataType.FLOAT32, false)
                    .div(255f)
                    .transpose(2, 0, 1)
                    .reshape(new ai.djl.ndarray.types.Shape(3, 224, 224));
            array = array.sub(mean).div(standardDeviation);
            return new NDList(array);
        }

        @Override
        public float[] processOutput(TranslatorContext context, NDList list) {
            return list.singletonOrThrow().toFloatArray();
        }
    }
}