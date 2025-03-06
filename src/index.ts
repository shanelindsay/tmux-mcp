import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create MCP server
const server = new McpServer({
  name: "tmux-context",
  version: "0.1.0"
});

async function main() {
  console.error("Starting tmux-mcp server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Server connected and running");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
