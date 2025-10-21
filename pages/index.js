import { useState } from 'react';

export default function Home() {
  const [jobUrl, setJobUrl] = useState('');
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 1. RECORD 15 s VOICE
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setVoiceBlob(blob);
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 15000);
  }

  // 2. GENERATE COVER + CV + VIDEO
  async function generateApplication() {
    if (!jobUrl || !voiceBlob) return alert('Drop URL + record voice first');
    setLoading(true);
    const form = new FormData();
    form.append('jobUrl', jobUrl);
    form.append('audio', voiceBlob);

    const res = await fetch('/api/generate', { method: 'POST', body: form });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 40, maxWidth: 720, margin: 'auto' }}>
      <h1>🚀 DreamJob Europe</h1>
      <p>Drop a job URL, speak for 15 s, get CV + cover + video in 8 s.</p>

      <h3>1. Job URL</h3>
      <input
        placeholder="Paste LinkedIn / Indeed / any job URL"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
        style={{ width: '100%', padding: 8 }}
      />

      <h3>2. Voice (15 s)</h3>
      <button onClick={startRecording}>🎤 Start Recording</button>
      {voiceBlob && <span style={{ marginLeft: 10 }}>✅ recorded</span>}

      <h3>3. Generate</h3>
      <button disabled={loading} onClick={generateApplication}>
        {loading ? 'Building...' : 'Generate Application'}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Results</h3>
          <a href={result.pdf} download="CV.pdf">📄 Download CV</a>
          <br />
          <a href={result.audio} download="CoverLetter.mp3">🎧 Cover audio (your voice)</a>
          <br />
          <a href={result.video} download="Video.mp4">🎥 Talking-head video</a>
        </div>
      )}
    </div>
  );
}
