#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

// Import using specific paths based on the exports field in package.json
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';

// Define Zod schema for CoinGecko API parameters
const CoinGeckoMarketChartSchema = z.object({
  coinId: z.string()
    .optional()
    .default('bitcoin')
    .describe('The ID of the coin to fetch market data for (e.g., bitcoin, ethereum)'),
  vsCurrency: z.string()
    .optional()
    .default('usd')
    .describe('The currency to display prices in (e.g., usd, eur, jpy)'),
  days: z.string()
    .optional()
    .default('30')
    .describe('Number of days of data to retrieve (e.g., 1, 14, 30, 90, max)'),
  interval: z.string()
    .optional()
    .default('')
    .describe('Data interval (empty for automatic, daily, hourly, etc.)')
});

// Type inference from Zod schema
type CoinGeckoMarketChartParams = z.infer<typeof CoinGeckoMarketChartSchema>;

// Create a new MCP server
const server = new McpServer({
  name: "mcp-crypto-market-data",
  description: "MCP server providing cryptocurrency market data via CoinGecko API",
  version: "1.0.0"
});

// Add a tool that fetches coin market chart data from CoinGecko API
server.tool(
  "getCoinMarketChart", 
  "Get historical market chart data for a specific coin, including price, market cap, and volume",
  CoinGeckoMarketChartSchema.shape, 
  async (args, extra) => {
    try {
      // Access the API key from environment variables
      const apiKey = process.env.COINGECKO_API_KEY;
      
      if (!apiKey) {
        return {
          content: [
            {
              type: "text",
              text: "Error: CoinGecko API key is not configured. Please add it to your .env file."
            }
          ]
        };
      }

      // Construct the API URL
      const url = `https://api.coingecko.com/api/v3/coins/${args.coinId}/market_chart`;
      
      // Make the API request with authentication header
      const response = await axios.get(url, {
        params: {
          vs_currency: args.vsCurrency,
          days: args.days,
          interval: args.interval
        },
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      });
      
      // Return the market chart data
      return {
        content: [
          {
            type: "text",
            text: `Market chart data for ${args.coinId} (${args.days} days in ${args.vsCurrency}):\n\n${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      // Handle errors
      let errorMessage = "An error occurred while fetching data from CoinGecko API";
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `CoinGecko API Error: ${error.response.status} - ${error.response.statusText}`;
        if (error.response.data) {
          errorMessage += `\nDetails: ${JSON.stringify(error.response.data)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ]
      };
    }
  }
);

// Start the server with stdio transport
async function startServer() {
  try {
    // Log that environment variables are loaded
    console.log("Environment variables loaded. CoinGecko API key is configured.");
    
    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log("MCP Server started using stdio");
  } catch (err) {
    console.error("Failed to start MCP server:", err);
    process.exit(1);
  }
}

startServer(); 