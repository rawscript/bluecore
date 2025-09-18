// AI integration with Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with the provided API key
const GEMINI_API_KEY = "AIzaSyCWc0LOPSoE9AEHToBIFLsPaqwIxXn5-XY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Get AI suggestions for package updates
 * @param {Object} currentPackages - Current packages in the project
 * @returns {Promise<Object>} Suggestions object
 */
async function getAISuggestions(currentPackages) {
  try {
    console.log('Getting AI suggestions for package updates from Gemini...');
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a prompt for package suggestions
    const prompt = `Given these npm packages in a project:
${JSON.stringify(currentPackages, null, 2)}

Please provide:
1. Suggestions for outdated packages that should be updated
2. Alternative packages that might be better suited
3. Any deprecated packages that should be replaced

Respond in JSON format with this structure:
{
  "updates": [{"name": "package-name", "suggestedVersion": "version", "reason": "reason"}],
  "alternatives": [{"current": "package-name", "suggested": "alternative-package", "reason": "reason"}],
  "deprecated": [{"name": "package-name", "replacement": "replacement-package", "reason": "reason"}]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response (in case there's markdown formatting)
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Could not parse Gemini response as JSON, returning default structure');
      return {
        updates: [],
        alternatives: [],
        deprecated: []
      };
    }
  } catch (error) {
    console.error('Error getting AI suggestions from Gemini:', error.message);
    // Return default structure if there's an error
    return {
      updates: [],
      alternatives: [],
      deprecated: []
    };
  }
}

/**
 * Get AI suggestions for missing packages
 * @param {Array<string>} missingPackages - Array of missing package names
 * @returns {Promise<Object>} Suggestions object
 */
async function suggestPackagesForMissing(missingPackages) {
  try {
    console.log('Getting AI suggestions for missing packages from Gemini...');
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a prompt for package suggestions
    const prompt = `I need these npm packages for my project:
${missingPackages.join(', ')}

Please suggest the best versions to use and provide a brief reason for each.
Respond in JSON format with this structure:
{
  "suggestions": [{"name": "package-name", "suggestedVersion": "version", "reason": "reason"}]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response (in case there's markdown formatting)
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Could not parse Gemini response as JSON, returning default structure');
      return {
        suggestions: missingPackages.map(pkg => ({
          name: pkg,
          suggestedVersion: 'latest',
          reason: 'Popular package for this use case'
        }))
      };
    }
  } catch (error) {
    console.error('Error getting AI suggestions from Gemini:', error.message);
    // Return default structure if there's an error
    return {
      suggestions: missingPackages.map(pkg => ({
        name: pkg,
        suggestedVersion: 'latest',
        reason: 'Popular package for this use case'
      }))
    };
  }
}

module.exports = {
  getAISuggestions,
  suggestPackagesForMissing
};