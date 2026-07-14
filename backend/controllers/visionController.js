/**
 * Vision Controller — AI-powered product label scanning
 *
 * Uses Groq's Llama 4 Scout vision model to extract product details
 * (name, MRP, barcode) from product label images.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * POST /api/vision/scan
 * Body: { image: "data:image/jpeg;base64,..." }
 * Returns: { name, mrp, barcode }
 */
export const scanProductLabel = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image data is required.' });
    }

    // Validate that it looks like a base64 data URI
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Expected base64 data URI.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[VISION] GROQ_API_KEY is not configured');
      return res.status(500).json({ message: 'Vision service is not configured.' });
    }

    // Call Groq Vision API
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a product label OCR assistant for a wholesale billing system. 
Analyze this product label image and extract the following information.
Return ONLY a JSON object with these exact keys:
- "name": The product name or brand name visible on the label (string, or null if not found)
- "mrp": The MRP (Maximum Retail Price) as a number only, without currency symbols (number, or null if not found)
- "barcode": The barcode number if visible (string, or null if not found)

Important rules:
- For MRP, extract only the numeric value (e.g., if label says "MRP:1379/-" return 1379)
- For name, use the brand/product name (e.g., "Hunar", "Banarasi Silk Saree")
- If a field is not clearly visible, set it to null
- Return ONLY valid JSON, no extra text`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_completion_tokens: 256,
        top_p: 1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      console.error('[VISION] Groq API error:', groqResponse.status, errorData);
      return res.status(502).json({
        message: 'Failed to process image. Please try again.',
        detail: errorData?.error?.message || 'Vision service error',
      });
    }

    const groqData = await groqResponse.json();
    const content = groqData?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ message: 'No response from vision service.' });
    }

    // Parse the JSON response from the model
    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (parseErr) {
      console.error('[VISION] Failed to parse model response:', content);
      return res.status(502).json({ message: 'Could not parse product details from image.' });
    }

    // Normalize and validate the response
    const result = {
      name: typeof extracted.name === 'string' ? extracted.name.trim() : null,
      mrp: extracted.mrp !== null && extracted.mrp !== undefined ? parseFloat(extracted.mrp) || null : null,
      barcode: typeof extracted.barcode === 'string' ? extracted.barcode.trim() : null,
    };

    console.log(`[VISION] Scan successful — Name: ${result.name}, MRP: ${result.mrp}, Barcode: ${result.barcode}`);

    return res.json(result);
  } catch (error) {
    console.error('[VISION] Unexpected error:', error.message);
    return res.status(500).json({ message: 'An unexpected error occurred while scanning.' });
  }
};
