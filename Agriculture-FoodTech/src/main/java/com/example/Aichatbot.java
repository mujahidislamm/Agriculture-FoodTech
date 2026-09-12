package com.example;

import javax.swing.SwingUtilities;

/** Application entry point for the voice recording frontend. */
public class Aichatbot {

    /** Opens the voice recorder window on Swing's UI thread. */
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VoiceRecorderFrame().setVisible(true));
    }
}
