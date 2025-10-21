import { OpenAI } from 'openai';
import Replicate from 'replicate';
import FormData from 'form-data';
import fetch from 'node-fetch';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const form = new FormData();
    await new Promise((resolve, reject) => {
      req.pipe(form);
      form.once('end', resolve);
      form.once('error', reject);
    });

    const jobUrl = form.get('jobUrl');
    const audioFile = form.get('audio');

    // 1. SCRAPE JOB
    const fireRes = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: jobUrl })
    });
    const jobData = (await fireRes.json()).data;

    // 2. AI COVER LETTER
    const coverPrompt = `Write a 250-word cover letter for ${jobData.title} at ${jobData.company}. Culture: ${jobData.description}.`;
    const gpt = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: coverPrompt }]
    });
    const letter = gpt.choices[0].message.content;

    // 3. CLONE VOICE + SPEECH
    const voice = await replicate.run(
      'elevenlabs/eleven-multilingual-v2:0de6835c94c2',
      { input: { text: letter, audio: audioFile } }
    );

    // 4. TALKING-HEAD VIDEO
    const video = await replicate.run(
      'lucataco/live-portrait:4b8a8efdfeb9921694e8f5d6b8ba5f5a9a0c6e7b',
      { input: { source_image: 'https://i.pravatar.cc/300?u=you', driven_audio: voice } }
    );

    // 5. PDF (simpel)
    const pdfUrl = `data:application/pdf,CV%20for%20${encodeURIComponent(jobData.title)}`;

    // 6. RETURN LINKS
    res.status(200).json({ pdf: pdfUrl, audio: voice, video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
