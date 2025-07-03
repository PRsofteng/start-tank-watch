import React from 'react';
import { TankBarProps } from '../types/tank';
import { TANK_CONFIG } from '../config/tankConfig';

const TankBar: React.FC<TankBarProps> = ({ id, percent, containerWidth, containerHeight }) => {
  const config = TANK_CONFIG[id];
  
  if (!config) return null;

  // Calculate actual pixel values from percentages
  const tankX = (config.xPercent / 100) * containerWidth;
  const tankY = (config.yPercent / 100) * containerHeight;
  const tankWidth = (config.widthPercent / 100) * containerWidth;
  const tankHeight = (config.heightPercent / 100) * containerHeight;
  
  // Text position
  const textX = tankX + config.textXOffset;
  const textY = tankY + tankHeight + config.textYOffset;

  const getColor = (pct: number): string => {
    if (pct < 20) return '#dc2626'; // red
    if (pct < 50) return '#f59e0b'; // orange
    return '#00d000'; // green
  };

  const getTextColor = (pct: number): string => {
    if (pct < 20) return 'text-red-600';
    if (pct < 50) return 'text-orange-600';
    return 'text-green-600';
  };

  const clampedPercent = Math.max(0, Math.min(100, percent));

  // Sistema de bolhas melhorado - estilo efervescente
  const generateBubbles = () => {
    const bubbles = [];
    if (clampedPercent < 15) return bubbles; // Sem bolhas em níveis muito baixos
    
    const bubbleCount = Math.floor(clampedPercent / 15) + 3; // 3-9 bolhas baseado no nível
    
    for (let i = 0; i < bubbleCount; i++) {
      const size = Math.random() * 4 + 2; // 2-6px bolhas menores
      const left = Math.random() * 70 + 15; // 15-85% from left
      const bottom = Math.random() * 60 + 10; // 10-70% from bottom
      const animationDelay = Math.random() * 4; // 0-4s delay
      const animationDuration = Math.random() * 3 + 2; // 2-5s duration
      
      bubbles.push(
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            bottom: `${bottom}%`,
            opacity: 0.4,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`,
            animationIterationCount: 'infinite',
            animationName: 'bubble-rise',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      );
    }
    
    // Adicionar algumas micro-bolhas
    for (let i = 0; i < 8; i++) {
      const size = Math.random() * 2 + 1; // 1-3px micro bolhas
      const left = Math.random() * 80 + 10;
      const bottom = Math.random() * 40 + 5;
      const delay = Math.random() * 6;
      const duration = Math.random() * 4 + 3;
      
      bubbles.push(
        <div
          key={`micro-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            bottom: `${bottom}%`,
            opacity: 0.2,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            animationIterationCount: 'infinite',
            animationName: 'bubble-float',
            animationTimingFunction: 'linear',
          }}
        />
      );
    }
    
    return bubbles;
  };

  return (
    <>
      {/* Tank level bar */}
      <div
        className="absolute bg-white border-2 border-gray-300 overflow-hidden rounded-sm"
        style={{
          left: tankX - tankWidth / 2,
          top: tankY,
          width: tankWidth,
          height: tankHeight,
        }}
      >
        {/* Animated fill with smoother transition */}
        <div
          className="absolute bottom-0 w-full transition-all duration-[2500ms] ease-out"
          style={{
            height: `${clampedPercent}%`,
            backgroundColor: getColor(clampedPercent),
            boxShadow: `0 0 20px ${getColor(clampedPercent)}40`
          }}
        >
          {/* Sistema de bolhas efervescente */}
          {generateBubbles()}
          
          {/* Efeito de espuma na superfície */}
          {clampedPercent > 20 && (
            <div
              className="absolute top-0 w-full h-1 opacity-30"
              style={{
                background: `radial-gradient(ellipse at center, 
                  rgba(255,255,255,0.8) 0%, 
                  rgba(255,255,255,0.4) 40%, 
                  transparent 70%
                )`,
                animation: 'foam-bubble 4s ease-in-out infinite'
              }}
            />
          )}
          
          {/* Ondulação sutil na superfície */}
          <div
            className="absolute top-0 w-full h-1 opacity-25"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255,255,255,0.7) 25%, 
                transparent 50%, 
                rgba(255,255,255,0.7) 75%, 
                transparent 100%
              )`,
              animation: 'surface-ripple 5s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Enhanced gradient overlay for depth */}
        <div
          className="absolute bottom-0 w-full pointer-events-none"
          style={{
            height: `${clampedPercent}%`,
            background: `linear-gradient(to right, 
              rgba(255,255,255,0.15) 0%, 
              rgba(255,255,255,0.35) 25%, 
              rgba(255,255,255,0.15) 75%, 
              rgba(0,0,0,0.1) 100%
            )`
          }}
        />
      </div>

      {/* Percentage text with enhanced styling */}
      <div
        className={`absolute text-center font-${config.fontWeight} ${getTextColor(clampedPercent)} select-none transition-colors duration-1000`}
        style={{
          left: textX - tankWidth / 2,
          top: textY,
          width: tankWidth,
          fontSize: `${config.fontSize}px`,
          textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
          filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))'
        }}
      >
        {clampedPercent.toFixed(1)}%
      </div>
    </>
  );
};

export default TankBar;