export interface DisplayConfig {
    // Background settings
    backgroundSize: string;
    backgroundPosition: string;
    
    // Tank scaling
    tankScale: number;
    
    // Visual effects
    overlayOpacity: number;
    liquidTransitionDuration: number;
    bubbleIntensity: number;
  }
  
  // Configuração principal do display
  export const DISPLAY_CONFIG: DisplayConfig = {
    // Background - ajuste estas propriedades para corrigir o fullscreen
    backgroundSize: '100% 100%', // Força a imagem a preencher exatamente a tela
    backgroundPosition: 'center center',
    
    // Escala dos tanques - ajuste se necessário
    tankScale: 1.0,
    
    // Efeitos visuais
    overlayOpacity: 0.02,
    liquidTransitionDuration: 2500,
    bubbleIntensity: 1.0,
  };
  
  // Configurações alternativas para diferentes cenários
  export const BACKGROUND_PRESETS = {
    // Para telas widescreen (16:9)
    widescreen: {
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      tankScale: 0.95,
    },
    
    // Para fullscreen sem distorção
    fullscreenFit: {
      backgroundSize: 'contain',
      backgroundPosition: 'center center',
      tankScale: 1.0,
    },
    
    // Para fullscreen com preenchimento total
    fullscreenStretch: {
      backgroundSize: '100% 100%',
      backgroundPosition: 'center center',
      tankScale: 1.0,
    },
    
    // Para telas 4:3
    standard: {
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      tankScale: 0.9,
    },
  };