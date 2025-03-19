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

// リソース階層関係の定義
interface HierarchyNode {
  resource: Resource;
  children: HierarchyNode[];
  level: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class SvgGenerator {
  private options: Required<SvgOptions>;
  private resourceCoordinates: Map<string, { x: number; y: number }> = new Map();
  private resourceTypeGroups: Map<string, Resource[]> = new Map();
  private hierarchy: HierarchyNode[] = [];
  private resourceNodeMap: Map<string, HierarchyNode> = new Map();
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
  
  // コンテナリソース（他のリソースを含むことができるリソース）
  private containerTypes = ['vpc', 'subnet', 'securityGroup'];
  
  // 親子関係のマッピング
  private parentChildRelations = {
    'vpc': ['subnet', 'internetGateway', 'natGateway'],
    'subnet': ['ec2', 'rds', 'lambda'],
    'securityGroup': []
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
    
    // 階層構造の構築
    this.buildHierarchy(resources, connections);
    
    // 階層的なレイアウトを計算
    this.calculateHierarchicalLayout();

    // コンテナリソースと背景を描画
    this.drawContainers(svg);
    
    // リソースを描画
    this.drawResources(svg, resources);

    // 接続線を描画
    this.drawConnections(svg, connections);

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
  
  // 階層構造を構築する
  private buildHierarchy(resources: Resource[], connections: Connection[]): void {
    this.hierarchy = [];
    this.resourceNodeMap = new Map();
    
    // 初期化：すべてのリソースをノードとして作成
    resources.forEach(resource => {
      const node: HierarchyNode = {
        resource,
        children: [],
        level: 0
      };
      this.resourceNodeMap.set(resource.id, node);
      
      // トップレベルのコンテナ（VPC）を階層の先頭に追加
      if (resource.type === 'vpc') {
        this.hierarchy.push(node);
      }
    });
    
    // 接続情報から親子関係を構築
    connections.forEach(conn => {
      if (conn.type === 'belongs_to') {
        const childNode = this.resourceNodeMap.get(conn.source);
        const parentNode = this.resourceNodeMap.get(conn.target);
        
        if (childNode && parentNode && this.containerTypes.includes(parentNode.resource.type)) {
          // 親ノードの子に追加
          parentNode.children.push(childNode);
          
          // レベルを親のレベル+1に設定
          childNode.level = parentNode.level + 1;
          
          // 階層のルートにまだ追加されていない非コンテナリソースを管理
          if (!this.containerTypes.includes(childNode.resource.type) && 
              !this.hierarchy.includes(childNode)) {
            // 親がすでに階層に含まれている場合は追加しない
            const hasParentInHierarchy = this.hierarchy.some(node => 
              node.children.includes(childNode));
            
            if (!hasParentInHierarchy) {
              this.hierarchy.push(childNode);
            }
          }
        }
      }
    });
    
    // 孤立したリソース（親を持たないリソース）を階層に追加
    resources.forEach(resource => {
      const node = this.resourceNodeMap.get(resource.id);
      
      if (node && !this.hierarchy.includes(node) && 
          !this.hierarchy.some(parent => this.isChildOf(node, parent))) {
        this.hierarchy.push(node);
      }
    });
  }
  
  // あるノードが別のノードの子孫かどうかを再帰的にチェック
  private isChildOf(node: HierarchyNode, potentialParent: HierarchyNode): boolean {
    if (potentialParent.children.includes(node)) {
      return true;
    }
    
    for (const child of potentialParent.children) {
      if (this.isChildOf(node, child)) {
        return true;
      }
    }
    
    return false;
  }
  
  // 階層的なレイアウトを計算
  private calculateHierarchicalLayout(): void {
    const topLevelCount = this.hierarchy.length;
    const horizontalSpacing = this.options.width / (topLevelCount + 1);
    
    // 最初にトップレベルのリソースの位置を決定
    for (let i = 0; i < topLevelCount; i++) {
      const node = this.hierarchy[i];
      const x = horizontalSpacing * (i + 1);
      const y = this.options.padding * 2;
      
      this.positionNode(node, x, y);
    }
    
    // 座標情報をリソースマップに保存
    this.saveCoordinates();
  }
  
  // ノードとその子孫を再帰的に配置
  private positionNode(node: HierarchyNode, x: number, y: number): { width: number, height: number } {
    const resourceType = node.resource.type;
    const isContainer = this.containerTypes.includes(resourceType);
    let nodeWidth = this.options.resourceWidth;
    let nodeHeight = this.options.resourceHeight;
    
    node.x = x;
    node.y = y;
    
    // コンテナではない場合は単純に現在のサイズを返す
    if (!isContainer || node.children.length === 0) {
      node.width = nodeWidth;
      node.height = nodeHeight;
      return { width: nodeWidth, height: nodeHeight };
    }
    
    // 子要素を配置し、必要なサイズを計算
    const childCount = node.children.length;
    const childSpacingHorizontal = this.options.resourceSpacing;
    const childSpacingVertical = this.options.resourceSpacing / 2;
    let childrenWidth = 0;
    let childrenHeight = 0;
    
    // 子要素のレイアウト
    let currentX = x - (childCount * childSpacingHorizontal) / 2 + childSpacingHorizontal / 2;
    let currentY = y + this.options.resourceHeight + childSpacingVertical;
    let maxChildHeight = 0;
    
    // まず子要素のサイズと位置を計算
    for (let i = 0; i < childCount; i++) {
      const childNode = node.children[i];
      const childSize = this.positionNode(childNode, currentX, currentY);
      
      currentX += childSize.width + childSpacingHorizontal;
      maxChildHeight = Math.max(maxChildHeight, childSize.height);
      childrenWidth = currentX - x - childSpacingHorizontal;
    }
    
    childrenHeight = maxChildHeight;
    
    // コンテナのサイズを子要素に基づいて調整
    nodeWidth = Math.max(this.options.resourceWidth * 2, childrenWidth + this.options.resourceSpacing * 2);
    nodeHeight = this.options.resourceHeight + childrenHeight + this.options.resourceSpacing * 2;
    
    // 子要素を水平方向に中央揃え
    const leftMargin = (nodeWidth - childrenWidth) / 2;
    for (const child of node.children) {
      if (child.x && child.y) {
        child.x = x - nodeWidth / 2 + leftMargin + (child.x - (x - (childCount * childSpacingHorizontal) / 2 + childSpacingHorizontal / 2));
      }
    }
    
    node.width = nodeWidth;
    node.height = nodeHeight;
    return { width: nodeWidth, height: nodeHeight };
  }
  
  // 計算した座標を座標マップに保存
  private saveCoordinates(): void {
    this.resourceCoordinates.clear();
    
    const processNode = (node: HierarchyNode) => {
      if (node.x !== undefined && node.y !== undefined) {
        this.resourceCoordinates.set(node.resource.id, { 
          x: node.x, 
          y: node.y 
        });
      }
      
      for (const child of node.children) {
        processNode(child);
      }
    };
    
    for (const node of this.hierarchy) {
      processNode(node);
    }
  }
  
  // コンテナリソース（VPC、サブネットなど）を描画
  private drawContainers(svg: any): void {
    // 階層の深いものから順に描画（子から親へ）
    const containerNodes: HierarchyNode[] = [];
    
    const collectContainers = (node: HierarchyNode) => {
      if (this.containerTypes.includes(node.resource.type) && node.children.length > 0) {
        containerNodes.push(node);
      }
      
      for (const child of node.children) {
        collectContainers(child);
      }
    };
    
    for (const node of this.hierarchy) {
      collectContainers(node);
    }
    
    // レベルの深いものから描画（背景が重ならないように）
    containerNodes.sort((a, b) => b.level - a.level);
    
    for (const node of containerNodes) {
      if (node.x === undefined || node.y === undefined || 
          node.width === undefined || node.height === undefined) {
        continue;
      }
      
      const resourceType = node.resource.type;
      const color = this.colors[resourceType] || '#EEEEEE';
      const x = node.x - node.width / 2;
      const y = node.y - this.options.resourceHeight / 2;
      
      // コンテナの背景を描画
      svg.rect({
        x: x,
        y: y,
        width: node.width,
        height: node.height,
        rx: 10,
        ry: 10,
        fill: this.hexToRgba(color, 0.1),
        stroke: color,
        'stroke-width': '2',
        'stroke-dasharray': '5,5'
      });
      
      // コンテナの名前を表示（左上）
      svg.text({
        x: x + 10,
        y: y + 20,
        'font-family': 'Arial',
        'font-weight': 'bold',
        'font-size': this.options.fontSize,
        fill: color
      }, `${node.resource.name} (${resourceType})`);
    }
  }
  
  // HEX色コードをRGBA形式に変換（透明度指定用）
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private drawResources(svg: any, resources: Resource[]): void {
    for (const resource of resources) {
      const coords = this.resourceCoordinates.get(resource.id);
      if (!coords) continue;
      
      const { x, y } = coords;
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
          fill: '#FFFFFF',
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
    // 親子関係（belongs_to）以外の接続だけを描画
    const nonHierarchyConnections = connections.filter(conn => 
      conn.type !== 'belongs_to' || 
      !this.isResourceChild(conn.source, conn.target));
    
    for (const connection of nonHierarchyConnections) {
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
          'background': 'white',
          fill: color
        }, connection.type);
      }
    }
  }
  
  // あるリソースが別のリソースの子かどうかを階層構造から判断
  private isResourceChild(childId: string, parentId: string): boolean {
    const childNode = this.resourceNodeMap.get(childId);
    const parentNode = this.resourceNodeMap.get(parentId);
    
    if (!childNode || !parentNode) {
      return false;
    }
    
    return this.isChildOf(childNode, parentNode);
  }
} 