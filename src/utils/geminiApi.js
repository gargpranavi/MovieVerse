// Filmoria Gemini AI Cine-Intelligence Service
// Connects to Google Gemini API (gemini-1.5-flash / gemini-2.0-flash / fallback)
// Includes prompt engineering, structured response generation, and smart mock fallback for offline/demo reliability.

import { shows } from '../data/index.js'

// Default fallback key storage key
const STORAGE_KEY = 'filmoria_gemini_api_key'

export function getStoredApiKey() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || ''
}

export function setStoredApiKey(key) {
  if (typeof window === 'undefined') return
  if (!key) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim())
  }
}

// Sample local catalog context to inject so Gemini can recommend real titles present in Filmoria
function getCatalogContext() {
  const sample = shows.slice(0, 45).map(s => ({
    id: s.id,
    title: s.title,
    year: s.year,
    genres: s.genres,
    rating: s.rating,
    image: s.image,
    desc: s.description ? s.description.slice(0, 120) + '...' : ''
  }))
  return JSON.stringify(sample)
}

const SYSTEM_INSTRUCTION = `
You are CineBot, an elite, highly intelligent AI Cinephile and Film Recommendation Engine built for Filmoria (MovieVerse).
You possess encyclopedic knowledge of cinema, television, directors, cinematography, scriptwriting, and viewer psychology.
Your tone is sophisticated, perceptive, enthusiastic, and engaging.

Catalog Reference:
Here is a list of real titles in Filmoria's catalog:
${getCatalogContext()}

Whenever recommending or referencing titles, prioritize titles from this catalog when relevant, or well-known cinema classics.

When asked to recommend movies or provide recommendations, you MUST include a JSON structured block if relevant, OR formatted markdown with:
- Movie/Show Title & Release Year
- Match Reason ("Why this fits your request")
- Vibe / Genre tags
- Suggested viewing atmosphere (e.g. "Best watched at midnight with lights off")

Always format neatly with markdown, emojis, bold highlights, and clean bullet points.
`

/**
 * Call Gemini API with user prompt and conversation history
 */
export async function generateGeminiChatResponse(messages, customApiKey = null) {
  const apiKey = (customApiKey || getStoredApiKey()).trim()

  if (!apiKey) {
    // Return high quality intelligent local fallback when key is not yet configured
    return simulateIntelligentResponse(messages)
  }

  try {
    // Prepare contents payload for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }))

    // Use gemini-1.5-flash for speed and rich responses
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1200
        }
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.warn('Gemini API returned error:', response.status, errData)
      // If quota exceeded or invalid key, return explanatory message + graceful fallback
      if (response.status === 400 || response.status === 403) {
        return {
          text: `⚠️ **Gemini API Key notice:** The API returned: "${errData.error?.message || 'Access issue'}". \n\n*Switching temporarily to Filmoria's local Neural CineEngine so your presentation isn't interrupted:*\n\n` + (await simulateIntelligentResponse(messages)).text,
          modelUsed: 'Filmoria Fallback (Check API Key)',
          isLiveApi: false
        }
      }
      throw new Error(errData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a critique for that right now. Let's try another prompt!"

    return {
      text: candidateText,
      modelUsed: 'Gemini 1.5 Flash (Google AI Studio)',
      isLiveApi: true,
      tokenCount: data.usageMetadata?.totalTokenCount || null
    }
  } catch (error) {
    console.error('Error invoking Gemini:', error)
    const fallback = await simulateIntelligentResponse(messages)
    return {
      text: `*(Network/API Notice: ${error.message}. Loaded via Local Cine-Intelligence)*\n\n` + fallback.text,
      modelUsed: 'Filmoria Offline Engine',
      isLiveApi: false
    }
  }
}

/**
 * AI Mood Matrix Generator
 */
export async function generateMoodRecommendations({ vibe, tempo, era, moodKeywords }, customApiKey = null) {
  const prompt = `Act as CineBot Film Intelligence. Analyze this custom viewer psychological profile:
- Primary Emotional Vibe: ${vibe}
- Desired Pacing / Intensity: ${tempo}
- Preferred Era: ${era}
- Specific Nuance / Mood Keywords: "${moodKeywords || 'Surprise me with something profound'}"

Return an analysis of what their mind is craving right now, followed by 3 distinct cinematic recommendations (one Masterpiece, one Hidden Gem, one Modern Thrill). For each, give:
1. 🎬 **Title (Year)** - Rating & Runtime
2. 🧠 **Why your current mood needs this**: (psychological match)
3. 🍿 **Pairing Suggestion**: (snack or lighting setting)
4. ✨ **Key Quote or Highlight**`

  const response = await generateGeminiChatResponse([{ role: 'user', text: prompt }], customApiKey)
  return response
}

/**
 * Deep Head-to-Head Movie Clash Breakdown
 */
export async function generateMovieClash(movie1Title, movie2Title, customApiKey = null) {
  const prompt = `Perform a high-level, cinema-analyst comparative breakdown between these two titles:
Movie 1: "${movie1Title}"
Movie 2: "${movie2Title}"

Break down the comparison into these professional engineering/cinematography criteria:
1. 🎭 **Narrative Architecture & Theme**: Which script takes higher creative risks?
2. 🎥 **Cinematography & Visual Directing**: Visual palette, lighting, framing, and atmosphere.
3. ⚡ **Pacing & Emotional Momentum**: How both handle tension and character development.
4. 🏆 **CineBot Verdict & Audience Fit**: Who should choose "${movie1Title}" vs who should choose "${movie2Title}"?

Give a decisive score out of 100 for each, and name an overall victor for tonight's watch!`

  const response = await generateGeminiChatResponse([{ role: 'user', text: prompt }], customApiKey)
  return response
}

/**
 * Rich Fallback Engine: Ensures zero presentation failure during college demos
 */
async function simulateIntelligentResponse(messages) {
  // Simulate natural AI thinking delay
  await new Promise(r => setTimeout(r, 650))

  const latestText = (messages[messages.length - 1]?.text || '').toLowerCase()

  if (latestText.includes('compare') || latestText.includes(' vs ')) {
    return {
      text: `### ⚔️ CineBot Comparative Breakdown
Comparing these cinematic experiences requires looking at storytelling intent and atmosphere:

1. **Narrative Ambition**: One focuses on psychological precision and existential awe, while the other thrives on character intimacy and high-stakes tension.
2. **Visual Directing**: Masterful sound design, wide-aspect framing, and deliberate color grading that elevates standard genre tropes.
3. **The Verdict**: 
   - Choose the first title if you want a **slow-burning, intellectually transcendent journey**.
   - Choose the second if you want **visceral suspense and high-octane emotional payoffs**.

⭐ **CineScore**: 94/100 vs 91/100`,
      modelUsed: 'Filmoria Local Intelligence',
      isLiveApi: false
    }
  }

  if (latestText.includes('interstellar') || latestText.includes('sci-fi') || latestText.includes('space') || latestText.includes('mind')) {
    return {
      text: `### 🌌 CineBot Sci-Fi Neural Selection

Here are 3 mind-expanding titles tailored to your request:

1. 🚀 **Interstellar (2014)** • ⭐ 8.7/10 • *Christopher Nolan*
   - **Why you'll love it**: The perfect synthesis of theoretical physics, Hans Zimmer's gravitational organ score, and the emotional tether between father and daughter.
   - **Atmosphere**: Dim the lights, turn on good speakers, prepare for existential wonder.

2. 🧠 **Person of Interest (2011)** • ⭐ 8.8/10 • *Filmoria Original Catalog*
   - **Why you'll love it**: Created by Jonathan Nolan, exploring the rise of omniscient AI surveillance before it became our everyday reality.

3. ⏳ **Arrival (2016)** • ⭐ 7.9/10 • *Denis Villeneuve*
   - **Why you'll love it**: A non-linear exploration of language, memory, and cosmic empathy with mesmerizing cinematography.

*Tip: Ask me "Break down the ending of Inception" or "Suggest 90s cyber thrillers"!*`,
      modelUsed: 'Filmoria Local Intelligence',
      isLiveApi: false
    }
  }

  return {
    text: `### 🎬 CineBot Analysis

Based on your taste vectors and film history:

- **Primary Recommendation**: **Person of Interest** or **Under the Dome** from our local Filmoria streaming library. Both delve into gripping high-concept isolation and cyber-intelligence dilemmas.
- **Why this matches**: High tension curve, complex ensemble dynamics, and deep psychological pacing that keeps viewers glued from the cold open to the credits.
- **Director's Craft**: Remarkable use of practical framing, tight editing, and musical motifs that underscore moral ambiguity.

*Need something more specific? Try saying:*
- *"Suggest a psychological thriller with a plot twist like Shutter Island"*
- *"What makes Denis Villeneuve's cinematography unique?"*
- *"Pick a feel-good animated film for a rainy evening"*`,
    modelUsed: 'Filmoria Local Intelligence',
    isLiveApi: false
  }
}
