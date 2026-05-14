"use client";

// Predefined list of major investment currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'USA' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'UK' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
];

/**
 * Fetches the current exchange rate from a public API.
 * Defaulting to a free API like exchangerate-api.com or similar.
 * For production, a more robust API with an API key would be used.
 */
export async function getExchangeRate(from: string, to: string = 'INR'): Promise<number> {
  try {
    // Using a public API for live rates. 
    // In a real app, this would be proxied through a server action with an API key.
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await response.json();
    
    if (data && data.rates && data.rates[to]) {
      return data.rates[to];
    }
    
    // Fallbacks based on rough current rates if API fails
    const fallbacks: Record<string, number> = {
      'USD': 83.5,
      'EUR': 90.2,
      'GBP': 105.5,
      'JPY': 0.55,
      'CAD': 61.2,
      'AUD': 55.4,
      'HKD': 10.7,
      'SGD': 62.1
    };
    
    return fallbacks[from] || 1;
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return 1;
  }
}
