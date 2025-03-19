declare module 'svg-builder' {
  interface SvgBuilder {
    width(width: number | string): SvgBuilder;
    height(height: number | string): SvgBuilder;
    rect(attrs: Record<string, any>): SvgBuilder;
    text(attrs: Record<string, any>, content: string): SvgBuilder;
    path(attrs: Record<string, any>): SvgBuilder;
    g(attrs: Record<string, any>): SvgBuilder;
    render(): string;
  }

  export function newInstance(): SvgBuilder;
} 