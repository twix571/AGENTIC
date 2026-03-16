# AGENTS.md

## Project Overview

Wave Terminal is an open-source, AI-integrated terminal for macOS, Linux, and Windows. It features an AI assistant that reads terminal output, analyzes widgets, and performs file operations. Built with Go and Node.js (Electron).

**Main Repository:** https://github.com/wavetermdev/waveterm

**Key Features:**
- Wave AI - context-aware terminal assistant
- Durable SSH sessions with automatic reconnection
- Built-in file editor with syntax highlighting
- Rich file preview system
- Command Blocks for isolated command monitoring
- Multiple AI model support (OpenAI, Claude, Gemini, Azure, Ollama, etc.)
- WSH (Wave Shell) helper command system

## System Architecture

**Tech Stack:**
- **Main Backend:** Go (wavesrv component)
- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS (Electron app)
- **Terminal:** xterm.js v5 with addons (fit, search, serialize, web-links, webgl)
- **Editor:** Monaco Editor for code editing with syntax highlighting
- **Build Tool:** Task (Go-based alternative to Make)
- **AI SDKs:** @ai-sdk/react/ai, Anthropic/Gemini Google APIs via Go packages

**Project Structure:**
```
AGENTIC/
├── cmd/               # Go CLI tools and app entry points
│   ├── server/        # Main wavesrv backend
│   ├── wsh/           # Wave Shell helper binary
│   ├── testai/        # AI testing utilities
│   └── generatego     # Code generation tools
│
├── pkg/               # Core Go packages
│   ├── wavebase/      # Wave core framework
│   ├── waveapp/       # Wave application model
│   ├── wconfig/       # Configuration management
│   ├── tsunamisvc/    # Terminal (tsunami) services
│   ├── aiusechat/     # AI chat backend
│   ├── waveai/        # Wave AI intelligence
│   ├── remote/        # SSH/WSL connection handling
│   ├── blockcontroller/  # Terminal block lifecycle
│   ├── wps/           # Wave platform services
│   └── web/           # HTTP/websocket servers
│
├── tsunami/           # Custom terminal emulator (Go)
│   ├── app/           # Terminal app logic
│   ├── engine/        # Rendering engine
│   ├── ui/            # User interface components
│   ├── vdom/          # Custom virtual DOM
│   ├── templates/     # UI templates
│   └── rpctypes/      # RPC type definitions
│
├── frontend/          # React 19 + Electron app (Vite)
│   ├── app/           # Main application components
│   ├── layout/        # Drag-and-drop layout engine
│   ├── builder/       # View builders
│   ├── preview/       # Standalone component preview
│   └── types/         # TypeScript type definitions
│
├── emain/             # Email-related utilities
├── docs/              # Full documentation site
├── schema/            # Database and JSON schemas
├── tests/             # Integration and unit tests
├── testdriver/        # Automated testing driver
├── assets/            # Static assets (images, icons)
├── public/            # Publicly accessible files
└── aiprompts/         # AI prompt engineering docs
```

## Prerequisites

### Required Tools
- **Node.js 22 LTS** - JavaScript runtime (v22.20.0+)
- **npm 10.9** or later - Package manager
- **Go 1.25+** - Go runtime (go1.25.6)
- **Task CLI 3.49+** - Build automation tool

### Optional but Required for Builds
- **Zig compiler** - Required for statically linking CGO on Windows/Linux/macOS
  - Download from: https://ziglang.org/download/
  - Windows: zig-windows-x86_64-*.zip
  - macOS: zig-macos-x86_64-*.tar.xz
  - Linux: zig-linux-x86_64-*.tar.xz

### Supported Platforms
- **macOS 11+** (arm64, x64)
- **Windows 10 1809+** (x64)
- **Linux** (glibc-2.28+ / Debian 10, RHEL 8, Ubuntu 20.04+)

## Building

### Initialize Dependencies
```bash
task init
```
Installs both Go and Node.js dependencies. Run this after cloning the repo.

### Development Mode (Hot Reload)
```bash
task dev
```
Runs Electron app via Vite dev server with HMR.

### Standalone Build
```bash
task start
```
Builds and launches Electron app without dev server.

### Production Build
```bash
task package
```
Generates npm/NSIS/DMG packages in `make/` directory.

### Build Output Location
- Development logs: `~/.waveterm-dev/waveapp.log`
- Production builds: `make/` directory

## Project-Specific Commands

### Taskfile Tasks
| Task | Description |
|------|-------------|
| `task dev` | Run Electron via Vite dev server with HMR |
| `task start` | Run Electron directly (standalone, no HMR) |
| `task package` | Build & package distributable (make/) |
| `task preview` | Run component preview server (no Electron) |
| `task build:frontend:dev` | Build frontend in dev mode |
| `task build:backend` | Build wavesrv + wsh binaries |
| `task build:schema` | Generate configuration schemas |
| `task electron:quickdev` | Quick dev (arm64 only, no generate, no wsh) |

### Node.js Scripts
```json
{
  "dev": "electron-vite dev",
  "start": "electron-vite preview",
  "build:dev": "electron-vite build --mode development",
  "build:prod": "electron-vite build --mode production",
  "test": "vitest",
  "coverage": "vitest run --coverage"
}
```

### SSH/WSL Handling
- SSH connections managed in `pkg/remote/`
- WSL support via `pkg/wsl/` and `pkg/wslconn/`
- Local secret storage: `pkg/secretstore/` (native system backends)
- Session restoration using `pkg/streammanager/`

## Important Files

- **README.md** - Overview and features
- **BUILD.md** - Detailed build instructions
- **CONTRIBUTING.md** - Contribution guidelines
- **COE_OF_CONDUCT.md** - Code of conduct
- **Taskfile.yml** - Task automation configuration
- **package.json** - Node.js dependencies and scripts
- **go.mod** - Go module definitions

## Environment Variables

Check if they're already set:
```bash
# Node.js
echo $NODE_PATH

# Check config
~/.waveterm-dev/waveconfig.json  # Wave configuration file
```

## Testing

```bash
npm test                        # Run Vitest tests
npm run coverage                # Run tests with coverage report
```

Wave uses `vitest` for frontend testing.

## Wave AI Architecture

Wave AI enables context-aware terminal assistance:
- **Backend:** `pkg/aiusechat/` handles AI requests via Anthropic/Google APIs
- **Frontend:** `pkg/waveai/` provides AI interface and processing
- **Integration:** React AI widgets use `@ai-sdk/react/ai`
- **Mode Support:** Custom AI modes via `pkg/waveai/aimodes/`
- **Local Models:** Ollama and LM Studio via OpenAI-compatible APIs

## Configuration

Wave config is stored at:
- Windows: `C:\Users\[username]\AppData\Roaming\waveterm\waveconfig.json`
- macOS/Linux: `~/.waveterm-dev/waveconfig.json`

Default configs in: `pkg/wconfig/defaultconfig/` (settings.json, waveai.json, widgets.json, etc.)

## Wave Terminal Components

### Main Backend (Go/wavesrv)
- Handles SSH/WSL terminals via `pkg/remote/` and `pkg/wslconn/`
- SMTP email handling in `pkg/emaibeceiver/` (package `EMaibeceiver`)
- WebSocket streaming via `pkg/streamclient/`
- AI chat backend in `pkg/aiusechat/` (supports Anthropic, Google, OpenAI APIs)
- Secret management with native crypto APIs via `pkg/secretstore/`

### Custom Terminal (Go/tsunami)
- File-based terminal emulator
- Custom DOM rendering via `tsunami/vdom/`
- JSONRPC2 async communication
- Shell selection support
- Background rendering engine (see `tsunami/engine/render.md`)

## Troubleshooting

### Common Issues

**Issue: "task: command not found"**
- Solution: Install Task CLI via `npm install -g @go-task/cli`
- The installed package runs via wrapper script: `node "C:\Users\[username]\AppData\Roaming\npm\node_modules\@go-task\cli\run-task.js"`

**Issue: "zig: command not found"**
- Solution: Download Zig from https://ziglang.org/download/
- Extract to desired location (e.g., `C:\zig`)
- Add to PATH via Environment Variables

**Issue: Port already in use**
- Vite dev server uses ports. Check what's using them with `netstat -ano | find <port>`

**Issue: Go dependency errors**
- Run `task init` again to reinstall dependencies

## Relevant Documentation Links

- **Official Docs:** https://docs.waveterm.dev
- **Wave AI Docs:** https://docs.waveterm.dev/waveai
- **Wave AI Modes:** https://docs.waveterm.dev/waveai-modes
- **Download:** https://www.waveterm.dev/download
- **Discord:** https://discord.gg/XfvZ334gwU
- **GitHub Issues:** https://github.com/wavetermdev/waveterm/issues
- **GitHub:** https://github.com/wavetermdev/waveterm

## License

Apache-2.0 License (see LICENSE file)

## Recent Changes

- **Theme Config Color Picker (2026-03-15):** Fixed bug where clicking a color in the theme visualizer didn't update the model — the `ThemeVisualContent` component was creating a new derived Jotai atom on every render, so changes only updated local state instead of persisting to the config file. Fixed by using `useMemo` for the atom and implementing proper write-back to `model.fileContentAtom` with `model.markAsEdited()`.

## Getting Help

1. Check the official documentation at https://docs.waveterm.dev
2. Join the Discord community: https://discord.gg/XfvZ334gwU
3. Open a GitHub Issue: https://github.com/wavetermdev/waveterm/issues
4. Review CONTRIBUTING.md for contribution guidelines

## Development Workflow

1. Clone repo
2. Run `task init`
3. Run `task dev`
4. Make changes - HMR updates frontend automatically
5. Run `npm test` for automated tests
6. Build production version: `task package`
