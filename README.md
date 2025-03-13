# Tmux MCP Server

Model Context Protocol server that enables Claude Desktop to interact with and view tmux session content. This integration allows AI assistants to read from, control, and observe your terminal sessions.

## Features

- List and search tmux sessions
- View and navigate tmux windows and panes
- Capture and expose terminal content from any pane
- Execute commands in tmux panes and retrieve results
- Create new tmux sessions and windows

## Prerequisites

- Node.js
- npm or yarn
- tmux installed and running

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tmux-mcp.git
cd tmux-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Configure Claude Desktop

Add this MCP server to your Claude Desktop configuration:

```json
"mcpServers": {
  "tmux": {
    "command": "/path/to/node",
    "args": [
      "path/to/tmux-mcp/build/index.js"
    ]
  }
}
```

### MCP server options

You can optionally specify the command line shell you are using, if unspecified it defaults to `bash`

```json
"mcpServers": {
  "tmux": {
    "command": "/path/to/node",
    "args": [
      "path/to/tmux-mcp/build/index.js",
      "--shell-type=fish"
    ]
  }
}
```

The MCP server needs to know the shell only when executing command, to properly read its exit status.

## Available Resources

- `tmux://sessions` - List all tmux sessions
- `tmux://pane/{paneId}` - View content of a specific tmux pane
- `tmux://command/{commandId}/result` - Results from executed commands

## Available Tools

- `list-sessions` - List all active tmux sessions
- `find-session` - Find a tmux session by name
- `list-windows` - List windows in a tmux session
- `list-panes` - List panes in a tmux window
- `capture-pane` - Capture content from a tmux pane
- `create-session` - Create a new tmux session
- `create-window` - Create a new window in a tmux session
- `execute-command` - Execute a command in a tmux pane
- `get-command-result` - Get the result of an executed command

