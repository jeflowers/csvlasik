const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const translationService = require('../services/translationService');

// Get available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = ['en', 'es', 'es-MX', 'pt-BR', 'tl', 'ko', 'vi', 'zh', 'ar', 'hy', 'he'];
    
    const languageDetails = languages.map(code => ({
      code,
      name: getLanguageName(code),
      rtl: ['ar', 'he'].includes(code)
    }));
    
    res.json(languageDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Translate text
router.post('/translate', authMiddleware, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }
    
    const translation = await translationService.translate(text, targetLanguage, sourceLanguage);
    
    res.json({
      originalText: text,
      translatedText: translation,
      sourceLanguage,
      targetLanguage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get language names
function getLanguageName(code) {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'es-MX': 'Spanish (Mexico)',
    'pt-BR': 'Portuguese (Brazil)',
    'tl': 'Tagalog',
    'ko': 'Korean',
    'vi': 'Vietnamese',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'he': 'Hebrew'
  };
  return languages[code] || code;
}

module.exports = router;
