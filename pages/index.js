  // 3. GENERATE (JSON)
  async function generateApplication() {
    if (!jobUrl || !voiceBlob) return alert('Drop URL + record voice first');
    setLoading(true);

    // audio → base64 string
    const reader = new FileReader();
    reader.readAsDataURL(voiceBlob);
    reader.onloadend = async () => {
      const audioBase64 = reader.result.split(',')[1];

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl, audio: audioBase64 })
      });
      const data = await res.json();
      setResult(data);
      setLoading(false);
    };
  }
