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

    const { collectionId, collectionName } = req.body;
    
    if (!collectionId) {
      return res.status(400).json({ msg: 'Please select an outfit.' });
    }

    const Collection = require('../models/Collection');
    const collection = await Collection.findOne({ _id: collectionId, user: userId }).populate('items');

    if (!collection || !collection.items || collection.items.length < 2) {
      return res.status(400).json({ msg: 'Outfit not found or does not have enough items (minimum 2).' });
    }

    const wardrobe = collection.items;

    // Format wardrobe data for the LLM
    const itemsData = wardrobe.map(item => 
      `ID: ${item._id.toString()}, Category: ${item.category}, Color: ${item.color}, Brand: ${item.brand}`
    ).join('\n');

    let aiText = '';
    let selectedIds = [];

    if (ai) {
      const prompt = `You are a professional fashion stylist. Below is a list of clothing items from a user's outfit. 
Create an extensive, aesthetically pleasing editorial lookbook from these items.
Select exactly one top, one bottom, and optionally one pair of shoes or accessory.

Wardrobe Items:
${itemsData}

Return a strictly formatted JSON object (without markdown wrappers, just raw JSON) matching this exact format:
{
  "selectedItemIds": ["<id1>", "<id2>", "<id3>"],
  "title": "${collectionName}",
  "description": "<A detailed, magazine-style styling editorial. Write at least 2-3 long, information-rich paragraphs about the color theory, silhouette, and why these pieces work together. Use double newlines for paragraphs.>",
  "season": "<Spring/Summer/Fall/Winter>"
}`;

      try {
        const response = await ai.models.generateContent({
            model: 'gemini-pro',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        
        let jsonStr = response.text;
        // Robust JSON extraction
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        const jsonResult = JSON.parse(jsonStr.trim());
        
        aiText = jsonResult;
        selectedIds = jsonResult.selectedItemIds;
        
      } catch (err) {
        console.error("Gemini API call failed, using fallback:", err);
        selectedIds = [wardrobe[0]._id.toString(), wardrobe[1]._id.toString(), wardrobe[2]?._id?.toString()].filter(Boolean);
        aiText = {
          title: collectionName || "The Minimalist Edit",
          description: "This curated ensemble focuses on the intersection of comfort and high-fashion editorial styling. By blending these specific textures, we create a silhouette that feels both modern and timeless.\n\nThe tonal relationship between these pieces allows for a cohesive look that transitions perfectly from a professional daytime setting to an elegant evening social. The choice of accessories further elevates the primary items, highlighting the thoughtful curation of your personal collection.",
          season: "Spring / 2026"
        };
      }
    } else {
      // Mock logic if API key isn't provided yet
      // Fallback selection for demo purposes
      selectedIds = [wardrobe[0]._id, wardrobe[1]._id, wardrobe[2]?._id].filter(Boolean);
      aiText = {
        title: collectionName || "The Minimalist Edit",
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

const Lookbook = require('../models/Lookbook');

exports.analyzeTrendsAndRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch recent lookbooks to analyze
    const lookbooks = await Lookbook.find().populate('user', 'username').sort({ createdAt: -1 }).limit(20);
    
    if (lookbooks.length === 0) {
      return res.json({ trends: [], recommendations: ["Start creating lookbooks and engaging with others to get recommendations!"] });
    }

    // Format lookbooks data for the LLM
    const lookbooksData = lookbooks.map(lb => {
      const avgRating = lb.ratings?.length ? (lb.ratings.reduce((acc, r) => acc + r.score, 0) / lb.ratings.length).toFixed(1) : 'No ratings';
      const commentsText = lb.comments?.map(c => c.text).join(' | ') || 'No comments';
      return `Style Title: ${lb.title}, Description: ${lb.description}, Tags: ${lb.tags?.join(',') || 'none'}, Avg Rating: ${avgRating}/5, Feedback: [${commentsText}]`;
    }).join('\n');

    let aiText = '';

    if (ai) {
      const prompt = `You are a professional fashion analyst. Below is a list of recent lookbooks from our community.
Analyze this data to identify current fashion trends within the community. Make the trends simple to understand.

Community Lookbooks Data:
${lookbooksData}

Return a strictly formatted JSON object (without markdown wrappers, just raw JSON) matching this exact format:
{
  "trends": [
    { 
      "name": "<Trend Name>", 
      "description": "<One short, simple sentence>",
      "colorHex": "<A hex color code representing this trend, e.g., #ffb6b9>",
      "engagementScore": <A number between 50 and 100 representing how popular this trend is>
    }
  ]
}
Return at most 4 trends. Do not return recommendations.`;

      try {
        const response = await ai.models.generateContent({
            model: 'gemini-pro',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        
        let jsonStr = response.text;
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        const jsonResult = JSON.parse(jsonStr.trim());
        return res.json(jsonResult);
        
      } catch (err) {
        console.error("Gemini API call failed for trends, using fallback:", err);
        return res.json({
          trends: [
            { name: "Minimalist Staples", description: "Clean lines and neutral tones are dominating the community.", colorHex: "#f4f1ea", engagementScore: 92 },
            { name: "Archival Vintage", description: "A massive surge in 90s era designer pieces.", colorHex: "#8b5a2b", engagementScore: 78 },
            { name: "Dopamine Dressing", description: "Bright, saturated colors to lift the mood.", colorHex: "#ff69b4", engagementScore: 85 }
          ]
        });
      }
    } else {
      // Mock logic if API key isn't provided
      return res.json({
        trends: [
          { name: "Minimalist Staples", description: "Clean lines and neutral tones.", colorHex: "#f4f1ea", engagementScore: 92 },
          { name: "Vintage Revival", description: "Loving archival pieces.", colorHex: "#8b5a2b", engagementScore: 78 },
          { name: "Y2K Aesthetic", description: "Bright colors and bold accessories.", colorHex: "#ff69b4", engagementScore: 85 }
        ]
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPersonalRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const wardrobe = await WardrobeItem.find({ user: userId });
    
    if (wardrobe.length === 0) {
      return res.json({
        advice: "Your wardrobe is empty. Start by adding some basics like a plain t-shirt and jeans!",
        missingPieces: ["Basic T-Shirt", "Everyday Jeans", "Versatile Sneakers"]
      });
    }

    const itemsData = wardrobe.map(item => 
      `Category: ${item.category}, Color: ${item.color}, Brand: ${item.brand}`
    ).join('\n');

    if (ai) {
      const prompt = `You are a personal fashion stylist. Review the user's current wardrobe items:
${itemsData}

Give them a short, friendly piece of styling advice (1-2 sentences) about their current collection, and list 3 specific pieces they are missing that would complete their wardrobe.

Return a strictly formatted JSON object (without markdown wrappers):
{
  "advice": "<Styling advice>",
  "missingPieces": ["<Piece 1>", "<Piece 2>", "<Piece 3>"]
}`;

      try {
        const response = await ai.models.generateContent({
            model: 'gemini-pro',
            contents: prompt,
            config: { temperature: 0.7 }
        });
        
        let jsonStr = response.text;
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        return res.json(JSON.parse(jsonStr.trim()));
      } catch (err) {
        console.error("Gemini personal recs failed, using fallback:", err);
        return res.json({
          advice: "You have a great start to your wardrobe. Consider adding more versatile colors to mix and match.",
          missingPieces: ["A tailored blazer", "Classic white sneakers", "A statement accessory"]
        });
      }
    } else {
      return res.json({
        advice: "You have a great start to your wardrobe. Consider adding more versatile colors to mix and match.",
        missingPieces: ["A tailored blazer", "Classic white sneakers", "A statement accessory"]
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
