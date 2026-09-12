# FasalSathi - Project Onboarding Guide

> **Welcome to the team!** This document explains what we're building, how it works, and how you can contribute. Everything is written in simple terms with key details highlighted.

---

## 1. What Are We Building?

**FasalSathi** (Bengali: ফসলসাথী, meaning "Crop Companion") is an **AI-powered crop disease diagnosis app** for farmers in **West Bengal, India**.

### The Problem We're Solving
Farmers in West Bengal often don't know what's wrong with their crops until it's too late. They don't have easy access to agricultural experts, and even if they could, language barriers and distance make it difficult.

### Our Solution
A farmer can:
1. Take a photo of a diseased leaf with their phone
2. Upload it to our app
3. Get an instant diagnosis with:
   - **What disease** it might be (with confidence percentage)
   - **What to do next** (organic or chemical treatments)
   - **Safety warnings** (PPE, pre-harvest intervals, environmental cautions)
   - **Weather-based advice** (e.g., "high humidity today, fungal risk is high")
   - **Expert contact** if the AI isn't confident enough
4. Read everything in their language: **Bengali**, **Hindi**, or **English**

### Example User Flow
```
Farmer → Uploads photo of tomato leaf with yellow spots
        → AI analyzes image locally (no internet needed for diagnosis)
        → AI says: "75% confidence this is Early Blight"
        → Shows treatment steps, safety gear needed, local weather warning
        → If confidence < 50% → "Please visit your nearest KVK center" + contact details
```

---

## 2. Our Tech Stack (Tools We Use)

| What | Tool | Why We Use It |
|------|------|---------------|
| **Language** | Java 25 | Team expertise, strong type safety |
| **Backend Framework** | Spring Boot 3.5.16 | Industry standard for Java APIs |
| **AI / ML** | DJL + PyTorch | Runs AI models directly in Java without Python |
| **AI Model** | `models/crop_model.pt` | A pre-trained neural network that recognizes crop diseases |
| **Database** | H2 (file-based) | Lightweight, no server setup needed for development |
| **Voice Input** | Vosk | Offline speech-to-text (experimental feature) |
| **Weather Data** | OpenWeatherMap API | Live weather to improve advice |
| **Frontend** | HTML/CSS/JS (PWA) | Works on phones and desktops |
| **Build Tool** | Maven | Manages dependencies and builds the project |

---

## 3. Project Structure (Where Things Live)

```
desktop-tutorial/
├── src/main/java/com/example/
│   ├── CropDiseaseApiApplication.java   ← Main app entry point (Spring Boot)
│   ├── controller/
│   │   └── CropPredictionController.java ← API endpoints (e.g., /api/v1/diagnose)
│   ├── service/
│   │   ├── ModelInferenceService.java    ← Runs the AI model on images
│   │   ├── AdvisoryService.java          ← Generates treatment advice
│   │   ├── TranslationService.java       ← Translates to Bengali/Hindi/English
│   │   ├── WeatherService.java           ← Fetches live weather data
│   │   └── WBCropKnowledgeBase.java      ← Database of crops, diseases, districts
│   ├── repository/
│   │   └── PredictionLogRepository.java  ← Saves diagnosis history to database
│   ├── entity/
│   │   └── PredictionLog.java            ← Database table structure
│   ├── dto/
│   │   ├── CropMetadataDTO.java          ← Input: farmer's crop info
│   │   ├── PredictionResponseDTO.java    ← Output: full diagnosis result
│   │   ├── DiagnosisDetailDTO.java       ← Individual disease candidate
│   │   └── TranslatedAdvisoryDTO.java    ← Translated advice content
│   ├── config/
│   │   ├── CorsConfig.java               ← Allows frontend to call API
│   │   └── RestClientConfig.java         ← Setup for weather API calls
│   ├── Aichatbot.java                    ← Desktop voice UI (experimental)
│   ├── Farmer.java                       ← Legacy farmer registry
│   └── imgrecog.java                     ← Legacy Azure Vision client
├── src/main/resources/
│   └── application.properties            ← App configuration (port, DB, API keys)
├── models/
│   ├── crop_model.pt                     ← The AI model file
│   └── classes.txt                       ← Disease labels for the model
├── pom.xml                               ← Maven build file (dependencies, config)
└── data/                                 ← H2 database files (auto-created)
```

### Key Concept: The "Backend" vs "Frontend"
- **Backend (Java/Spring Boot):** The brain. It receives images, runs AI, generates advice, saves history.
- **Frontend (HTML/JS in `static/`):** The face. What farmers actually see and click on in their browser.

---

## 4. How the App Works (Step by Step)

### The Diagnosis Pipeline

```
1. Farmer submits: photo + crop type + district + language preference
                            ↓
2. Controller receives request → validates input
                            ↓
3. ModelInferenceService runs the AI model
   → Reads the image
   → Feeds it through the neural network
   → Gets probabilities for each possible disease
                            ↓
4. AdvisoryService builds the response
   → Gets the top disease prediction
   → Looks up treatment steps from WBCropKnowledgeBase
   → Checks weather data (if available)
   → Determines if farmer should see an expert
                            ↓
5. TranslationService translates everything to chosen language
                            ↓
6. PredictionLog saves the record to database
                            ↓
7. Controller sends back a PredictionResponseDTO to the frontend
```

### Explainable AI & Safety Features

| Feature | What It Means | Why It Matters |
|---------|---------------|----------------|
| **Confidence Thresholds** | If AI is ≥70% confident → "Definitive Diagnosis" | Farmer gets clear answer |
| **Advisory Mode** | If AI is <70% confident → "Advisory Support" | Tells farmer to verify with expert before chemical treatment |
| **Escalation Logic** | Auto-escalates to expert when: confidence <50%, disease is tricky (e.g., viral), or top-2 predictions are too close | Prevents bad advice for serious cases |
| **KVK Integration** | Shows nearest Krishi Vigyan Kendra (agricultural extension center) contact | Farmer can get real human help |

### The Knowledge Base (WBCropKnowledgeBase)

This is our "encyclopedia" hardcoded into the app. It contains:

**23 West Bengal Districts** (with coordinates, soil type, major crops, nearest KVK center)

**11 Major Crops** (Paddy, Wheat, Maize, Potato, Tomato, Brinjal, Mustard, Jute, Sugarcane, Mango, Litchi) with:
- Growth stages (seedling, vegetative, flowering, fruiting, harvest)
- Season (Kharif / Rabi)
- Common diseases

**30+ Diseases** with detailed templates:
- Cause type (fungal, bacterial, viral, pest, nutrient deficiency)
- Symptoms description
- Organic treatment steps
- Chemical treatment (with dosage)
- PPE requirements
- Pre-harvest intervals
- Preventive measures

---

## 5. Key Entities & Data Flow

### Input: CropMetadataDTO
What the farmer sends:
```java
- cropType: "Tomato"
- cropStage: "Flowering"
- district: "Hooghly"
- latitude/longitude: "22.9, 88.4"
- observations: "Yellow spots on lower leaves"
- language: "bn" (Bengali)
```

### Output: PredictionResponseDTO
What the farmer receives:
```java
- diagnosisType: "DEFINITIVE_DIAGNOSIS" or "ADVISORY_SUPPORT"
- primaryDiagnosis: "Early Blight"
- confidence: 75
- candidates: [Top 3 possible diseases with percentages]
- explanation: "Fungal infection, common in high humidity"
- nextActions: ["Remove affected leaves", "Apply copper fungicide..."]
- safetyWarnings: ["Wear gloves", "Don't apply 7 days before harvest"]
- weatherContext: "High humidity today increases fungal spread risk"
- cropStageRelevance: "Flowering stage - avoid certain chemicals"
- escalateToExpert: false
- escalationInfo: null (or KVK contact if true)
- translatedAdvisory: { all content translated to Bengali }
- districtContext: "Hooghly district - laterite soil, major crop: rice"
```

### Database: PredictionLog
Every diagnosis is saved here for:
- History tracking
- Analytics (which diseases are trending?)
- Auditing AI performance

---

## 6. How to Build & Run

### Prerequisites
- **JDK 25** installed
- **Maven 3.9+** installed
- **`models/crop_model.pt`** and **`models/classes.txt`** present in the project

### Build the project
```bash
mvn clean package
```
This creates a runnable JAR file in `target/`.

### Run the API server
```bash
mvn spring-boot:run
# OR
java -jar target/desktop-tutorial-1.0.0.jar
```
The server starts at `http://localhost:8080`

On Windows, double-click `run-app.bat` to start the web app and open it in a browser in one step. The installable PWA uses `src/main/resources/static/fasalsathi-icon.svg` as its app icon.

### Run the desktop voice recorder (experimental)
```bash
mvn exec:java -Dexec.mainClass=com.example.Aichatbot
```

### Environment Variables (Optional)
| Variable | Purpose | Example |
|----------|---------|---------|
| `SERVER_PORT` | Change API port | `8080` |
| `CROP_MODEL_PATH` | Path to AI model | `models/crop_model.pt` |
| `OPENWEATHER_API_KEY` | Enable weather data | `your-api-key-here` |

---

## 7. Important Notes for New Members

1. **The README is outdated** — It still says "GitHub Desktop Welcome". The actual project is the FasalSathi crop diagnosis system.

2. **Two entry points exist**:
   - `com.example.CropDiseaseApiApplication` → Start the REST API server (main production use)
   - `com.example.Aichatbot` → Start the experimental desktop voice UI

3. **The AI runs locally** — No cloud ML API. The `crop_model.pt` file is a PyTorch TorchScript model that runs inside the Java process using DJL.

4. **West Bengal focus** — Everything is tailored for WB farmers: 23 districts, 11 local crops, Bengali/Hindi translations, KVK center contacts.

5. **Safety first** — The app is designed to be cautious. It won't give chemical treatment advice if the AI isn't confident. It always warns about PPE and pre-harvest intervals.

6. **Database is file-based H2** — No separate database server. Files are stored in `data/crop-disease-db`. For production, you'd swap this for PostgreSQL.

7. **Testing** — We use JUnit 4. Run tests with `mvn test`.

---

## 8. Common Terms You'll Hear

| Term | Simple Explanation |
|------|-------------------|
| **DTO** | Data Transfer Object — a simple class to carry data between layers (e.g., input/output formats) |
| **Entity** | A class that maps to a database table |
| **Repository** | A data access layer that talks to the database |
| **Service** | Business logic — the "what should we do with this data?" layer |
| **Controller** | The API endpoint handler — receives HTTP requests |
| **TorchScript** | A way to run PyTorch models without Python — we use it so our Java app can run AI |
| **KVK** | Krishi Vigyan Kendra — agricultural extension centers across India |
| **PWA** | Progressive Web App — a website that works like a mobile app |
| **CORS** | Cross-Origin Resource Sharing — allows our frontend to talk to our backend |

---

## 9. Quick Reference: Key Files to Start With

| File | Why Read It |
|------|-------------|
| `CropPredictionController.java` | See the API endpoints and what inputs/outputs look like |
| `ModelInferenceService.java` | Understand how we run the AI model |
| `AdvisoryService.java` | See how we generate advice from predictions |
| `WBCropKnowledgeBase.java` | Understand the crop/disease database structure |
| `CropMetadataDTO.java` | See what data farmers submit |
| `PredictionResponseDTO.java` | See what data farmers receive |
| `application.properties` | See app configuration in one place |

---

## 10. Current State & Next Steps

*(This section can be updated by the team based on current sprint/goals)*

---

**Welcome aboard!** Start by exploring the `service/` package — that's where most of the interesting logic lives. Run `mvn spring-boot:run` and hit `http://localhost:8080/api/v1/health` to verify everything works.
