# MCP Market Server

A simple Model Context Protocol (MCP) server using TypeScript and stdio communication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

## Development

For development with auto-recompilation:
```bash
npm run dev
```

## Features

- Implements the Model Context Protocol (MCP)
- Written in TypeScript
- Uses stdio for communication
- Registers a simple greeting tool

## Implementation Details

This server uses the `@modelcontextprotocol/sdk` to create an MCP server that:

1. Communicates via stdio
2. Registers a simple greeting tool that can be called
3. Follows the ES Module pattern

## Extending the Server

To extend this server:

1. Add more tools by using the `server.tool()` method
2. Implement additional capabilities like chat or embeddings
3. Experiment with other transport methods like HTTP or WebSockets 