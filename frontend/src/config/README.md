# Tank Configuration Guide

Este arquivo explica como personalizar as propriedades de exibição dos tanques em `tankConfig.ts` e configurações de display em `displayConfig.ts`.

## Tank Configuration (`tankConfig.ts`)

Cada tanque tem as seguintes propriedades configuráveis:

### Position Properties
- `xPercent`: Posição horizontal como porcentagem da largura do container (0-100)
- `yPercent`: Posição vertical como porcentagem da altura do container (0-100)

### Size Properties  
- `widthPercent`: Largura do tanque como porcentagem da largura do container
- `heightPercent`: Altura do tanque como porcentagem da altura do container

### Text Properties
- `textXOffset`: Offset horizontal em pixels do centro do tanque para o texto de porcentagem
- `textYOffset`: Offset vertical em pixels da parte inferior do tanque para o texto
- `fontSize`: Tamanho do texto em pixels
- `fontWeight`: Peso do texto ('normal', 'bold', 'semibold')

## Display Configuration (`displayConfig.ts`)

### Background Settings
- `backgroundSize`: CSS background-size ('cover', 'contain', '100% 100%', etc.)
- `backgroundPosition`: CSS background-position ('center center', 'top left', etc.)

### Tank Settings
- `tankScale`: Fator de escala adicional para os tanques (1.0 = normal, 0.9 = 90%, 1.1 = 110%)

### Visual Effects
- `overlayOpacity`: Opacidade do overlay escuro (0 = transparente, 1 = opaco)
- `liquidTransitionDuration`: Duração da animação do líquido em milissegundos
- `bubbleIntensity`: Multiplicador de intensidade da animação de bolhas

## Como Ajustar as Configurações

### Ajustando Escala dos Tanques
```typescript
// Fazer tanques 10% menores
tankScale: 0.9,

// Fazer tanques 5% maiores
tankScale: 1.05,
```

### Ajuste Fino do Display
```typescript
// Para fullscreen perfeito
backgroundSize: 'cover',
overlayOpacity: 0.02,
tankScale: 1.0,
```

## Sistema de Escala Responsiva

O novo sistema funciona da seguinte forma:

1. **Referência Fixa**: Os tanques são posicionados com base em uma tela de referência de 1920x1080
2. **Escala Automática**: O sistema calcula automaticamente o fator de escala baseado no tamanho real da tela
3. **Proporção Mantida**: A proporção é sempre mantida, evitando distorções
4. **Centralização**: Os tanques são sempre centralizados na tela

### Comportamento Responsivo

O sistema mantém o posicionamento relativo independentemente de:
- Redimensionamento da janela
- Zoom in/out
- Diferentes tamanhos de tela
- Mudanças de orientação no mobile
- Modo fullscreen

### Resolução de Problemas

Se os tanques ainda estiverem desalinhados:

1. **Ajuste tankScale**: Reduza para 0.95 ou 0.9
2. **Verifique backgroundSize**: Use 'cover' para fullscreen
3. **Teste diferentes resoluções**: O sistema se adapta automaticamente

### Exemplo de Configuração Otimizada

```typescript
export const DISPLAY_CONFIG = {
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  tankScale: 0.98, // Ligeiramente menor para margem de segurança
  overlayOpacity: 0.02,
  liquidTransitionDuration: 2500,
  bubbleIntensity: 1.0,
};
```