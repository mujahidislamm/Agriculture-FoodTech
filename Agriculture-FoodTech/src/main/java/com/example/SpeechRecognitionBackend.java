package com.example;

import org.vosk.Model;
import org.vosk.Recognizer;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.TargetDataLine;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;

/** Backend service that captures microphone audio and converts it with Vosk. */
public class SpeechRecognitionBackend {

    private static final String MODEL_PATH = "D:\\vosk-model-small-en-us-0.15";
    private static final float SAMPLE_RATE = 16000.0f;
    private static final int MAX_RECORDING_SECONDS = 60;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private TargetDataLine microphone;
    private Thread recognitionThread;

    /** Receives backend events that the frontend can render. */
    public interface Listener {
        void onStateChanged(String state);

        void onAudioLevel(int level);

        void onPartialText(String text);

        void onFinalText(String text);

        void onError(String message);
    }

    /** Starts microphone capture on a background thread. */
    public synchronized void start(Listener listener) {
        if (running.get()) {
            return;
        }
        running.set(true);
        recognitionThread = new Thread(() -> recognize(listener), "speech-recognition");
        recognitionThread.start();
    }

    /** Stops microphone capture and releases the audio device. */
    public synchronized void stop() {
        running.set(false);
        if (microphone != null) {
            microphone.stop();
            microphone.close();
            microphone = null;
        }
    }

    /** Reports whether the backend is currently recording. */
    public boolean isRunning() {
        return running.get();
    }

    /** Loads the Vosk model and continuously processes microphone buffers. */
    private void recognize(Listener listener) {
        try (Model model = new Model(MODEL_PATH);
                Recognizer recognizer = new Recognizer(model, SAMPLE_RATE)) {
            microphone = openMicrophone();
            microphone.start();
            listener.onStateChanged("Listening");

            long deadline = System.currentTimeMillis() + MAX_RECORDING_SECONDS * 1000L;
            byte[] buffer = new byte[4096];
            while (running.get() && System.currentTimeMillis() < deadline) {
                int bytesRead = microphone.read(buffer, 0, buffer.length);
                if (bytesRead <= 0) {
                    continue;
                }
                listener.onAudioLevel(findPeakLevel(buffer, bytesRead));
                if (recognizer.acceptWaveForm(buffer, bytesRead)) {
                    listener.onFinalText(extractText(recognizer.getResult(), "text"));
                } else {
                    listener.onPartialText(extractText(recognizer.getPartialResult(), "partial"));
                }
            }
            if (System.currentTimeMillis() >= deadline && running.get()) {
                listener.onStateChanged("Time limit reached");
            }
            String finalText = extractText(recognizer.getFinalResult(), "text");
            if (!finalText.isBlank()) {
                listener.onFinalText(finalText);
            }
        } catch (LineUnavailableException e) {
            listener.onError("Microphone unavailable: " + e.getMessage());
        } catch (IOException e) {
            listener.onError("Could not read microphone input: " + e.getMessage());
        } catch (RuntimeException e) {
            listener.onError("Speech recognition failed: " + e.getMessage());
        } finally {
            stop();
            listener.onStateChanged("Ready");
        }
    }

    /** Opens the default microphone using Vosk's 16-bit mono PCM format. */
    private synchronized TargetDataLine openMicrophone() throws LineUnavailableException {
        AudioFormat format = new AudioFormat(
                AudioFormat.Encoding.PCM_SIGNED, SAMPLE_RATE, 16, 1, 2, SAMPLE_RATE, false);
        DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
        if (!AudioSystem.isLineSupported(info)) {
            throw new LineUnavailableException("16 kHz mono microphone format is unsupported");
        }
        microphone = (TargetDataLine) AudioSystem.getLine(info);
        microphone.open(format);
        return microphone;
    }

    /** Finds the loudest sample so the frontend can show live input activity. */
    private int findPeakLevel(byte[] buffer, int bytesRead) {
        int peak = 0;
        for (int index = 0; index + 1 < bytesRead; index += 2) {
            int sample = Math.abs((short) ((buffer[index + 1] << 8) | (buffer[index] & 0xff)));
            peak = Math.max(peak, sample);
        }
        return peak;
    }

    /** Reads a simple text field from Vosk's JSON result. */
    private String extractText(String json, String field) {
        String marker = "\"" + field + "\"";
        int start = json.indexOf(marker);
        if (start < 0) {
            return "";
        }
        start = json.indexOf(':', start) + 1;
        int end = json.indexOf('}', start);
        if (start <= 0 || end < 0) {
            return "";
        }
        return json.substring(start, end).replace("\"", "").trim();
    }
}