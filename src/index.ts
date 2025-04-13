// Load environment variables from .env file
import 'dotenv/config';

// Import using specific paths based on the exports field in package.json
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';

// Define types for CoinGecko API
interface CoinGeckoMarketChartParams {
  coinId?: string;      // The coin ID (e.g., 'bitcoin')
  vsCurrency?: string;  // The currency to compare against (e.g., 'usd')
  days?: string;        // Number of days of data to fetch
  interval?: string;    // Data interval (e.g., 'daily', 'hourly', or '' for automatic)
}

// Create a new MCP server
const server = new McpServer({
  name: "mcp-crypto-market-data",
  description: "MCP server providing cryptocurrency market data via CoinGecko API",
  version: "1.0.0"
});

// Add a tool that fetches coin market chart data from CoinGecko API
server.tool("getCoinMarketChart", "Get historical market chart data for a specific coin", async (extra: any) => {
  try {
    // Extract parameters from the extra object using our defined interface
    const params: CoinGeckoMarketChartParams = extra;
    const coinId = params.coinId || 'bitcoin'; // Default to bitcoin if not provided
    const vsCurrency = params.vsCurrency || 'usd'; // Default to USD if not provided
    const days = params.days || '30'; // Default to 30 days if not provided
    const interval = params.interval || ''; // Empty string for automatic granularity
    
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
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`;
    
    // Make the API request with authentication header
    const response = await axios.get(url, {
      params: {
        vs_currency: vsCurrency,
        days: days,
        interval: interval
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
          text: `Market chart data for ${coinId} (${days} days in ${vsCurrency}):\n\n${JSON.stringify(response.data, null, 2)}`
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
});

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