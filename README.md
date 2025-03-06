# Tmux MCP Server

Model Context Protocol server for interfacing with tmux sessions. This allows Claude Desktop to interact with and view tmux session content.

## Features

- List tmux sessions
- Search for tmux session by name
- List tmux windows and panes
- Expose terminal content in tmux sessions/panes
- Create new tmux sessions and windows

## Installation

```bash
npm install
npm run build
```

## Usage

Configure Claude Desktop to use this MCP server by adding it to your `claude_desktop_config.json`.
