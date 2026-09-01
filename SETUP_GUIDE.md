# FasalSathi Setup & Installation Guide

## Quick Start

### Option 1: Automatic Setup (Recommended)
From the repository root on Windows, run:
```bash
setup-and-run.bat
```

This script will:
- ✓ Check Java JDK 21+
- ✓ Install Maven if needed  
- ✓ Check Node.js and npm
- ✓ Build the React frontend
- ✓ Start the Spring Boot backend
- ✓ Open the application in your browser

### Option 2: Manual Setup
If you prefer manual control, ensure you have installed:
- Java JDK 21+ - https://www.oracle.com/java/technologies/downloads/
- Maven 3.9+ - https://maven.apache.org/download.cgi
- Node.js 20+ - https://nodejs.org/

Then navigate to `Agriculture-FoodTech\` folder and run:
```bash
run-app.bat
```

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Java | JDK 21 | JDK 26 |
| Maven | 3.9 | 3.9.9+ |
| Node.js | 20 LTS | 22 LTS |
| RAM | 2GB | 4GB+ |
| Disk Space | 2GB | 5GB+ |

## Application URL

**Main Application:** http://localhost:8080

Do NOT open any other URLs or index files. All features are accessed through the main URL.

## Features

### 1. Dashboard (Home Page)
- View local weather for your district
- Check current mandi prices for crops
- Find nearby agricultural shops
- Multi-language support (English, Bengali, Hindi)

### 2. Crop Diagnosis
- Upload crop leaf images
- AI-powered disease identification
- Treatment recommendations
- Safety warnings and expert escalation
- Voice input for accessibility

### 3. Local Information
- 23 districts of West Bengal covered
- Real-time weather data
- Market price trends
- Nearby KVK information

## Troubleshooting

### Problem: "Java JDK 21+ not found"
**Solution:** Install Java from https://www.oracle.com/java/technologies/downloads/
Then add it to your system PATH:
1. Right-click "This PC" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Add Java bin folder to PATH (e.g., `C:\Program Files\Java\jdk-26.0.2\bin`)

### Problem: "Maven not found"
**Solution:** 
- Use the `setup-and-run.bat` script which will install Maven automatically, OR
- Install Maven from https://maven.apache.org/download.cgi and add to PATH

### Problem: "Port 8080 already in use"
**Solution:**
- Stop any other application using port 8080, OR
- Modify the port in `frontend/desktop-tutorial/src/main/resources/application.properties`:
  ```
  server.port=8081
  ```
  Then update the URL to http://localhost:8081

### Problem: Frontend not loading or showing blank page
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Check browser console for errors (F12)
4. Ensure backend is running (check terminal window)

### Problem: Image upload fails
**Solution:**
- Image must be less than 10MB
- Supported formats: JPG, PNG, JPEG, WebP
- Ensure good lighting for leaf photo

### Problem: "Node modules/npm issues"
**Solution:**
1. Delete `frontend/desktop-tutorial/frontend/node_modules` folder
2. Delete `frontend/desktop-tutorial/frontend/package-lock.json`
3. Run `npm ci --legacy-peer-deps` in that folder

## Optional Configuration

### Weather API (Live Data)
For real-time weather, set the OPENWEATHER_API_KEY:
```bash
set OPENWEATHER_API_KEY=your_key_here
```
Get a free API key from: https://openweathermap.org/api

### Market Prices (Live Data)
For live mandi prices, set the DATA_GOV_API_KEY:
```bash
set DATA_GOV_API_KEY=your_key_here
```
Get a free API key from: https://www.data.gov.in

## Project Structure

```
Agriculture-FoodTech/
├── frontend/
│   └── desktop-tutorial/          # Main application
│       ├── frontend/              # React application
│       │   ├── src/
│       │   │   ├── pages/         # HomePage, DiagnosePage, AboutPage
│       │   │   ├── components/    # Reusable UI components
│       │   │   ├── api/           # API integration
│       │   │   └── context/       # Language context
│       │   └── package.json
│       ├── src/                   # Spring Boot backend
│       │   ├── main/java/com/example/
│       │   │   ├── controller/    # REST endpoints
│       │   │   ├── service/       # Business logic
│       │   │   └── config/        # Configuration
│       │   └── resources/
│       │       └── application.properties
│       └── pom.xml
├── models/                        # TorchScript ML models
├── vosk-model-small-en-us-0.15/  # Speech recognition
└── setup-and-run.bat             # Recommended setup script
```

## Development

### Run Frontend Only (Vite Dev Server)
```bash
cd frontend/desktop-tutorial/frontend
npm run dev
```
This starts a dev server at http://localhost:5173 with hot reload.

### Run Backend Only
```bash
cd frontend/desktop-tutorial
mvn spring-boot:run
```

### Build Frontend for Production
```bash
cd frontend/desktop-tutorial/frontend
npm run build
```
Output goes to `dist/` folder.

## API Endpoints

All endpoints are prefixed with `/api/v1`:

- `GET /health` - Health check
- `GET /districts` - List of districts
- `GET /crops` - List of supported crops
- `POST /diagnose` - Diagnose crop disease from image
- `GET /weather` - Get weather by coordinates
- `GET /mandi-prices` - Get market prices
- `GET /kvk` - Get KVK information
- `POST /speech/transcribe` - Transcribe audio to text
- `GET /translations` - Get multi-language translations

## Performance Tips

1. **First Load**: The first run will be slow due to:
   - Frontend npm dependencies installation
   - TorchScript model loading
   - Spring Boot startup

2. **Subsequent Runs**: Much faster as everything is cached

3. **Image Processing**: Large images (>5MB) may take 10-30 seconds to process

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Check the terminal where the backend is running
3. Ensure all dependencies are installed
4. Try the "Troubleshooting" section above

## Security Notes

- Application runs locally on your machine
- No data is stored permanently on your device
- Crop disease models are open-source
- Weather/market data comes from public APIs
- Voice data is processed locally (Vosk model)
