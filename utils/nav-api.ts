export interface MFNAVResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: Array<{
    date: string;
    nav: string;
  }>;
  status: string;
}

export interface MFSearchResponse {
  schemeCode: number;
  schemeName: string;
}

export async function searchMutualFunds(query: string): Promise<MFSearchResponse[]> {
  if (!query || query.length < 3) return [];
  try {
    const response = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.error(`Error searching for mutual funds with query ${query}:`);
      return [];
    }

    return (await response.json()) as MFSearchResponse[];
  } catch (error) {
    console.error(`Error searching for mutual funds with query ${query}:`, error);
    return [];
  }
}

export interface StockSearchResponse {
  symbol: string;
  shortname: string;
  longname?: string;
  exchange: string;
  typeDisp: string;
}

export async function searchStocks(query: string): Promise<StockSearchResponse[]> {
  if (!query || query.length < 2) return [];
  try {
    // Using a public CORS proxy for Yahoo Finance search as it doesn't allow direct browser access easily
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`);
    if (!response.ok) {
      console.error(`Error searching for stocks with query ${query}:`);
      return [];
    }

    const json = await response.json();
    return (json.quotes || []) as StockSearchResponse[];
  } catch (error) {
    console.error(`Error searching for stocks with query ${query}:`, error);
    return [];
  }
}

export async function fetchMutualFundNAV(schemeCode: string): Promise<number | null> {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!response.ok) {
      console.error(`Error fetching NAV for scheme code ${schemeCode}:`);
      return null;
    }

    const json = (await response.json()) as MFNAVResponse;
    if (json.status === "SUCCESS" && json.data.length > 0) {
      return parseFloat(json.data[0].nav);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching NAV for scheme code ${schemeCode}:`, error);
    return null;
  }
}
