/* ── FasalSathi PWA client ─────────────────────────────────────────────
 * Offline-first, low-bandwidth, multilingual (বাংলা / हिंदी / English)
 * crop-stress advisory for West Bengal farmers.
 * ───────────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    const API = '/api/v1';
    const $ = (id) => document.getElementById(id);

    const state = {
        lang: localStorage.getItem('fs_lang') || 'bn',
        districts: [],
        crops: [],
        imageBlob: null,
        imageName: 'leaf.jpg',
        coordinates: null,
        speaking: false
    };

    const SPEECH_LANG = { en: 'en-IN', bn: 'bn-IN', hi: 'hi-IN' };

    /* ── i18n label rendering ──────────────────────────────────────── */
    function setText(id, key) { const el = $(id); if (el) el.textContent = t(key, state.lang); }
    function setPlaceholder(id, key) { const el = $(id); if (el) el.placeholder = t(key, state.lang); }

    function renderLabels() {
        document.documentElement.lang = state.lang;
        setText('appTitle', 'appTitle');
        setText('tagline', 'tagline');
        setText('welcomeTitle', 'welcomeTitle');
        setText('welcomeCopy', 'welcomeCopy');
        setText('statPhoto', 'statPhoto');
        setText('statCheck', 'statCheck');
        setText('statAdvice', 'statAdvice');
        setText('formHeading', 'enterDetails');
        setText('lblDistrict', 'selectDistrict');
        setText('lblCrop', 'selectCrop');
        setText('lblStage', 'selectStage');
        setText('lblPhoto', 'takePhoto');
        $('captureBtn').textContent = t('takePhoto', state.lang);
        $('galleryBtn').textContent = t('chooseGallery', state.lang);
        setText('lblObs', 'observations');
        $('locationBtn').textContent = t('useLocation', state.lang);
        setText('locationNote', 'locationHint');
        $('analyzeBtn').innerHTML = '<span>🔍</span> ' + t('analyze', state.lang) + ' <span class="arrow">→</span>';
        setPlaceholder('observations', 'observationsPlaceholder');
        setText('lowBwHint', 'imageTooLarge');
        setText('hExplanation', 'explanation');
        setText('hAlt', 'alternativeCauses');
        setText('hNext', 'nextSteps');
        setText('hSafety', 'safetyWarnings');
        setText('hWeather', 'weatherImpact');
        setText('hStage', 'cropStageInfo');
        setText('hDistrict', 'districtInfo');
        setText('hEscalate', 'expertEscalation');
        setText('speakBtn', 'speakNow');
        $('speakBtn').textContent = '🔊 ' + t('speakNow', state.lang);
        $('newBtn').textContent = '↺ ' + t('newScan', state.lang);
        $('callBtn').textContent = '📞 ' + t('callExpert', state.lang);
        setText('kisan', 'kisanHelpline');
        updateNetBadge();
    }

    /* ── Network / offline ─────────────────────────────────────────── */
    async function updateNetBadge() {
        let online = navigator.onLine;
        if (online) {
            try {
                const response = await fetch(API + '/health', { cache: 'no-store' });
                online = response.ok;
            } catch (e) { online = false; }
        }
        const b = $('netBadge');
        b.textContent = online ? t('onlineMode', state.lang) : t('offlineMode', state.lang);
        b.className = 'badge ' + (online ? 'online' : 'offline');
    }
    window.addEventListener('online', () => { updateNetBadge(); flushQueue(); });
    window.addEventListener('offline', updateNetBadge);

    /* ── Catalogs (cached for offline) ─────────────────────────────── */
    async function loadCatalogs() {
        try {
            const [dRes, cRes] = await Promise.all([
                fetch(API + '/districts'), fetch(API + '/crops')
            ]);
            state.districts = await dRes.json();
            state.crops = await cRes.json();
            cachePut('districts', state.districts);
            cachePut('crops', state.crops);
        } catch (e) {
            state.districts = (await cacheGet('districts')) || [];
            state.crops = (await cacheGet('crops')) || [];
        }
        fillDistricts();
        fillCrops();
    }

    function fillDistricts() {
        const sel = $('district');
        sel.innerHTML = '<option value="">' + t('selectDistrict', state.lang) + '</option>';
        state.districts.forEach(d => {
            const o = document.createElement('option');
            o.value = d.name; o.textContent = d.name;
            sel.appendChild(o);
        });
    }

    function fillCrops() {
        const sel = $('crop');
        sel.innerHTML = '<option value="">' + t('selectCrop', state.lang) + '</option>';
        state.crops.forEach(c => {
            const o = document.createElement('option');
            o.value = c.name;
            o.textContent = t(c.name, state.lang) || c.name;
            sel.appendChild(o);
        });
    }

    function fillStages() {
        const crop = state.crops.find(c => c.name === $('crop').value);
        const sel = $('stage');
        sel.innerHTML = '<option value="">' + t('selectStage', state.lang) + '</option>';
        (crop ? crop.stages : []).forEach(s => {
            const o = document.createElement('option');
            o.value = s; o.textContent = t(s, state.lang) || s;
            sel.appendChild(o);
        });
        const coverage = $('cropCoverage');
        if (!crop || typeof crop.datasetAvailable !== 'boolean') {
            coverage.hidden = true;
        } else {
            coverage.hidden = false;
            coverage.className = 'field-note crop-coverage' + (crop.datasetAvailable ? '' : ' missing');
            coverage.textContent = t(crop.datasetAvailable ? 'datasetReady' : 'datasetMissing', state.lang);
        }
    }

    /* ── Photo capture + low-bandwidth compression ─────────────────── */
    function handleFile(file) {
        if (!file) return;
        if (!file.type || !file.type.startsWith('image/')) {
            setStatus(t('chooseImage', state.lang));
            return;
        }
        // Keep the original file immediately; compression is best-effort.
        state.imageBlob = file;
        state.imageName = file.name || 'leaf.jpg';
        const reader = new FileReader();
        reader.onerror = () => setStatus(t('chooseImage', state.lang));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => setStatus(t('chooseImage', state.lang));
            img.onload = () => {
                const max = 800;
                let { width, height } = img;
                if (width > height && width > max) { height = Math.round(height * max / width); width = max; }
                else if (height > max) { width = Math.round(width * max / height); height = max; }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) state.imageBlob = blob;
                    $('previewImg').src = e.target.result;
                    $('photoPreview').hidden = false;
                    const kb = Math.round((blob || file).size / 1024);
                    $('compressNote').textContent = t('imageTooLarge', state.lang) + ' (' + kb + ' KB)';
                }, 'image/jpeg', 0.6);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /* ── Voice input (observation) ─────────────────────────────────── */
    function startDictation() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setStatus(t('speechUnsupported', state.lang)); return; }
        const rec = new SR();
        rec.lang = SPEECH_LANG[state.lang];
        rec.interimResults = false;
        rec.continuous = false;
        rec.onstart = () => { $('micBtn').classList.add('recording'); };
        rec.onend = () => { $('micBtn').classList.remove('recording'); };
        rec.onerror = (event) => {
            $('micBtn').classList.remove('recording');
            const key = event.error === 'not-allowed' ? 'speechPermission' : 'speechError';
            setStatus(t(key, state.lang));
        };
        rec.onresult = (ev) => {
            const text = ev.results[0][0].transcript;
            $('observations').value = ($('observations').value + ' ' + text).trim();
        };
        rec.start();
    }

    /* ── Diagnose ──────────────────────────────────────────────────── */
    function buildFormData() {
        const fd = new FormData();
        if (state.imageBlob) fd.append('image', state.imageBlob, state.imageName);
        fd.append('cropType', $('crop').value || '');
        fd.append('cropStage', $('stage').value || '');
        fd.append('district', $('district').value || '');
        fd.append('observations', $('observations').value || '');
        fd.append('language', state.lang);
        if (state.coordinates) {
            fd.append('latitude', state.coordinates.latitude);
            fd.append('longitude', state.coordinates.longitude);
        }
        return fd;
    }

    function useLocation() {
        if (!navigator.geolocation) { setStatus(t('locationDenied', state.lang)); return; }
        $('locationBtn').disabled = true;
        $('locationBtn').textContent = t('locating', state.lang);
        navigator.geolocation.getCurrentPosition((position) => {
            state.coordinates = position.coords;
            const nearest = state.districts.reduce((best, district) => {
                const distance = Math.hypot(district.latitude - position.coords.latitude, district.longitude - position.coords.longitude);
                return !best || distance < best.distance ? { name: district.name, distance } : best;
            }, null);
            if (nearest) $('district').value = nearest.name;
            $('locationNote').textContent = t('locationReady', state.lang);
            $('locationBtn').disabled = false;
            $('locationBtn').textContent = t('useLocation', state.lang);
        }, () => {
            $('locationBtn').disabled = false;
            $('locationBtn').textContent = t('useLocation', state.lang);
            setStatus(t('locationDenied', state.lang));
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    }

    async function analyze() {
        if (!state.imageBlob) { setStatus(t('noImageSelected', state.lang)); return; }
        setStatus(t('analyzing', state.lang));
        $('analyzeBtn').disabled = true;
        $('resultCard').hidden = true;
        const fd = buildFormData();

        if (!navigator.onLine) {
            await saveForOffline(fd);
            setStatus(t('queued', state.lang));
            $('analyzeBtn').disabled = false;
            return;
        }
        try {
            const res = await fetch(API + '/diagnose', { method: 'POST', body: fd });
            if (!res.ok) {
                const message = await readError(res);
                throw new Error(message);
            }
            const data = await res.json();
            renderResult(data);
            setStatus('');
        } catch (err) {
            if (err instanceof TypeError || err.name === 'NetworkError') {
                await saveForOffline(fd);
                setStatus(t('queued', state.lang));
            } else {
                setStatus(err.message || t('serverError', state.lang));
            }
        } finally {
            $('analyzeBtn').disabled = false;
        }
    }

    async function readError(response) {
        try {
            const body = await response.json();
            return body.message || body.error || ('Server error (' + response.status + ')');
        } catch (e) {
            return 'Server error (' + response.status + ')';
        }
    }

    function renderResult(d) {
        window.__lastResult = d;
        $('resultCard').hidden = false;

        const definitive = d.diagnosisType === 'DEFINITIVE_DIAGNOSIS';
        const badge = $('verdictBadge');
        badge.textContent = definitive ? t('definiteDiag', state.lang) : t('advisorySupport', state.lang);
        badge.className = 'verdict ' + (definitive ? 'definitive' : 'advisory');

        const label = (d.translatedAdvisory && d.translatedAdvisory.diagnosisLabel)
            ? d.translatedAdvisory.diagnosisLabel : d.primaryDiagnosis;
        $('resultDisease').textContent = label;

        const pct = Math.round((d.confidence || 0) * 100);
        $('confFill').style.width = pct + '%';
        $('confLabel').textContent = pct + '%';

        const expl = (d.translatedAdvisory && d.translatedAdvisory.explanation)
            ? d.translatedAdvisory.explanation : d.explanation;
        $('explanation').textContent = expl;

        // Alternative causes
        const alt = $('alternatives');
        alt.innerHTML = '';
        (d.candidates || []).forEach(c => {
            const p = Math.round((c.confidence || 0) * 100);
            const div = document.createElement('div');
            div.className = 'alt-item';
            div.innerHTML =
                '<div class="alt-head"><span>' + escapeHtml(c.diseaseName) +
                (c.isTopPick ? ' ✓' : '') + '</span><span>' + p + '%</span></div>' +
                '<div class="alt-track"><div class="alt-fill" style="width:' + p + '%"></div></div>';
            alt.appendChild(div);
        });

        fillList('nextSteps', d.translatedAdvisory && d.translatedAdvisory.nextActions
            ? d.translatedAdvisory.nextActions : d.nextActions);
        fillList('safety', d.translatedAdvisory && d.translatedAdvisory.safetyWarnings
            ? d.translatedAdvisory.safetyWarnings : d.safetyWarnings);

        $('weather').textContent = d.weatherContext || '';
        $('stageInfo').textContent = d.cropStageRelevance || '';
        $('districtInfo').textContent = d.districtContext || '';

        const esc = $('escalateBlock');
        if (d.escalateToExpert) {
            const txt = (d.translatedAdvisory && d.translatedAdvisory.escalationInfo)
                ? d.translatedAdvisory.escalationInfo : d.escalationInfo;
            $('escalateText').textContent = txt || '';
            const phone = extractPhone(txt);
            $('callBtn').href = phone ? ('tel:' + phone) : 'tel:18001801551';
            esc.hidden = false;
        } else {
            esc.hidden = true;
        }

        $('resultCard').scrollIntoView({ behavior: 'smooth' });
    }

    function fillList(id, items) {
        const ul = $(id);
        ul.innerHTML = '';
        (items || []).forEach(it => {
            const li = document.createElement('li');
            li.textContent = it;
            ul.appendChild(li);
        });
    }

    function extractPhone(text) {
        if (!text) return null;
        const m = text.match(/(\d[\d\s-]{6,}\d)/);
        return m ? m[1].replace(/\s/g, '') : null;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    /* ── Voice output (read advisory aloud) ────────────────────────── */
    function speak() {
        if (!('speechSynthesis' in window)) return;
        if (state.speaking) {
            window.speechSynthesis.cancel();
            state.speaking = false;
            $('speakBtn').textContent = '🔊 ' + t('speakNow', state.lang);
            return;
        }
        const d = window.__lastResult;
        if (!d) return;
        const label = (d.translatedAdvisory && d.translatedAdvisory.diagnosisLabel) || d.primaryDiagnosis;
        const pct = Math.round((d.confidence || 0) * 100);
        let text = label + '. ' + t('confidence', state.lang) + ' ' + pct + '%. ';
        if (d.explanation) text += d.explanation;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = SPEECH_LANG[state.lang];
        const voice = window.speechSynthesis.getVoices()
            .find(v => v.lang && v.lang.toLowerCase().startsWith(state.lang));
        if (voice) u.voice = voice;
        window.speechSynthesis.cancel();
        state.speaking = true;
        $('speakBtn').textContent = '⏹ ' + t('stopSpeaking', state.lang);
        u.onend = () => {
            state.speaking = false;
            $('speakBtn').textContent = '🔊 ' + t('speakNow', state.lang);
        };
        window.speechSynthesis.speak(u);
    }

    /* ── Offline queue (IndexedDB) ─────────────────────────────────── */
    function openDB() {
        return new Promise((resolve, reject) => {
            const r = indexedDB.open('fasalsathi', 1);
            r.onupgradeneeded = () => r.result.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
        });
    }
    async function saveForOffline(fd) {
        const entries = {};
        for (const [k, v] of fd.entries()) entries[k] = v;
        const db = await openDB();
        await new Promise((res, rej) => {
            const tx = db.transaction('queue', 'readwrite');
            tx.objectStore('queue').add({ entries, blob: state.imageBlob, name: state.imageName });
            tx.oncomplete = res; tx.onerror = () => rej(tx.error);
        });
        db.close();
    }
    const queueRequest = saveForOffline;
    async function flushQueue() {
        const db = await openDB();
        const all = await new Promise((res, rej) => {
            const tx = db.transaction('queue', 'readonly');
            const rq = tx.objectStore('queue').getAll();
            rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
        });
        for (const item of all) {
            const fd = new FormData();
            for (const [k, v] of Object.entries(item.entries)) {
                if (k === 'image') fd.append('image', item.blob, item.name);
                else fd.append(k, v);
            }
            try {
                const res = await fetch(API + '/diagnose', { method: 'POST', body: fd });
                if (res.ok) {
                    renderResult(await res.json());
                    await new Promise((res, rej) => {
                        const tx = db.transaction('queue', 'readwrite');
                        tx.objectStore('queue').delete(item.id);
                        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
                    });
                }
            } catch (e) { /* keep queued */ }
        }
        db.close();
        setStatus('');
    }

    /* ── Tiny cache for catalogs ───────────────────────────────────── */
    async function cachePut(key, val) { try { localStorage.setItem('fs_' + key, JSON.stringify(val)); } catch (e) {} }
    async function cacheGet(key) { try { return JSON.parse(localStorage.getItem('fs_' + key)); } catch (e) { return null; } }

    function setStatus(msg) {
        const s = $('status');
        if (!msg) { s.hidden = true; return; }
        s.textContent = msg; s.hidden = false;
    }

    /* ── Wire up ───────────────────────────────────────────────────── */
    function init() {
        $('langSelect').value = state.lang;
        renderLabels();
        loadCatalogs();

        $('langSelect').addEventListener('change', (e) => {
            state.lang = e.target.value;
            localStorage.setItem('fs_lang', state.lang);
            renderLabels();
            fillDistricts(); fillCrops(); fillStages();
        });
        $('crop').addEventListener('change', fillStages);
        $('captureBtn').addEventListener('click', () => $('fileInput').click());
        $('galleryBtn').addEventListener('click', () => $('galleryInput').click());
        $('fileInput').addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });
        $('galleryInput').addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });
        $('micBtn').addEventListener('click', startDictation);
        $('locationBtn').addEventListener('click', useLocation);
        $('analyzeBtn').addEventListener('click', analyze);
        $('speakBtn').addEventListener('click', speak);
        $('newBtn').addEventListener('click', () => {
            $('resultCard').hidden = true;
            state.imageBlob = null;
            $('fileInput').value = '';
            $('galleryInput').value = '';
            $('photoPreview').hidden = true;
            $('observations').value = '';
            state.coordinates = null;
            $('locationNote').textContent = t('locationHint', state.lang);
            window.__lastResult = null;
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
        if (!navigator.onLine) flushQueue();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
