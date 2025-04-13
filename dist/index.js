// Import using specific paths based on the exports field in package.json
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// Create a new MCP server
const server = new McpServer({
    name: "mcp-market-model",
    description: "A simple MCP model server",
    version: "1.0.0"
});
// Register a simple greeting tool as an example
server.tool("greet", "A simple greeting tool", (extra) => {
    return {
        content: [
            {
                type: "text",
                text: "Hello from MCP Server!"
            }
        ]
    };
});
// Start the server with stdio transport
async function startServer() {
    try {
        // Start receiving messages on stdin and sending messages on stdout
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("MCP Server started using stdio");
    }
    catch (err) {
        console.error("Failed to start MCP server:", err);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map