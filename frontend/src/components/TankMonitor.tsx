import React, { useState, useEffect } from 'react';
import TankBar from './TankBar';
import { useTankData } from '../hooks/useTankData';
import { DISPLAY_CONFIG } from '../config/displayConfig';

const TankMonitor: React.FC = () => {
  const { data } = useTankData();
  const [containerSize, setContainerSize] = useState({ width: 1920, height: 1080 });

  // Update container size on window resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('tank-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    // Initial size
    updateSize();

    // Listen for resize events
    window.addEventListener('resize', updateSize);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSize, 100); // Small delay to ensure layout is updated
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* Background Image Container - Configurável */}
      <div 
        id="tank-container"
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/start_tankwatch.png)',
          backgroundSize: DISPLAY_CONFIG.backgroundSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: DISPLAY_CONFIG.backgroundPosition,
        }}
      >
        {/* Tank Bars Overlay com escala configurável */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `scale(${DISPLAY_CONFIG.tankScale})`,
            transformOrigin: 'center center'
          }}
        >
          {[7, 8, 9, 10, 11, 12, 13, 14].map(tankId => (
            <TankBar
              key={tankId}
              id={tankId}
              percent={data[tankId] || 0}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
            />
          ))}
        </div>
      </div>

      {/* Overlay configurável */}
      <div 
        className="absolute inset-0 bg-black pointer-events-none" 
        style={{ opacity: DISPLAY_CONFIG.overlayOpacity }}
      />
    </div>
  );
};

export default TankMonitor;