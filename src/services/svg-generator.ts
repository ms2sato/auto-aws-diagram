import { writeFileSync } from 'fs';
import { newInstance } from 'svg-builder';
import { Resource, Connection } from './resource-collector';

export interface SvgOptions {
  width?: number;
  height?: number;
  resourceSpacing?: number;
  resourceWidth?: number;
  resourceHeight?: number;
  fontSize?: number;
  padding?: number;
}

export class SvgGenerator {
  private options: Required<SvgOptions>;
  private resourceCoordinates: Map<string, { x: number; y: number }> = new Map();
  private resourceTypeGroups: Map<string, Resource[]> = new Map();
  private iconPaths: { [key: string]: string } = {
    ec2: 'M32.14 14.953v10.094l8.746 5.046v-10.093zm-16.275 0L7.12 20v10.093l8.745-5.047zm8.137 0L15.257 20v10.093l8.745 5.047m0-20.187L15.257 20l8.745 5.047',
    vpc: 'M41 5h-6c-1.105 0-2 0.895-2 2v6c0 1.105 0.895 2 2 2h6c1.105 0 2-0.895 2-2v-6c0-1.105-0.895-2-2-2zM13 5h-6c-1.105 0-2 0.895-2 2v6c0 1.105 0.895 2 2 2h6c1.105 0 2-0.895 2-2v-6c0-1.105-0.895-2-2-2zM41 33h-6c-1.105 0-2 0.895-2 2v6c0 1.105 0.895 2 2 2h6c1.105 0 2-0.895 2-2v-6c0-1.105-0.895-2-2-2zM13 33h-6c-1.105 0-2 0.895-2 2v6c0 1.105 0.895 2 2 2h6c1.105 0 2-0.895 2-2v-6c0-1.105-0.895-2-2-2zM9 15v18M41 15v18M15 9h18M15 41h18',
    subnet: 'M10 10h28v28h-28z',
    securityGroup: 'M24 4l-16 16 16 16 16-16-16-16zM24 12.9l11.1 11.1-11.1 11.1-11.1-11.1 11.1-11.1z',
    internetGateway: 'M40 18h-32v12h32v-12zM24 10v-6M24 44v-6M8 24h-4M44 24h-4',
    natGateway: 'M36 18h-24v12h24v-12zM32 24l-12 0M36 30v-12M12 30v-12',
    s3: 'M24 4l-20 11.5v17l20 11.5 20-11.5v-17l-20-11.5zM5.9 15.7l18.1-10.4 18.1 10.4-18.1 10.4-18.1-10.4zM26.5 34.7l16.5-9.5v13.1l-16.5 9.5v-13.1zM5 38.3v-13.1l16.5 9.5v13.1l-16.5-9.5z',
    rds: 'M24 4c-8.837 0-16 2.239-16 5v8.5c0 2.761 7.163 5 16 5s16-2.239 16-5v-8.5c0-2.761-7.163-5-16-5zM24 14c-8.837 0-16-2.239-16-5s7.163-5 16-5 16 2.239 16 5-7.163 5-16 5zM8 19.7v8.5c0 2.761 7.163 5 16 5s16-2.239 16-5v-8.5',
    lambda: 'M15 14l-10 20h38l-10-20M24 4v10M21 34l3 10 3-10',
    dynamodb: 'M8 24c0-9.941 7.059-18 16-18s16 8.059 16 18-7.059 18-16 18-16-8.059-16-18zM24 10v28M10 24h28',
    loadBalancer: 'M8 18h32v12h-32v-12zM18 18v12M30 18v12'
  };
  private colors: { [key: string]: string } = {
    ec2: '#FF9900',
    vpc: '#232F3E',
    subnet: '#147EBA',
    securityGroup: '#1A694D',
    internetGateway: '#6B6B6B',
    natGateway: '#8C4FFF',
    s3: '#E05243',
    rds: '#3B48CC',
    lambda: '#FF9900',
    dynamodb: '#3B48CC',
    loadBalancer: '#FF4F8B'
  };

  constructor(options: SvgOptions = {}) {
    this.options = {
      width: options.width || 1200,
      height: options.height || 800,
      resourceSpacing: options.resourceSpacing || 150,
      resourceWidth: options.resourceWidth || 100,
      resourceHeight: options.resourceHeight || 100,
      fontSize: options.fontSize || 12,
      padding: options.padding || 50
    };
  }

  generateSvg(resources: Resource[], connections: Connection[], outputPath: string): void {
    const svg = newInstance()
      .width(this.options.width)
      .height(this.options.height);

    // リソースを種類ごとにグループ化
    this.groupResourcesByType(resources);

    // リソースの座標を計算
    this.calculateResourceCoordinates();

    // 接続線を描画
    this.drawConnections(svg, connections);

    // リソースを描画
    this.drawResources(svg, resources);

    // SVGをファイルに保存
    writeFileSync(outputPath, svg.render());
    console.log(`SVG file generated: ${outputPath}`);
  }

  private groupResourcesByType(resources: Resource[]): void {
    this.resourceTypeGroups.clear();

    for (const resource of resources) {
      if (!this.resourceTypeGroups.has(resource.type)) {
        this.resourceTypeGroups.set(resource.type, []);
      }
      this.resourceTypeGroups.get(resource.type)?.push(resource);
    }
  }

  private calculateResourceCoordinates(): void {
    this.resourceCoordinates.clear();
    
    const typeCount = this.resourceTypeGroups.size;
    let typeIndex = 0;
    
    this.resourceTypeGroups.forEach((resources, type) => {
      const resourceCount = resources.length;
      
      // 各リソースタイプの列の位置を計算
      const columnX = this.options.padding + typeIndex * (this.options.width - 2 * this.options.padding) / Math.max(1, typeCount - 1);
      
      for (let i = 0; i < resourceCount; i++) {
        const resource = resources[i];
        
        // リソースの行の位置を計算
        const rowY = this.options.padding + i * (this.options.height - 2 * this.options.padding) / Math.max(1, resourceCount);
        
        this.resourceCoordinates.set(resource.id, { x: columnX, y: rowY });
      }
      
      typeIndex++;
    });
  }

  private drawResources(svg: any, resources: Resource[]): void {
    for (const resource of resources) {
      const { x, y } = this.resourceCoordinates.get(resource.id) || { x: 0, y: 0 };
      const halfWidth = this.options.resourceWidth / 2;
      const halfHeight = this.options.resourceHeight / 2;
      
      // リソースのアイコンを描画
      if (this.iconPaths[resource.type]) {
        const color = this.colors[resource.type] || '#000000';
        svg.g({
          transform: `translate(${x - halfWidth}, ${y - halfHeight}) scale(${this.options.resourceWidth / 48}, ${this.options.resourceHeight / 48})`
        }).path({
          d: this.iconPaths[resource.type],
          stroke: color,
          'stroke-width': '2',
          fill: 'none'
        });
      } else {
        // リソースのアイコンがない場合は、矩形を描画
        svg.rect({
          x: x - halfWidth,
          y: y - halfHeight,
          width: this.options.resourceWidth,
          height: this.options.resourceHeight,
          rx: 10,
          ry: 10,
          fill: '#EEEEEE',
          stroke: '#666666',
          'stroke-width': '2'
        });
      }
      
      // リソース名を描画
      svg.text({
        x: x,
        y: y + halfHeight + 20,
        'font-family': 'Arial',
        'font-size': this.options.fontSize,
        'text-anchor': 'middle'
      }, resource.name);
    }
  }

  private drawConnections(svg: any, connections: Connection[]): void {
    for (const connection of connections) {
      const sourceCoords = this.resourceCoordinates.get(connection.source);
      const targetCoords = this.resourceCoordinates.get(connection.target);
      
      if (sourceCoords && targetCoords) {
        // 接続線のカラー
        let color = '#666666';
        let strokeDasharray = '';
        
        switch (connection.type) {
          case 'belongs_to':
            color = '#007BFF';
            break;
          case 'uses':
            color = '#28A745';
            break;
          case 'attached_to':
            color = '#DC3545';
            break;
          default:
            color = '#666666';
            strokeDasharray = '5,5';
        }
        
        // 接続線を描画
        svg.path({
          d: `M ${sourceCoords.x} ${sourceCoords.y} L ${targetCoords.x} ${targetCoords.y}`,
          stroke: color,
          'stroke-width': '2',
          'stroke-dasharray': strokeDasharray,
          fill: 'none'
        });
        
        // 接続線の中間に接続タイプを描画
        const midX = (sourceCoords.x + targetCoords.x) / 2;
        const midY = (sourceCoords.y + targetCoords.y) / 2;
        
        svg.text({
          x: midX,
          y: midY,
          'font-family': 'Arial',
          'font-size': this.options.fontSize - 2,
          'text-anchor': 'middle',
          fill: color,
          'background': 'white'
        }, connection.type);
      }
    }
  }
} 