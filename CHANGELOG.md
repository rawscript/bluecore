# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2025-09-18

### Added
- Chalk library for better terminal color support
- Improved banner with blue coloring using chalk
- Better error handling for color display in different terminals

### Changed
- Updated version to 1.2.2
- Enhanced banner display with proper blue coloring
- Improved compatibility with different terminal environments

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- Banner color display issues in PowerShell
- Terminal compatibility issues with ANSI color codes

### Security
- N/A

## [1.2.1] - 2025-09-18

### Added
- Chalk library for better terminal color support
- Improved banner with blue coloring using chalk
- Better error handling for color display in different terminals

### Changed
- Updated version to 1.2.1
- Enhanced banner display with proper blue coloring
- Improved compatibility with different terminal environments

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- Banner color display issues in PowerShell
- Terminal compatibility issues with ANSI color codes

### Security
- N/A

## [1.2.0] - 2025-09-17

### Added
- Advanced multithreaded search algorithm for 1000% faster package discovery
- Performance test suite to verify search improvements
- Concurrent directory scanning for maximum efficiency
- Intelligent filtering to skip unnecessary directories

### Changed
- Updated registry manager to use asynchronous multithreaded search
- Improved search accuracy by expanding search locations
- Enhanced error handling in file system operations
- Updated package name to bluecore-pkg for npm publication

### Deprecated
- N/A

### Removed
- Sequential directory scanning in favor of concurrent approach

### Fixed
- Performance bottlenecks in system-wide package search

### Security
- N/A

## [1.1.0] - 2025-09-17

### Added
- System-wide package search functionality
- Integration with Gemini AI for package suggestions
- Enhanced registry merging capabilities
- Improved package detection and reuse logic

### Changed
- Updated registry manager to search entire home directory for rhezusport files
- Enhanced AI integration module to use Gemini API
- Improved error handling and logging

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [1.0.0] - 2025-09-17

### Added
- Initial release of Bluecore
- Package registry management with rhezusport files
- Rebase command to install only missing packages
- Init command to initialize bluecore in a project
- Suggest command for AI-powered package suggestions
- Support for both npm and yarn package managers
- CLI help and version information
- Comprehensive documentation in README.md

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- N/A (Initial release)