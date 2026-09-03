# FasalSathi / HarvestIQ

This repository contains the complete runnable source for the crop-disease, market-information, and speech-assistance application. It includes the two TorchScript crop models and the Vosk speech model needed at runtime. Training datasets, generated databases, build output, Python caches, and `node_modules` are intentionally excluded because they are either regenerated or not needed to run the application.

## Requirements

- Java JDK 21 or later
- Maven 3.9 or later
- Node.js 20 or later (includes npm)

## Run the full web application

From the repository root on Windows, run the only launcher:

```bat
run-app.bat
```

The first run installs frontend dependencies from `package-lock.json`, builds the React frontend, starts Spring Boot, and opens only the main website at `http://localhost:8080`.

MAIN WEBSITE URL: `http://localhost:8080`
Use only this URL for the interface and all API operations. Do not open any alternate index.html or separate frontend pages.

## Optional API keys

The application starts without API keys. To enable live weather and mandi-price data, provide `OPENWEATHER_API_KEY` and `DATA_GOV_API_KEY` as environment variables before launching.

## Notes

- Crop inference models are stored in `frontend/desktop-tutorial/models/`.
- The canonical application source is in `frontend/desktop-tutorial/`; no second backend or frontend launcher is supported.
- The Vosk model is stored at `vosk-model-small-en-us-0.15/` and is resolved relative to the cloned repository.
- Training data is intentionally excluded; use `train_model.py` with your own dataset if you need to retrain a model.
- To undo the launcher/UI change, use the `before-single-launcher-ui-fix` Git tag that is published with it.
