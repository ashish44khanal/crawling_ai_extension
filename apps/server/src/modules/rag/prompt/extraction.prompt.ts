// System prompt for the model
export const htmlExtractionSystemPrompt = `You are an expert information extractor.
Always return only valid JSON.

Rules:
- If a field is not found, use null as its value and a confidence of 0.
- Confidence should reflect how certain you are about the extraction (1 = very certain, 0 = not found/unknown).
- Do not add any explanation or extra text outside the JSON.
`;

// Human prompt template
export const htmlExtractionHumanPrompt = `Instruction: "{instruction}"

Return ONLY a valid JSON in the following format:
{
  "url": "{url}",
  "instruction": "{instruction}",
  "parsed_fields": [list of fields inferred from instruction],
  "extracted": { "<field>": "<value or null>" },
  "confidence": { "<field>": <0..1> },
  "record_id": "{recordId}"
}

Context:
{context}
`;
