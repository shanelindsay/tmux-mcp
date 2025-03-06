import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as tmux from "./tmux.js";

// Create MCP server
const server = new McpServer({
  name: "tmux-context",
  version: "0.1.0"
});

// List all tmux sessions - Tool
server.tool(
  "list-sessions",
  "List all active tmux sessions",
  {},
  async () => {
    try {
      const sessions = await tmux.listSessions();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(sessions, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error listing tmux sessions: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// Find session by name - Tool
server.tool(
  "find-session",
  "Find a tmux session by name",
  {
    name: z.string().describe("Name of the tmux session to find")
  },
  async ({ name }) => {
    try {
      const session = await tmux.findSessionByName(name);
      return {
        content: [{ 
          type: "text", 
          text: session ? JSON.stringify(session, null, 2) : `Session not found: ${name}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error finding tmux session: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// List windows in a session - Tool
server.tool(
  "list-windows",
  "List windows in a tmux session",
  {
    sessionId: z.string().describe("ID of the tmux session")
  },
  async ({ sessionId }) => {
    try {
      const windows = await tmux.listWindows(sessionId);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(windows, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error listing windows: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// List panes in a window - Tool
server.tool(
  "list-panes",
  "List panes in a tmux window",
  {
    windowId: z.string().describe("ID of the tmux window")
  },
  async ({ windowId }) => {
    try {
      const panes = await tmux.listPanes(windowId);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(panes, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error listing panes: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// Capture pane content - Tool
server.tool(
  "capture-pane",
  "Capture content from a tmux pane",
  {
    paneId: z.string().describe("ID of the tmux pane")
  },
  async ({ paneId }) => {
    try {
      const content = await tmux.capturePaneContent(paneId);
      return {
        content: [{ 
          type: "text", 
          text: content || "No content captured" 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error capturing pane content: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// Create new session - Tool
server.tool(
  "create-session",
  "Create a new tmux session",
  {
    name: z.string().describe("Name for the new tmux session")
  },
  async ({ name }) => {
    try {
      const session = await tmux.createSession(name);
      return {
        content: [{ 
          type: "text", 
          text: session 
            ? `Session created: ${JSON.stringify(session, null, 2)}` 
            : `Failed to create session: ${name}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error creating session: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// Create new window - Tool
server.tool(
  "create-window",
  "Create a new window in a tmux session",
  {
    sessionId: z.string().describe("ID of the tmux session"),
    name: z.string().describe("Name for the new window")
  },
  async ({ sessionId, name }) => {
    try {
      const window = await tmux.createWindow(sessionId, name);
      return {
        content: [{ 
          type: "text", 
          text: window 
            ? `Window created: ${JSON.stringify(window, null, 2)}` 
            : `Failed to create window: ${name}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error creating window: ${error}` 
        }],
        isError: true
      };
    }
  }
);

// Expose tmux session list as a resource
server.resource(
  "Sessions List",
  new ResourceTemplate("tmux://sessions", { list: undefined }),
  async () => {
    try {
      const sessions = await tmux.listSessions();
      return {
        contents: [{
          uri: "tmux://sessions",
          text: JSON.stringify(sessions, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: "tmux://sessions",
          text: `Error listing tmux sessions: ${error}`
        }]
      };
    }
  }
);

// Expose pane content as a resource
server.resource(
  "Pane Content",
  new ResourceTemplate("tmux://pane/{paneId}", { list: undefined }),
  async (uri, { paneId }) => {
    try {
      // Ensure paneId is a string
      const paneIdStr = Array.isArray(paneId) ? paneId[0] : paneId;
      const content = await tmux.capturePaneContent(paneIdStr);
      return {
        contents: [{
          uri: uri.href,
          text: content || "No content captured"
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error capturing pane content: ${error}`
        }]
      };
    }
  }
);

async function main() {
  console.error("Starting tmux-mcp server...");
  
  try {
    // Check if tmux is running
    const tmuxRunning = await tmux.isTmuxRunning();
    if (!tmuxRunning) {
      console.error("Warning: tmux doesn't appear to be running");
    }
    
    // Start the MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Server connected and running");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
