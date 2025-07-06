
# 3D Solar System Simulation

An interactive 3D solar system simulation built with Three.js, featuring realistic planetary orbits, individual speed controls, and immersive space visuals.

## Features

- **3D Solar System**: Complete solar system with the Sun and all 8 planets
- **Realistic Orbits**: Planets orbit at different speeds based on real astronomical data
- **Interactive Controls**: Individual speed sliders for each planet
- **Real-time Animation**: Smooth animations with play/pause functionality
- **Camera Controls**: Drag to rotate view, scroll to zoom
- **Starfield Background**: Beautiful space environment with thousands of stars
- **Responsive Design**: Works on all modern browsers and devices

## Technologies Used

- **Three.js**: 3D graphics rendering
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Vite**: Build tool

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd solar-system-simulation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the simulation

## How to Use

1. **View the Solar System**: The simulation starts automatically with all planets orbiting the Sun
2. **Control Animation**: Use the Play/Pause button to control the animation
3. **Adjust Planet Speeds**: Use the individual sliders to change each planet's orbital speed in real-time
4. **Navigate the View**: 
   - Drag with mouse to rotate the camera around the solar system
   - Scroll to zoom in/out
5. **Reset**: Click the Reset button to return all planets to their starting positions

## Planet Information

The simulation includes all 8 planets with realistic relative sizes and orbital characteristics:

- **Mercury**: Closest to the Sun, fastest orbit
- **Venus**: Hottest planet, reverse rotation
- **Earth**: Our home planet with blue coloring
- **Mars**: The red planet
- **Jupiter**: Largest planet in the solar system
- **Saturn**: Known for its prominent ring system
- **Uranus**: Ice giant with unique tilted rotation
- **Neptune**: Furthest planet, deep blue color

## Code Structure

```
src/
├── components/
│   └── SolarSystem.tsx     # Main solar system component
├── pages/
│   └── Index.tsx          # Main page
├── lib/
│   └── utils.ts           # Utility functions
└── main.tsx               # Application entry point
```

## Key Implementation Details

- **Three.js Scene Setup**: Camera, renderer, and scene configuration
- **Planetary Animation**: Using Three.js animation loop with delta time
- **Interactive Controls**: Real-time speed adjustment using React state
- **Responsive Design**: Automatic canvas resizing and mobile-friendly controls
- **Performance Optimization**: Efficient rendering with proper disposal of resources

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Assignment Requirements Fulfilled

✅ 3D solar system with Sun and 8 planets  
✅ Realistic lighting and camera setup  
✅ Smooth orbital animations using Three.js  
✅ Individual speed controls for each planet  
✅ Real-time speed adjustment  
✅ Play/Pause functionality  
✅ Background starfield  
✅ Interactive camera controls  
✅ Mobile-responsive design  
✅ Clean code structure with comments  

## Demo

The application demonstrates:
1. Complete 3D solar system in motion
2. Individual planet speed controls working in real-time
3. Smooth animations and user interactions
4. Professional UI with space theme
5. Responsive design across devices

## Development Notes

- Used Three.js for all 3D rendering and animations
- No CSS animations used - all motion handled by Three.js
- Implemented proper cleanup to prevent memory leaks
- Added comprehensive error handling and edge cases
- Optimized for performance with efficient rendering loop

---

**Developer**: Frontend Assignment Submission  
**Technology Stack**: React + TypeScript + Three.js + Tailwind CSS  
**Build Time**: ~2-3 hours for full implementation
