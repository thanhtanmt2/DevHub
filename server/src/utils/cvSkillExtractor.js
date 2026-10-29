const fs = require('fs');
const path = require('path');
const { Skill, CandidateSkill } = require('../models');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

// DÃ¹ng Gemini Ä‘á»c trá»±c tiáº¿p file CV (PDF) vÃ  chá»n ra cÃ¡c ká»¹ nÄƒng cÃ³ trong danh sÃ¡ch ká»¹ nÄƒng cá»§a há»‡ thá»‘ng.
async function askGemini(buffer, skillNames) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const prompt =
    'ÄÃ¢y lÃ  CV cá»§a má»™t á»©ng viÃªn. Tá»« DANH SÃCH Ká»¸ NÄ‚NG bÃªn dÆ°á»›i, hÃ£y chá»n ra nhá»¯ng ká»¹ nÄƒng mÃ  á»©ng viÃªn thá»±c sá»± cÃ³ trong CV ' +
    '(Ä‘Æ°á»£c nháº¯c Ä‘áº¿n trong pháº§n ká»¹ nÄƒng, kinh nghiá»‡m hoáº·c dá»± Ã¡n). Chá»‰ tráº£ vá» tÃªn Ä‘Ãºng nhÆ° trong danh sÃ¡ch, khÃ´ng thÃªm tÃªn má»›i. ' +
    'Tráº£ vá» JSON lÃ  máº£ng chuá»—i.\n\nDANH SÃCH Ká»¸ NÄ‚NG:\n' + skillNames.join(', ');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'application/pdf', data: buffer.toString('base64') } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const arr = JSON.parse(text);
  return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
}

// Lá»c ká»¹ nÄƒng tá»« CV vÃ  tá»± thÃªm vÃ o há»“ sÆ¡ (source = CV). KhÃ´ng bao giá» nÃ©m lá»—i ra ngoÃ i:
// thiáº¿u API key / file khÃ´ng pháº£i PDF / Gemini lá»—i thÃ¬ chá»‰ bá» qua, khÃ´ng áº£nh hÆ°á»Ÿng viá»‡c lÆ°u CV.
// Tráº£ vá» danh sÃ¡ch tÃªn ká»¹ nÄƒng má»›i Ä‘Æ°á»£c thÃªm.
async function extractSkillsFromCv(profileId, fileUrl) {
  try {
    if (!process.env.GEMINI_API_KEY || !fileUrl) return [];
    if (path.extname(fileUrl.split('?')[0]).toLowerCase() !== '.pdf') return [];

    const filePath = path.join(UPLOAD_ROOT, fileUrl.split('?')[0].replace(/^\/?uploads\//, ''));
    if (!filePath.startsWith(UPLOAD_ROOT) || !fs.existsSync(filePath)) return [];

    const allSkills = await Skill.findAll({ attributes: ['id', 'name'] });
    if (!allSkills.length) return [];
    const names = await askGemini(fs.readFileSync(filePath), allSkills.map((s) => s.name));

    const byName = new Map(allSkills.map((s) => [s.name.trim().toLowerCase(), s]));
    const matched = [...new Set(names.map((n) => byName.get(n.trim().toLowerCase())).filter(Boolean))];
    const existing = new Set((await CandidateSkill.findAll({ where: { candidate_profile_id: profileId }, attributes: ['skill_id'] })).map((c) => c.skill_id));

    const added = [];
    for (const s of matched) {
      if (existing.has(s.id)) continue;
      await CandidateSkill.create({ candidate_profile_id: profileId, skill_id: s.id, source: 'CV' });
      added.push(s.name);
    }
    return added;
  } catch (err) {
    console.error('CV skill extraction failed:', err.message);
    return [];
  }
}

module.exports = { extractSkillsFromCv };
