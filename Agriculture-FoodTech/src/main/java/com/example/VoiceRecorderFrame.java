package com.example;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;

/** Swing frontend for the speech recognition backend. */
public class VoiceRecorderFrame extends JFrame {

    private static final Color BACKGROUND = new Color(22, 28, 36);
    private static final Color PANEL = new Color(31, 40, 51);
    private static final Color TEXT = new Color(232, 238, 245);
    private static final Color MUTED = new Color(157, 170, 185);
    private static final Color ACCENT = new Color(74, 180, 115);

    private final SpeechRecognitionBackend backend = new SpeechRecognitionBackend();
    private final JLabel stateLabel = new JLabel("Ready", SwingConstants.CENTER);
    private final JLabel levelLabel = new JLabel("Mic level: 0", SwingConstants.CENTER);
    private final JTextArea transcript = new JTextArea();
    private final JButton recordButton = new JButton("\uD83C\uDFA4");

    /** Creates and lays out the voice recording window. */
    public VoiceRecorderFrame() {
        super("Voice Notes");
        buildWindow();
    }

    /** Builds the frontend layout and connects the recording button. */
    private void buildWindow() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(520, 460));
        setSize(620, 520);
        setLocationRelativeTo(null);

        JPanel root = new JPanel(new BorderLayout(18, 18));
        root.setBackground(BACKGROUND);
        root.setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));

        JLabel title = new JLabel("VOICE CAPTURE", SwingConstants.CENTER);
        title.setForeground(TEXT);
        title.setFont(new Font("Segoe UI", Font.BOLD, 24));
        root.add(title, BorderLayout.NORTH);

        transcript.setEditable(false);
        transcript.setLineWrap(true);
        transcript.setWrapStyleWord(true);
        transcript.setBackground(PANEL);
        transcript.setForeground(TEXT);
        transcript.setCaretColor(TEXT);
        transcript.setFont(new Font("Consolas", Font.PLAIN, 16));
        transcript.setBorder(BorderFactory.createEmptyBorder(14, 14, 14, 14));
        root.add(new JScrollPane(transcript), BorderLayout.CENTER);

        JPanel controls = new JPanel(new GridLayout(3, 1, 8, 8));
        controls.setOpaque(false);
        styleLabel(stateLabel, TEXT);
        styleLabel(levelLabel, MUTED);
        controls.add(stateLabel);
        controls.add(levelLabel);

        recordButton.setToolTipText("Start or stop voice recording");
        recordButton.setFont(new Font("Segoe UI Symbol", Font.PLAIN, 30));
        recordButton.setForeground(Color.WHITE);
        recordButton.setBackground(ACCENT);
        recordButton.setFocusPainted(false);
        recordButton.addActionListener(event -> toggleRecording());
        controls.add(recordButton);
        root.add(controls, BorderLayout.SOUTH);

        setContentPane(root);
    }

    /** Applies the shared typography used by status labels. */
    private void styleLabel(JLabel label, Color color) {
        label.setForeground(color);
        label.setFont(new Font("Segoe UI", Font.PLAIN, 14));
    }

    /** Starts or stops the backend when the microphone button is clicked. */
    private void toggleRecording() {
        if (backend.isRunning()) {
            backend.stop();
            return;
        }
        transcript.append("\n[recording started]\n");
        recordButton.setText("\u25A0");
        backend.start(new BackendListener());
    }

    /** Converts backend events to safe Swing UI updates. */
    private class BackendListener implements SpeechRecognitionBackend.Listener {
        @Override
        public void onStateChanged(String state) {
            update(() -> stateLabel.setText(state));
        }

        @Override
        public void onAudioLevel(int level) {
            update(() -> levelLabel.setText(level >= 500
                    ? "Mic level: " + level + "  |  VOICE DETECTED"
                    : "Mic level: " + level + "  |  quiet"));
        }

        @Override
        public void onPartialText(String text) {
            update(() -> stateLabel.setText(text.isBlank() ? "Listening" : text));
        }

        @Override
        public void onFinalText(String text) {
            if (!text.isBlank()) {
                update(() -> transcript.append(text + "\n"));
            }
        }

        @Override
        public void onError(String message) {
            update(() -> stateLabel.setText(message));
        }

        /** Resets controls after the backend finishes or fails. */
        private void update(Runnable change) {
            SwingUtilities.invokeLater(() -> {
                change.run();
                if (!backend.isRunning()) {
                    recordButton.setText("\uD83C\uDFA4");
                }
            });
        }
    }
}