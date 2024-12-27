import { create } from "zustand";
import { DefaultApi } from "finnhub-ts";

// Initialize Finnhub client
const finnhubClient = new DefaultApi({
  apiKey: "ctmo28hr01qjlgiqisqgctmo28hr01qjlgiqisr0", // Replace with your actual API key
  isJsonMime: input => {
    try {
      JSON.parse(input);
      return true;
    } catch (error) {}
    return false;
  },
});

// Define the store
type Stock = {
  symbol: string;
  companyName: string;
  price: number | null;
};

type StockPriceStore = {
  stocks: Stock[];
  fetchAllPrices: () => Promise<void>;
};

export const useStockPriceStore = create<StockPriceStore>(set => ({
  stocks: [
    { symbol: "AAPL", companyName: "Apple Inc.", price: null },
    { symbol: "MSFT", companyName: "Microsoft Corp.", price: null },
    { symbol: "TSLA", companyName: "Tesla Inc.", price: null },
    { symbol: "AMZN", companyName: "Amazon.com Inc.", price: null },
    { symbol: "GOOGL", companyName: "Alphabet Inc.", price: null },
    { symbol: "META", companyName: "Meta Platforms Inc.", price: null },
    { symbol: "NVDA", companyName: "NVIDIA Corporation", price: null },
    { symbol: "NFLX", companyName: "Netflix Inc.", price: null },
    { symbol: "ADBE", companyName: "Adobe Inc.", price: null },
    { symbol: "INTC", companyName: "Intel Corporation", price: null },
  ],
  fetchAllPrices: async () => {
    try {
      // Fetch prices for all stocks
      const updatedStocks = await Promise.all(
        [
          { symbol: "AAPL", companyName: "Apple Inc." },
          { symbol: "MSFT", companyName: "Microsoft Corp." },
          { symbol: "TSLA", companyName: "Tesla Inc." },
          { symbol: "AMZN", companyName: "Amazon.com Inc." },
          { symbol: "GOOGL", companyName: "Alphabet Inc." },
          { symbol: "META", companyName: "Meta Platforms Inc." },
          { symbol: "NVDA", companyName: "NVIDIA Corporation" },
          { symbol: "NFLX", companyName: "Netflix Inc." },
          { symbol: "ADBE", companyName: "Adobe Inc." },
          { symbol: "INTC", companyName: "Intel Corporation" },
        ].map(async stock => {
          try {
            const response = await finnhubClient.quote(stock.symbol);
            return {
              ...stock,
              price: (response.data.c) ?? null, // Current price
            };
          } catch (error) {
            console.error(`Error fetching price for ${stock.symbol}:`, error);
            return { ...stock, price: null }; // Keep price as null on error
          }
        })
      );

      set({ stocks: updatedStocks });
    } catch (error) {
      console.error("Error fetching stock prices:", error);
    }
  },
}));
