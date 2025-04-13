#!/usr/bin/env node
import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';
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
const server = new McpServer({
    name: "mcp-crypto-market-data",
    description: "MCP server providing cryptocurrency market data via CoinGecko API",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
server.tool("getCoinMarketChart", "Get historical market chart data for a specific coin, including price, market cap, and volume", CoinGeckoMarketChartSchema.shape, async (args, extra) => {
    try {
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
        const url = `https://api.coingecko.com/api/v3/coins/${args.coinId}/market_chart`;
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
        return {
            content: [
                {
                    type: "text",
                    text: `Market chart data for ${args.coinId} (${args.days} days in ${args.vsCurrency}):\n\n${JSON.stringify(response.data, null, 2)}`
                }
            ]
        };
    }
    catch (error) {
        let errorMessage = "An error occurred while fetching data from CoinGecko API";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = `CoinGecko API Error: ${error.response.status} - ${error.response.statusText}`;
            if (error.response.data) {
                errorMessage += `\nDetails: ${JSON.stringify(error.response.data)}`;
            }
        }
        else if (error instanceof Error) {
            errorMessage = `Error: ${error.message}`;
        }
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: errorMessage
                }
            ]
        };
    }
});
async function startServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
    }
    catch (err) {
        process.exit(1);
    }
}
startServer();
