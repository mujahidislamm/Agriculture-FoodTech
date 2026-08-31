package com.example;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.SwingWorker;

/** Simple online image recognition client using Azure AI Vision. */
public class imgrecog {

    private static final String API_VERSION = "2024-02-01";
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    private final JFrame frame = new JFrame("Online Image Recognition");
    private final JLabel imagePreview = new JLabel("Choose an image to begin", SwingConstants.CENTER);
    private final JLabel statusLabel = new JLabel("Ready");
    private final JTextArea resultArea = new JTextArea();
    private final JButton chooseButton = new JButton("Choose image");
    private final JButton analyzeButton = new JButton("Analyze online");
    private Path selectedImage;

    /** Starts the image recognition frontend. */
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new imgrecog().show());
    }

    private void show() {
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(900, 650);
        frame.setMinimumSize(new Dimension(700, 520));
        frame.setLocationRelativeTo(null);

        JPanel root = new JPanel(new BorderLayout(14, 14));
        root.setBorder(BorderFactory.createEmptyBorder(18, 18, 18, 18));

        JLabel title = new JLabel("ONLINE IMAGE RECOGNITION");
        title.setFont(new Font("Segoe UI", Font.BOLD, 24));
        root.add(title, BorderLayout.NORTH);

        imagePreview.setPreferredSize(new Dimension(360, 360));
        imagePreview.setBorder(BorderFactory.createEtchedBorder());
        root.add(imagePreview, BorderLayout.WEST);

        resultArea.setEditable(false);
        resultArea.setLineWrap(true);
        resultArea.setWrapStyleWord(true);
        resultArea.setFont(new Font("Consolas", Font.PLAIN, 13));
        resultArea.setText("Recognition results will appear here.");
        root.add(new JScrollPane(resultArea), BorderLayout.CENTER);

        chooseButton.addActionListener(event -> chooseImage());
        analyzeButton.setEnabled(false);
        analyzeButton.addActionListener(event -> analyzeImage());

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.LEFT));
        buttons.add(chooseButton);
        buttons.add(analyzeButton);
        buttons.add(statusLabel);
        root.add(buttons, BorderLayout.SOUTH);

        frame.setContentPane(root);
        frame.setVisible(true);
    }

    private void chooseImage() {
        JFileChooser chooser = new JFileChooser();
        chooser.setDialogTitle("Choose an image");
        if (chooser.showOpenDialog(frame) != JFileChooser.APPROVE_OPTION) {
            return;
        }

        Path image = chooser.getSelectedFile().toPath();
        try {
            BufferedImage source = ImageIO.read(image.toFile());
            if (source == null) {
                throw new IOException("The selected file is not a supported image.");
            }
            selectedImage = image;
            Image scaled = source.getScaledInstance(340, 340, Image.SCALE_SMOOTH);
            imagePreview.setText("");
            imagePreview.setIcon(new javax.swing.ImageIcon(scaled));
            analyzeButton.setEnabled(true);
            statusLabel.setText("Selected: " + image.getFileName());
        } catch (IOException exception) {
            showError(exception.getMessage());
        }
    }

    private void analyzeImage() {
        String endpoint = System.getenv("AZURE_VISION_ENDPOINT");
        String key = System.getenv("AZURE_VISION_KEY");
        if (endpoint == null || endpoint.isBlank() || key == null || key.isBlank()) {
            showError("Set AZURE_VISION_ENDPOINT and AZURE_VISION_KEY before analyzing an image.");
            return;
        }

        chooseButton.setEnabled(false);
        analyzeButton.setEnabled(false);
        statusLabel.setText("Analyzing online...");
        resultArea.setText("Sending image to Azure AI Vision...");

        new SwingWorker<String, Void>() {
            @Override
            protected String doInBackground() throws Exception {
                return sendToAzure(endpoint, key, selectedImage);
            }

            @Override
            protected void done() {
                chooseButton.setEnabled(true);
                analyzeButton.setEnabled(selectedImage != null);
                try {
                    resultArea.setText(formatJson(get()));
                    statusLabel.setText("Analysis complete");
                } catch (Exception exception) {
                    statusLabel.setText("Analysis failed");
                    showError(exception.getMessage());
                }
            }
        }.execute();
    }

    private String sendToAzure(String endpoint, String key, Path image) throws IOException, InterruptedException {
        String normalizedEndpoint = endpoint.endsWith("/")
                ? endpoint.substring(0, endpoint.length() - 1)
                : endpoint;
        String url = normalizedEndpoint
                + "/computervision/imageanalysis:analyze?api-version=" + API_VERSION
                + "&features=caption,tags,objects,read";

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Ocp-Apim-Subscription-Key", key)
                .header("Content-Type", contentType(image))
                .POST(HttpRequest.BodyPublishers.ofFile(image))
                .build();
        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) {
            throw new IOException("Azure Vision returned HTTP " + response.statusCode() + ": " + response.body());
        }
        return response.body();
    }

    private String contentType(Path image) throws IOException {
        String type = Files.probeContentType(image);
        return type == null || !type.startsWith("image/") ? "application/octet-stream" : type;
    }

    private String formatJson(String json) {
        return json.replace(",\"", ",\n\"")
                .replace("{\"", "{\n\"")
                .replace("}", "\n}");
    }

    private void showError(String message) {
        JOptionPane.showMessageDialog(frame, message, "Image recognition error", JOptionPane.ERROR_MESSAGE);
    }
}
