# MCP Market

A Model Context Protocol server with tools for accessing cryptocurrency market data from CoinGecko.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create an `.env` file in the root directory and add your CoinGecko API key:
   ```
   # API Keys
   COINGECKO_API_KEY=your_coingecko_api_key_here
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Run the server:
   ```
   npm start
   ```

## Available Tools

### getCoinMarketChart

Gets historical market chart data for a specific cryptocurrency, including price, market cap, and volume.

Parameters (all validated with Zod):
- `coinId` (optional): The ID of the coin to fetch data for (e.g., 'bitcoin', 'ethereum'). Defaults to 'bitcoin'.
- `vsCurrency` (optional): The currency to display prices in (e.g., 'usd', 'eur', 'jpy'). Defaults to 'usd'.
- `days` (optional): Number of days of data to retrieve (e.g., '1', '14', '30', '90', 'max'). Defaults to '30'.
- `interval` (optional): Data interval. Leave empty for automatic selection based on time range.

Example usage:
```javascript
{
  "coinId": "ethereum",
  "vsCurrency": "usd",
  "days": "7"
}
```

## CoinGecko API Documentation

For more information on the CoinGecko API, see the official documentation:
- [CoinGecko API Documentation](https://docs.coingecko.com/v3.0.1/)
- [Coin Historical Chart Data by ID](https://docs.coingecko.com/v3.0.1/reference/coins-id-market-chart)

## Development

For development with auto-recompilation:
```bash
npm run dev
```

## Features

- Implements the Model Context Protocol (MCP)
- Written in TypeScript
- Uses stdio for communication
- Provides cryptocurrency market data via CoinGecko API
- Parameter validation with Zod

## Implementation Details

This server uses the `@modelcontextprotocol/sdk` to create an MCP server that:

1. Communicates via stdio
2. Provides historical market chart data for cryptocurrencies
3. Follows the ES Module pattern
4. Validates input parameters using Zod schemas

## Extending the Server

To extend this server:

1. Add more tools by using the `server.tool()` method
2. Implement additional CoinGecko API endpoints
3. Experiment with other transport methods like HTTP or WebSockets 