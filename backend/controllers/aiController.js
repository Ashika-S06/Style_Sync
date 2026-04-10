const { GoogleGenAI } = require('@google/genai');
const WardrobeItem = require('../models/WardrobeItem');

// Initialize Gemini SDK
// It automatically picks up GEMINI_API_KEY from process.env
let ai;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    ai = new GoogleGenAI({});
  } else {
    console.warn("GEMINI_API_KEY is not set correctly. AI features may fail or return mocked data.");
  }
} catch (e) {
  console.error("GenAI init error", e);
}

exports.generateLookbook = async (req, res) => {
  try {
    const userId = req.user.id; // requires auth middleware

    const { selectedItemIds } = req.body;
    
    let wardrobe;
    if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
      wardrobe = await WardrobeItem.find({ 
        user: userId,
        _id: { $in: selectedItemIds }
      });
    } else {
      wardrobe = await WardrobeItem.find({ user: userId });
    }
    
    if (wardrobe.length < 2) {
      return res.status(400).json({ msg: 'Please select at least 2 items (or add more to your wardrobe) to generate a lookbook.' });
    }

    // Format wardrobe data for the LLM
    const itemsData = wardrobe.map(item => 
      `ID: ${item._id.toString()}, Category: ${item.category}, Color: ${item.color}, Brand: ${item.brand}`
    ).join('\n');

    let aiText = '';
    let selectedIds = [];

    if (ai) {
      const prompt = `You are a professional fashion stylist. Below is a list of clothing items from a user's wardrobe. 
Create exactly ONE aesthetically pleasing outfit from these items.
Select exactly one top, one bottom, and optionally one pair of shoes or accessory.

Wardrobe Items:
${itemsData}

Return a strictly formatted JSON object (without markdown wrappers, just raw JSON) matching this exact format:
{
  "selectedItemIds": ["<id1>", "<id2>", "<id3>"],
  "title": "<A catchy title for this lookbook, like 'Summer Breeze'>",
  "description": "<A magazine-style styling description about why you chose these pieces and how they work together for the current season, max 3-4 sentences>",
  "season": "<Spring/Summer/Fall/Winter>"
}`;

      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        
        let jsonStr = response.text;
        // Strip markdown if it returned any
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        }
        const jsonResult = JSON.parse(jsonStr.trim());
        
        aiText = jsonResult;
        selectedIds = jsonResult.selectedItemIds;
        
      } catch (err) {
        console.error("Gemini API call failed:", err);
        return res.status(500).json({ msg: 'AI generation failed. Check server logs or API key.' });
      }
    } else {
      // Mock logic if API key isn't provided yet
      // Fallback selection for demo purposes
      selectedIds = [wardrobe[0]._id, wardrobe[1]._id, wardrobe[2]?._id].filter(Boolean);
      aiText = {
        title: "The Minimalist Edit",
        description: "A softly curated selection of your wardrobe staples. Perfect for a casual afternoon or an effortless office look. The tonal matches bring forward a clean, modern silhouette.",
        season: "Spring / 2026"
      };
    }

    // Populate the full item objects so the frontend has the images
    const selectedItems = wardrobe.filter(item => selectedIds.includes(item._id.toString()));

    res.json({
      title: aiText.title,
      description: aiText.description,
      season: aiText.season,
      items: selectedItems
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
