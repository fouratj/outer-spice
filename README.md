"# Solar System Explorer

A modern 3D interactive solar system explorer built with Three.js, featuring 6DoF navigation, realistic physics, and stunning visuals.

## ✨ Features

- **🌌 3D Solar System**: Accurate representation of our solar system with the Sun, 8 planets, and major moons
- **🎮 6DoF Navigation**: Full freedom of movement using keyboard, mouse, and touch controls
- **🚀 Planet Travel**: Quick navigation to any celestial body with adjustable travel speeds
- **🎨 Dual Modes**: Switch between realistic (scientifically accurate) and artistic (enhanced visuals) modes
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ High Performance**: 60FPS target with Level of Detail (LOD) optimization
- **🔄 Offline Support**: Progressive Web App (PWA) with offline capability

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd solar-system-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Controls

### Keyboard
- **W A S D** - Move forward, left, back, right
- **Q E** - Move up, down
- **ESC** - Release mouse cursor lock

### Mouse
- **Click** - Lock cursor for look-around
- **Move** - Look around (when cursor is locked)

### Touch (Mobile)
- **Single finger drag** - Look around
- **Two finger pinch** - Zoom (planned)
- **Two finger drag** - Move (planned)

### UI Controls
- **Mode Toggle** - Switch between realistic and artistic modes
- **Speed Slider** - Adjust movement and travel speed
- **Planet Buttons** - Quick travel to celestial bodies
- **Help Button** - Show/hide control instructions

## 🏗️ Project Structure

```
src/
├── css/
│   └── main.css              # Main stylesheet with CSS variables
├── js/
│   ├── controls/
│   │   └── NavigationControls.js  # 6DoF navigation system
│   ├── models/
│   │   └── CelestialBody.js       # Planet/moon models (planned)
│   ├── systems/
│   │   ├── SceneManager.js        # Three.js scene management
│   │   ├── LoadingManager.js      # Loading screen and progress
│   │   └── ErrorHandler.js        # Error handling and display
│   └── ui/
│       └── UIManager.js           # User interface management
├── main.js                   # Application entry point
public/
├── favicon.svg              # App icon
assets/
├── textures/               # Planet textures (planned)
└── models/                 # 3D models (planned)
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint code analysis
- `npm run format` - Format code with Prettier

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js (latest)
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier
- **Performance**: Stats.js for monitoring

## 🎯 Roadmap

### Current Status: ✅ Project Setup Complete
- [x] Modern development environment with Vite
- [x] Responsive HTML5 template with loading screen
- [x] CSS architecture with design system
- [x] Modular JavaScript architecture
- [x] Basic Three.js scene with starfield
- [x] 6DoF navigation controls
- [x] User interface framework

### Next Steps:
- [ ] Celestial body models with NASA textures
- [ ] Orbital mechanics and animation system
- [ ] Planet selection and travel system
- [ ] Enhanced realistic/artistic mode toggle
- [ ] Performance optimization and mobile compatibility
- [ ] Offline capability and PWA features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NASA for public domain planetary textures and data
- Three.js community for the amazing 3D library
- Solar System Scope for texture references"
