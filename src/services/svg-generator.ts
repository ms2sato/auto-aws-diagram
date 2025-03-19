import { writeFileSync } from 'fs';
import { newInstance } from 'svg-builder';
import { Resource, Connection } from './resource-collector';

export interface SvgOptions {
  width?: number;
  height?: number;
  resourceSpacing?: number;
  levelSpacing?: number;
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
  index?: number; // 同じレベル内でのインデックス
}

export class SvgGenerator {
  private options: Required<SvgOptions>;
  private resourceCoordinates: Map<string, { x: number; y: number }> = new Map();
  private resourceTypeGroups: Map<string, Resource[]> = new Map();
  private hierarchy: HierarchyNode[] = [];
  private resourceNodeMap: Map<string, HierarchyNode> = new Map();
  private levelNodes: Map<number, HierarchyNode[]> = new Map(); // レベルごとのノード
  private maxLevel: number = 0;
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
      width: options.width || 2400,
      height: options.height || 1200,
      resourceSpacing: options.resourceSpacing || 300,
      levelSpacing: options.levelSpacing || 200,
      resourceWidth: options.resourceWidth || 120,
      resourceHeight: options.resourceHeight || 100,
      fontSize: options.fontSize || 14,
      padding: options.padding || 150
    };
  }

  generateSvg(resources: Resource[], connections: Connection[], outputPath: string): void {
    // リソースを種類ごとにグループ化
    this.groupResourcesByType(resources);
    
    // 階層構造の構築
    this.buildHierarchy(resources, connections);
    
    // ツリーレイアウトの計算
    this.calculateTreeLayout();
    
    // すべてのリソースを配置した後で、実際に必要なSVGサイズを計算
    const { width: canvasWidth, height: canvasHeight } = this.calculateRequiredCanvasSize();
    
    // SVGインスタンスの作成
    const svg = newInstance()
      .width(canvasWidth)
      .height(canvasHeight);
    
    // 親子接続線を描画
    this.drawTreeConnections(svg);
    
    // リソースを描画
    this.drawResources(svg, resources);
    
    // 関連接続線を描画（belongs_to以外）
    this.drawRelationConnections(svg, connections);

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
    this.levelNodes = new Map();
    this.maxLevel = 0;
    
    // 初期化：すべてのリソースをノードとして作成
    resources.forEach(resource => {
      const node: HierarchyNode = {
        resource,
        children: [],
        level: 0
      };
      this.resourceNodeMap.set(resource.id, node);
    });
    
    // 親子関係を構築（belongs_to接続に基づく）
    connections.forEach(conn => {
      if (conn.type === 'belongs_to') {
        const childNode = this.resourceNodeMap.get(conn.source);
        const parentNode = this.resourceNodeMap.get(conn.target);
        
        if (childNode && parentNode) {
          // 親ノードの子に追加
          parentNode.children.push(childNode);
        }
      }
    });
    
    // ルートノードの特定（親を持たないノード）
    const rootNodes: HierarchyNode[] = [];
    const childNodes = new Set<HierarchyNode>();
    
    // 子ノードを収集
    this.resourceNodeMap.forEach(node => {
      node.children.forEach(child => {
        childNodes.add(child);
      });
    });
    
    // 親を持たないノードがルート
    this.resourceNodeMap.forEach(node => {
      if (!childNodes.has(node)) {
        rootNodes.push(node);
      }
    });
    
    // ルートから始めて深さ優先でレベルを割り当て
    this.assignLevels(rootNodes, 0);
    
    // ルートノードを階層の先頭に追加
    this.hierarchy = rootNodes;
  }
  
  // ノードとその子孫にレベルを割り当て
  private assignLevels(nodes: HierarchyNode[], level: number): void {
    // 現在のレベルのノードを登録
    if (!this.levelNodes.has(level)) {
      this.levelNodes.set(level, []);
    }
    
    nodes.forEach(node => {
      node.level = level;
      this.levelNodes.get(level)?.push(node);
      this.maxLevel = Math.max(this.maxLevel, level);
      
      // 子ノードのレベルを設定
      if (node.children.length > 0) {
        this.assignLevels(node.children, level + 1);
      }
    });
  }
  
  // ツリーレイアウトを計算
  private calculateTreeLayout(): void {
    // リソースタイプごとのグループ化（同じレベルでのタイプに基づくグループ化）
    const organizeByTypeInLevel = () => {
      // 各レベルでリソースタイプごとにグループ化
      for (let level = 0; level <= this.maxLevel; level++) {
        const nodes = this.levelNodes.get(level) || [];
        
        // リソースタイプごとに分類
        const typeGroups = new Map<string, HierarchyNode[]>();
        nodes.forEach(node => {
          const type = node.resource.type;
          if (!typeGroups.has(type)) {
            typeGroups.set(type, []);
          }
          typeGroups.get(type)?.push(node);
        });
        
        // タイプ順にソートして新しいノードリストを作成
        const sortedNodes: HierarchyNode[] = [];
        // 特定の順序でタイプを処理（VPCを先頭に、その後サブネット、その後他）
        const typeOrder = ['vpc', 'subnet', 'securityGroup'];
        
        // 優先タイプを先にソート
        typeOrder.forEach(type => {
          const group = typeGroups.get(type);
          if (group) {
            sortedNodes.push(...group);
            typeGroups.delete(type);
          }
        });
        
        // 残りのタイプを追加
        typeGroups.forEach(group => {
          sortedNodes.push(...group);
        });
        
        // 更新されたノードリストをレベルに設定
        this.levelNodes.set(level, sortedNodes);
      }
    };
    
    // タイプに基づいて整理
    organizeByTypeInLevel();
    
    // リソースタイプに応じたスペーシング係数の定義
    const typeSpacingFactor: {[key: string]: number} = {
      'vpc': 2.0,    // VPCは標準の2倍のスペースを確保
      'subnet': 3.5, // サブネットは標準の3.5倍のスペースを確保
      'securityGroup': 3.5, // セキュリティグループも標準の3.5倍のスペースを確保
      'default': 1.5 // その他のリソースは標準の1.5倍のスペースを確保
    };
    
    // 固定の水平スペーシング
    const horizontalSpacing = 40; // リソース間の水平スペーシング
    
    // 各レベルの最大幅を計算（リソース配置のための事前計算）
    const levelMaxWidths: number[] = [];
    for (let level = 0; level <= this.maxLevel; level++) {
      const nodes = this.levelNodes.get(level) || [];
      
      // このレベルのリソースが必要とする総スペースを計算
      let totalLevelWidth = 0;
      nodes.forEach(node => {
        const factor = typeSpacingFactor[node.resource.type] || typeSpacingFactor.default;
        totalLevelWidth += this.options.resourceWidth * factor;
      });
      
      // リソース間のスペースを追加
      if (nodes.length > 1) {
        totalLevelWidth += (nodes.length - 1) * horizontalSpacing;
      }
      
      levelMaxWidths[level] = totalLevelWidth;
    }
    
    // 最大レベル幅を見つける
    const maxLevelWidth = Math.max(...levelMaxWidths, 0);
    
    // 各レベルで横方向の配置を決定
    for (let level = 0; level <= this.maxLevel; level++) {
      const nodes = this.levelNodes.get(level) || [];
      const nodesCount = nodes.length;
      
      if (nodesCount === 0) continue;
      
      // このレベルの総幅
      const levelWidth = levelMaxWidths[level];
      
      // 左側のオフセットを計算（中央揃え）
      const leftOffset = (this.options.width - levelWidth) / 2;
      
      if (nodesCount === 1) {
        // 1つしかない場合は中央に配置
        const node = nodes[0];
        node.x = this.options.width / 2;
        node.y = this.options.padding + level * this.options.levelSpacing;
        this.resourceCoordinates.set(node.resource.id, { x: node.x, y: node.y });
      } else {
        // 複数ある場合は、左から順に配置
        let currentX = Math.max(leftOffset, this.options.padding); // 左端からのオフセットを確保
        
        nodes.forEach(node => {
          const factor = typeSpacingFactor[node.resource.type] || typeSpacingFactor.default;
          const allocatedSpace = this.options.resourceWidth * factor;
          
          // リソースの中心位置を計算
          node.x = currentX + allocatedSpace / 2;
          node.y = this.options.padding + level * this.options.levelSpacing;
          
          // 座標をマップに保存
          this.resourceCoordinates.set(node.resource.id, { x: node.x, y: node.y });
          
          // 次のリソースの開始位置を計算
          currentX += allocatedSpace + horizontalSpacing;
        });
      }
    }
  }
  
  // ツリーの親子接続線を描画
  private drawTreeConnections(svg: any): void {
    // 各ノードから子ノードへの接続線を描画
    this.resourceNodeMap.forEach(parentNode => {
      if (parentNode.x === undefined || parentNode.y === undefined) return;
      
      parentNode.children.forEach(childNode => {
        if (childNode.x === undefined || childNode.y === undefined) return;
        
        // 親から子への接続線
        const startX = parentNode.x!;
        const startY = parentNode.y! + this.options.resourceHeight / 2;
        const endX = childNode.x!;
        const endY = childNode.y! - this.options.resourceHeight / 2;
        
        // 接続線の中間点（ベジェ曲線用）
        const midY = (startY + endY) / 2;
        
        // 曲線パスを描画
        svg.path({
          d: `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
          stroke: '#007BFF',
          'stroke-width': '2',
          fill: 'none'
        });
      });
    });
  }
  
  // リソースを描画
  private drawResources(svg: any, resources: Resource[]): void {
    // リソースタイプに応じたスペーシング係数の定義
    const typeSpacingFactor: {[key: string]: number} = {
      'vpc': 3.0,
      'subnet': 8.0,
      'securityGroup': 8.0,
      'default': 2.5
    };
    
    for (const resource of resources) {
      const coords = this.resourceCoordinates.get(resource.id);
      if (!coords) continue;
      
      const { x, y } = coords;
      
      // リソースタイプに基づくスペーシング係数を取得
      const factor = typeSpacingFactor[resource.type] || typeSpacingFactor.default;
      
      // 幅をスペーシング係数に基づいて調整
      const resourceWidth = this.options.resourceWidth;
      const resourceHeight = this.options.resourceHeight;
      
      const halfWidth = resourceWidth / 2;
      const halfHeight = resourceHeight / 2;
      
      // リソースタイプに基づく色を取得
      const color = this.colors[resource.type] || '#000000';
      
      // リソースの背景を描画
      svg.rect({
        x: x - halfWidth,
        y: y - halfHeight,
        width: resourceWidth,
        height: resourceHeight,
        rx: 10,
        ry: 10,
        fill: this.hexToRgba(color, 0.1),
        stroke: color,
        'stroke-width': '2'
      });
      
      // リソースのアイコンを描画
      if (this.iconPaths[resource.type]) {
        // アイコンサイズの計算
        const iconSize = Math.min(resourceWidth, resourceHeight) * 0.6;
        const iconX = x - iconSize / 2;
        const iconY = y - iconSize / 2;
        
        svg.g({
          transform: `translate(${iconX}, ${iconY}) scale(${iconSize / 48}, ${iconSize / 48})`
        }).path({
          d: this.iconPaths[resource.type],
          stroke: color,
          'stroke-width': '2',
          fill: 'none'
        });
      }
      
      // リソースのタイプと名前を表示
      svg.text({
        x: x,
        y: y + halfHeight + 20,
        'font-family': 'Arial',
        'font-size': this.options.fontSize,
        'text-anchor': 'middle',
        'font-weight': 'bold',
        fill: color
      }, resource.name);
      
      svg.text({
        x: x,
        y: y + halfHeight + 40,
        'font-family': 'Arial',
        'font-size': this.options.fontSize - 2,
        'text-anchor': 'middle',
        fill: color
      }, `(${resource.type})`);
    }
  }
  
  // 関連接続線を描画（belongs_to以外）
  private drawRelationConnections(svg: any, connections: Connection[]): void {
    // belongs_to以外の接続のみフィルタリング
    const relationConnections = connections.filter(conn => conn.type !== 'belongs_to');
    
    for (const connection of relationConnections) {
      const sourceCoords = this.resourceCoordinates.get(connection.source);
      const targetCoords = this.resourceCoordinates.get(connection.target);
      
      if (!sourceCoords || !targetCoords) continue;
      
      // 接続タイプに基づく色を決定
      let color = '#666666';
      let strokeDasharray = '';
      
      switch (connection.type) {
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
      
      // 始点と終点
      const startX = sourceCoords.x;
      const startY = sourceCoords.y;
      const endX = targetCoords.x;
      const endY = targetCoords.y;
      
      // 点線または実線で接続
      svg.path({
        d: `M ${startX} ${startY} L ${endX} ${endY}`,
        stroke: color,
        'stroke-width': '1.5',
        'stroke-dasharray': strokeDasharray,
        fill: 'none'
      });
      
      // 接続線の中間に接続タイプを表示
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // 背景付きテキスト
      svg.rect({
        x: midX - 40,
        y: midY - 10,
        width: 80,
        height: 20,
        rx: 5,
        ry: 5,
        fill: 'white',
        stroke: 'none'
      });
      
      svg.text({
        x: midX,
        y: midY + 5,
        'font-family': 'Arial',
        'font-size': this.options.fontSize - 2,
        'text-anchor': 'middle',
        fill: color
      }, connection.type);
    }
  }
  
  // HEX色コードをRGBA形式に変換（透明度指定用）
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // すべてのリソースを配置した後に、実際に必要なキャンバスサイズを計算
  private calculateRequiredCanvasSize(): { width: number; height: number } {
    // 初期値はオプションで指定されたサイズ
    let maxWidth = this.options.width;
    let maxHeight = this.options.height;
    let minX = Infinity;
    
    // リソースの座標を確認し、必要な幅と高さを計算
    this.resourceCoordinates.forEach((coords, resourceId) => {
      const resource = this.resourceNodeMap.get(resourceId)?.resource;
      if (!resource) return;
      
      // リソースの実際の幅
      const resourceWidth = this.options.resourceWidth;
      const resourceHeight = this.options.resourceHeight;
      
      // テキストラベルのためのスペース（名前とタイプ表示用）
      const textSpace = 50;
      
      // 各リソースの左端、右端、下端を計算
      const leftEdge = coords.x - resourceWidth / 2;
      const rightEdge = coords.x + resourceWidth / 2;
      const bottomEdge = coords.y + resourceHeight / 2 + textSpace;
      
      // 最小X座標と最大X座標、最大Y座標を更新
      minX = Math.min(minX, leftEdge);
      maxWidth = Math.max(maxWidth, rightEdge);
      maxHeight = Math.max(maxHeight, bottomEdge);
    });
    
    // 最小X座標が0未満の場合（画面左にはみ出る場合）、オフセットを計算
    const xOffset = minX < this.options.padding ? this.options.padding - minX : 0;
    
    // オフセットが必要な場合、すべてのリソースを右にシフト
    if (xOffset > 0) {
      this.resourceCoordinates.forEach((coords, resourceId) => {
        coords.x += xOffset;
        this.resourceCoordinates.set(resourceId, coords);
      });
      // 最大幅も更新
      maxWidth += xOffset;
    }
    
    // 最小サイズを確保
    maxWidth = Math.max(maxWidth, 800);
    maxHeight = Math.max(maxHeight, 600);
    
    // パディングを追加
    maxWidth += this.options.padding;
    maxHeight += this.options.padding;
    
    console.log(`Calculated canvas size: ${maxWidth}x${maxHeight}`);
    
    return { width: maxWidth, height: maxHeight };
  }
} 