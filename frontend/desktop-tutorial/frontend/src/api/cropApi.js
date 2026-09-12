import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

export function diagnose(image, metadata = {}) {
  const formData = new FormData();
  formData.append('image', image);

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  return api.post('/diagnose', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function transcribeAudio(audioBlob, language = 'en') {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.wav');
  formData.append('language', language);

  return api.post('/speech/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getDistricts() {
  return api.get('/districts');
}

export function getCrops() {
  return api.get('/crops');
}

export function getTranslations() {
  return api.get('/translations');
}

export function getWeather(latitude, longitude) {
  return api.get('/weather', { params: { lat: latitude, lon: longitude } });
}

export function getKvkInfo(district, latitude, longitude) {
  return api.get('/kvk', { params: { district, lat: latitude, lon: longitude } });
}

export function getMandiPrices(crop, state, district) {
  return api.get('/mandi-prices', { params: { crop, state, district } });
}

export function healthCheck() {
  return api.get('/health');
}

export default api;
