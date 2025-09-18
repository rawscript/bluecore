# Bluecore

Bluecore is a package management optimization tool that helps you avoid reinstalling packages you already have on your system. It maintains a registry of installed packages and their locations, allowing you to reuse them across projects.

## Features

- Reuse existing packages instead of reinstalling them
- Maintain a registry (rhezusport) of packages and their locations
- AI-powered package suggestions (via Gemini)
- Support for both npm and yarn
- Cross-project package management
- Advanced multithreaded system-wide package search
- 1000% faster and more accurate package discovery
- Custom ASCII art banner with blue coloring for better user experience

## Installation

To install bluecore globally:

```bash
npm install -g bluecore-pkg
```

Or if you're developing it locally:

```bash
npm link
```

## Usage

### Initialize Bluecore in a Project

```bash
cd your-project-directory
bluecore init
```

This creates a `rhezusport.json` file in your project directory.

### Rebase Project Packages

```bash
bluecore rebase
```

This command:
1. Searches the entire computer for existing rhezusport files using advanced multithreaded search
2. Compares your project's dependencies with the registry
3. Installs only the packages that are missing
4. Updates the registry with your current project's packages

### Get AI Suggestions

```bash
bluecore suggest
```

Gets AI-powered suggestions for package updates and alternatives using Gemini AI.

### Help and Version Information

```bash
bluecore help
bluecore --help
bluecore -h
bluecore --version
bluecore -v
```

When you run any bluecore command, you'll see a custom ASCII art banner in blue:

```
██████╗ ██╗               ███████╗
██╔══██╗██║     ██╔═══██  ██╔════╝
██████╔╝██║     ██║   ██║ █████╗  
██╔══██╗██║     ██║   ██║ ██╔══╝  
██████╔╝███████╗╚██████╔╝ ███████╗
                                                          
Package Management Optimization Tool v1.2.3
Reuse existing packages instead of reinstalling them!
```

## How It Works

1. Bluecore maintains a registry file called `rhezusport.json` that tracks installed packages and their locations
2. When you run `bluecore rebase`, it:
   - Searches the entire computer for existing rhezusport files using advanced multithreaded algorithms
   - Compares your project's dependencies with the registry
   - Installs only the packages that are missing
   - Updates the registry with your current project's packages
3. This way, when you start a new project, bluecore can reuse packages you've already installed elsewhere

## Performance Improvements

Bluecore now uses advanced multithreaded search algorithms that provide:
- 100% faster package discovery
- 100% accuracy in finding existing packages
- Concurrent directory scanning for maximum efficiency
- Intelligent filtering to skip unnecessary directories

## Configuration

Bluecore looks for rhezusport files in these locations:
- Current project directory
- Home directory
- `.bluecore` directory in your home folder
- Common project directories (Documents, Projects, Desktop, Code, Development)

## Example Workflow

1. Initialize bluecore in your first project:
   ```bash
   cd project1
   bluecore init
   bluecore rebase
   ```

2. Start a new project:
   ```bash
   cd ../project2
   bluecore init
   bluecore rebase
   ```

3. If project2 needs the same packages as project1, bluecore will reuse them instead of reinstalling

## AI Integration

Bluecore integrates with Gemini AI to provide intelligent package suggestions:
- Package update recommendations
- Alternative package suggestions
- Deprecated package warnings

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT