// pages/api/generate.js  –  JSON-only, no files
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { jobUrl, audio } = req.body;   // audio = base64 string
  if (!jobUrl) return res.status(400).json({ error: 'Missing jobUrl' });

  try {
    // 1. dummy job data
    const job = { title: 'Frontend Developer', company: 'ACME' };

    // 2. dummy cover letter
    const letter = `Dear ACME,\n\nI love ${job.title} and will ship features in week 1.\n\nBest,\nApplicant`;

    // 3. dummy URLs (later vervangen we door echte AI)
    const pdf  = 'data:application/pdf,CV%20for%20' + encodeURIComponent(job.title);
    const mp3  = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' + audio;
    const mp4  = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC' + audio;

    res.status(200).json({ pdf, audio: mp3, video: mp4 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
