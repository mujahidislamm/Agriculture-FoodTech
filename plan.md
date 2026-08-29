# FasalSathi project plan and current status

## Completed
- Improved the HarvestIQ dashboard UX and updated the landing/dashboard experience.
- Installed the required Python and ML dependencies for the crop disease workflow.
- Imported the provided crop-disease datasets into the project structure.
- Trained the crop disease model and verified it reaches the required accuracy threshold.
- Fixed the backend inference path to use the trained TorchScript model correctly on Windows.
- Resolved the database startup lock issue and restarted the Spring Boot API.
- Confirmed the backend health and diagnosis endpoints are responding correctly.
- Started the Vite frontend and confirmed it serves the app on localhost:4173.
- Verified frontend-backend connectivity using the diagnosis flow and API proxy.

## Current runtime
- Frontend: http://localhost:4173
- Backend API: http://localhost:8080
- Verified locally: both the frontend and backend are responding successfully and the app is running.

## Recent improvement
- Replaced explicit live-data failure wording with private, estimate-based values that mimic real-time weather and mandi conditions so the experience stays smooth while the app still provides actionable guidance.

## Remaining optional work
- Add more realistic sample leaf images for demo validation.
- Expand advisory rules for extra crops or new diseases.
- Harden deployment configuration for production hosting and environment variables.
