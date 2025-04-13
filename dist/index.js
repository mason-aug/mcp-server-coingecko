#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const axios_1 = tslib_1.__importDefault(require("axios"));
const zod_1 = require("zod");
const CoinGeckoMarketChartSchema = zod_1.z.object({
    coinId: zod_1.z.string()
        .optional()
        .default('bitcoin')
        .describe('The ID of the coin to fetch market data for (e.g., bitcoin, ethereum)'),
    vsCurrency: zod_1.z.string()
        .optional()
        .default('usd')
        .describe('The currency to display prices in (e.g., usd, eur, jpy)'),
    days: zod_1.z.string()
        .optional()
        .default('30')
        .describe('Number of days of data to retrieve (e.g., 1, 14, 30, 90, max)'),
    interval: zod_1.z.string()
        .optional()
        .default('')
        .describe('Data interval (empty for automatic, daily, hourly, etc.)')
});
const server = new mcp_js_1.McpServer({
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
        const response = await axios_1.default.get(url, {
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
        if (axios_1.default.isAxiosError(error) && error.response) {
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
        console.log("Environment variables loaded. CoinGecko API key is configured.");
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        console.log("MCP Server started using stdio");
    }
    catch (err) {
        console.error("Failed to start MCP server:", err);
        process.exit(1);
    }
}
startServer();
