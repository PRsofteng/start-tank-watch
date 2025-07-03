import { TankConfig } from '../types/tank';

// Tank configuration - all values as percentages or relative units
// This makes the display fully responsive and scalable
export const TANK_CONFIG: TankConfig = {
  7: {
    xPercent: 4.6,    // 10.2% from left edge
    yPercent: 16.7,    // 16.7% from top edge
    widthPercent: 5, // 2.6% of container width
    heightPercent: 46, // 39.6% of container height
    textXOffset: 10,    // centered horizontally
    textYOffset: 210,   // 50px below tank
    fontSize: 60,
    fontWeight: 'bold'
  },
  8: {
    xPercent: 16.2,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent: 46,
    textXOffset: 40,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  },
  9: {
    xPercent: 28.2,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent: 46,
    textXOffset: 20,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  },
  10: {
    xPercent: 40.2,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent: 46,
    textXOffset: 40,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  },
  11: {
    xPercent: 54.8,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent: 46,
    textXOffset: 20,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  },
  12: {
    xPercent: 67.0,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent: 46,
    textXOffset: 20,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  },
  13: {
    xPercent: 78.9,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent: 46,
    textXOffset: 40,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  },
  14: {
    xPercent: 91,
    yPercent: 16.7,
    widthPercent: 5,
    heightPercent:46,
    textXOffset: 20,
    textYOffset: 210,
    fontSize:  60,
    fontWeight: 'bold'
  }
};