export interface TankData {
  pct: number;
}

export interface TankResponse {
  [key: string]: TankData; // T7, T8, T9, etc.
}

export interface TankBarProps {
  id: number;
  percent: number;
  containerWidth: number;
  containerHeight: number;
}

export interface TankPosition {
  // Position as percentage of container (0-100)
  xPercent: number;
  yPercent: number;
  
  // Size as percentage of container
  widthPercent: number;
  heightPercent: number;
  
  // Text position relative to tank
  textXOffset: number; // pixels offset from tank center
  textYOffset: number; // pixels offset from tank bottom
  
  // Text styling
  fontSize: number; // in pixels
  fontWeight: 'normal' | 'bold' | 'semibold';
}

export interface TankConfig {
  [key: number]: TankPosition;
}