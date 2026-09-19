// src/declarations.d.ts
declare module 'react-canvas-draw' {
  import * as React from 'react';

  export interface CanvasDrawProps {
    onChange?: ((canvas: any) => void) | null;
    loadTimeOffset?: number;
    lazyRadius?: number;
    brushRadius?: number;
    brushColor?: string;
    catenaryColor?: string;
    gridColor?: string;
    hideGrid?: boolean;
    canvasWidth?: number | string;
    canvasHeight?: number | string;
    disabled?: boolean;
    imgSrc?: string;
    saveData?: string;
    immediateLoading?: boolean;
    hideInterface?: boolean;
    className?: string;
    style?: React.CSSProperties;
    backgroundColor?: string;
  }

  export default class CanvasDraw extends React.Component<CanvasDrawProps> {
    undo(): void;
    clear(): void;
    getSaveData(): string;
    loadSaveData(saveData: string, immediate?: boolean): void;
  }
}
