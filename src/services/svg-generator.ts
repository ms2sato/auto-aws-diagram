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
      width: options.width || 1800,
      height: options.height || 1400,
      resourceSpacing: options.resourceSpacing || 180,
      resourceWidth: options.resourceWidth || 120,
      resourceHeight: options.resourceHeight || 120,
      fontSize: options.fontSize || 14,
      padding: options.padding || 100
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
    // 最初に全ノードのサイズを計算
    this.preCalculateAllNodeSizes();
    
    const topLevelCount = this.hierarchy.length;
    const availableWidth = this.options.width - (this.options.padding * 2);
    const horizontalStep = availableWidth / (topLevelCount + 1);
    
    // 最初にトップレベルのリソースの位置を決定
    let totalTopLevelWidth = 0;
    
    // まずトップレベルノードの総幅を計算
    for (let i = 0; i < topLevelCount; i++) {
      const node = this.hierarchy[i];
      if (node.width) {
        totalTopLevelWidth += node.width;
      }
    }
    
    // 余白を追加
    totalTopLevelWidth += (topLevelCount - 1) * this.options.resourceSpacing;
    
    // 開始X座標（左揃えではなく中央揃え）
    let currentX = (this.options.width - totalTopLevelWidth) / 2;
    const startY = this.options.padding * 2;
    
    // トップレベルノードを配置
    for (let i = 0; i < topLevelCount; i++) {
      const node = this.hierarchy[i];
      const nodeWidth = node.width || this.options.resourceWidth;
      
      // ノードの中心X座標
      const centerX = currentX + (nodeWidth / 2);
      this.positionNodeWithChildren(node, centerX, startY);
      
      // 次のノードのX座標を更新
      currentX += nodeWidth + this.options.resourceSpacing;
    }
    
    // SVGの高さを再計算（必要に応じて拡張）
    let maxHeight = 0;
    this.hierarchy.forEach(node => {
      if (node.y !== undefined && node.height !== undefined) {
        const bottomY = node.y + node.height / 2;
        maxHeight = Math.max(maxHeight, bottomY);
      }
    });
    
    // 余白を追加
    maxHeight += this.options.padding * 2;
    
    // SVGの高さが足りない場合は拡張
    if (maxHeight > this.options.height) {
      this.options.height = maxHeight;
    }
    
    // 座標情報をリソースマップに保存
    this.saveCoordinates();
  }
  
  // 全ノードのサイズを事前計算
  private preCalculateAllNodeSizes(): void {
    // ボトムアップでサイズを計算（子から親へ）
    const calculateNodeSizeRecursive = (node: HierarchyNode): { width: number, height: number } => {
      const isContainer = this.containerTypes.includes(node.resource.type);
      
      // 基本サイズ
      let nodeWidth = this.options.resourceWidth;
      let nodeHeight = this.options.resourceHeight;
      
      // コンテナでない、または子がない場合は基本サイズを返す
      if (!isContainer || node.children.length === 0) {
        node.width = nodeWidth;
        node.height = nodeHeight;
        return { width: nodeWidth, height: nodeHeight };
      }
      
      // 子要素のサイズを先に計算
      const childSizes: { width: number, height: number }[] = [];
      let totalChildWidth = 0;
      let maxChildHeight = 0;
      
      for (const child of node.children) {
        const size = calculateNodeSizeRecursive(child);
        childSizes.push(size);
        totalChildWidth += size.width;
        maxChildHeight = Math.max(maxChildHeight, size.height);
      }
      
      // 子要素間のスペースを追加
      totalChildWidth += (node.children.length - 1) * this.options.resourceSpacing;
      
      // コンテナのヘッダー部分の高さ
      const containerHeaderHeight = this.options.resourceHeight * 1.5;
      
      // コンテナのサイズを計算
      const containerPadding = this.options.resourceSpacing;
      nodeWidth = Math.max(this.options.resourceWidth * 3, totalChildWidth + containerPadding * 2);
      nodeHeight = containerHeaderHeight + maxChildHeight + containerPadding * 2;
      
      // 幅の制約（親コンテナがある場合）
      const maxWidth = this.options.width * 0.8;
      if (nodeWidth > maxWidth) {
        // 複数行レイアウトが必要な場合
        const rowWidth = maxWidth - containerPadding * 2;
        let rowHeight = 0;
        let currentRowWidth = 0;
        let rows = 1;
        
        for (let i = 0; i < childSizes.length; i++) {
          const childSize = childSizes[i];
          
          if (currentRowWidth + childSize.width > rowWidth && i > 0) {
            // 次の行へ
            currentRowWidth = childSize.width;
            rows++;
          } else {
            currentRowWidth += childSize.width + this.options.resourceSpacing;
          }
          
          rowHeight = Math.max(rowHeight, childSize.height);
        }
        
        // 複数行の場合の高さ計算
        nodeHeight = containerHeaderHeight + (rowHeight * rows) + 
                     ((rows - 1) * this.options.resourceSpacing) + 
                     containerPadding * 2;
        
        nodeWidth = maxWidth;
      }
      
      node.width = nodeWidth;
      node.height = nodeHeight;
      return { width: nodeWidth, height: nodeHeight };
    };
    
    // 各トップレベルノードのサイズを計算
    for (const node of this.hierarchy) {
      calculateNodeSizeRecursive(node);
    }
  }
  
  // ノードと子要素を再帰的に配置
  private positionNodeWithChildren(node: HierarchyNode, x: number, y: number): void {
    if (!node.width || !node.height) {
      // サイズが計算されていない場合はデフォルト値を設定
      node.width = this.options.resourceWidth;
      node.height = this.options.resourceHeight;
    }
    
    // ノード自体の位置を設定
    node.x = x;
    node.y = y;
    
    const isContainer = this.containerTypes.includes(node.resource.type);
    if (!isContainer || node.children.length === 0) {
      return; // 子要素がない場合は処理終了
    }
    
    // コンテナのヘッダー部分の高さ
    const containerHeaderHeight = this.options.resourceHeight * 1.5;
    const containerPadding = this.options.resourceSpacing;
    
    // 子要素の総幅を計算
    let totalChildWidth = 0;
    for (const child of node.children) {
      totalChildWidth += (child.width || this.options.resourceWidth);
    }
    
    // 子要素間のスペースを追加
    totalChildWidth += (node.children.length - 1) * this.options.resourceSpacing;
    
    // 子要素の開始位置（親の中央からオフセット）
    let startX = x - (totalChildWidth / 2);
    const startY = y + containerHeaderHeight;
    
    // 幅の制約を確認
    const availableWidth = node.width - containerPadding * 2;
    if (totalChildWidth > availableWidth) {
      // 複数行レイアウトが必要
      this.arrangeChildrenInRows(node, x, startY, availableWidth);
    } else {
      // 1行で収まる場合
      let currentX = startX;
      
      for (const child of node.children) {
        const childWidth = child.width || this.options.resourceWidth;
        const childCenterX = currentX + (childWidth / 2);
        
        this.positionNodeWithChildren(child, childCenterX, startY);
        
        currentX += childWidth + this.options.resourceSpacing;
      }
    }
  }
  
  // 子要素を複数行に配置
  private arrangeChildrenInRows(
    parentNode: HierarchyNode, 
    parentCenterX: number, 
    startY: number, 
    availableWidth: number
  ): void {
    const rows: HierarchyNode[][] = [[]];
    let currentRow = 0;
    let currentRowWidth = 0;
    
    // 子要素を行に分割
    for (const child of parentNode.children) {
      const childWidth = child.width || this.options.resourceWidth;
      
      // 現在の行に収まらない場合、次の行へ
      if (currentRowWidth + childWidth > availableWidth && rows[currentRow].length > 0) {
        currentRow++;
        rows[currentRow] = [];
        currentRowWidth = 0;
      }
      
      rows[currentRow].push(child);
      currentRowWidth += childWidth + this.options.resourceSpacing;
    }
    
    // 各行の子要素を配置
    let currentY = startY;
    
    for (const row of rows) {
      // 行の総幅を計算
      let rowWidth = 0;
      let maxHeight = 0;
      
      for (const child of row) {
        rowWidth += (child.width || this.options.resourceWidth);
        maxHeight = Math.max(maxHeight, child.height || this.options.resourceHeight);
      }
      
      // 子要素間のスペースを追加
      rowWidth += (row.length - 1) * this.options.resourceSpacing;
      
      // 行の開始X座標（親の中央からオフセット）
      let currentX = parentCenterX - (rowWidth / 2);
      
      // 行内の各子要素を配置
      for (const child of row) {
        const childWidth = child.width || this.options.resourceWidth;
        const childCenterX = currentX + (childWidth / 2);
        
        this.positionNodeWithChildren(child, childCenterX, currentY + (maxHeight / 2));
        
        currentX += childWidth + this.options.resourceSpacing;
      }
      
      // 次の行のY座標を更新
      currentY += maxHeight + this.options.resourceSpacing;
    }
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
      const y = node.y - node.height / 2 + this.options.resourceHeight / 2;
      
      // コンテナの背景を描画
      svg.rect({
        x: x,
        y: y,
        width: node.width,
        height: node.height,
        rx: 15,
        ry: 15,
        fill: this.hexToRgba(color, 0.1),
        stroke: color,
        'stroke-width': '2',
        'stroke-dasharray': '5,5'
      });
      
      // コンテナのヘッダー部分を描画
      svg.rect({
        x: x,
        y: y,
        width: node.width,
        height: this.options.resourceHeight,
        rx: 15,
        ry: 15,
        fill: this.hexToRgba(color, 0.2),
        stroke: 'none'
      });
      
      // コンテナのアイコンを描画（ヘッダー内）
      if (this.iconPaths[resourceType]) {
        const iconSize = this.options.resourceHeight * 0.7;
        svg.g({
          transform: `translate(${x + 20}, ${y + (this.options.resourceHeight - iconSize) / 2}) scale(${iconSize / 48}, ${iconSize / 48})`
        }).path({
          d: this.iconPaths[resourceType],
          stroke: color,
          'stroke-width': '3',
          fill: 'none'
        });
      }
      
      // コンテナの名前を表示（ヘッダー内）
      svg.text({
        x: x + 30 + this.options.resourceHeight * 0.7,
        y: y + this.options.resourceHeight / 2 + 5,
        'font-family': 'Arial',
        'font-weight': 'bold',
        'font-size': this.options.fontSize + 2,
        'dominant-baseline': 'middle',
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
      
      // コンテナリソースの場合、そのアイコンはdrawContainersで描画済みなのでスキップ
      const isContainer = this.containerTypes.includes(resource.type);
      const hasChildren = isContainer && 
        this.resourceNodeMap.get(resource.id)?.children.length! > 0;
      
      if (!hasChildren) {
        // 非コンテナリソースまたは子を持たないコンテナリソースのアイコンを描画
        if (this.iconPaths[resource.type]) {
          const color = this.colors[resource.type] || '#000000';
          
          // アイコン背景を描画
          svg.rect({
            x: x - halfWidth,
            y: y - halfHeight,
            width: this.options.resourceWidth,
            height: this.options.resourceHeight,
            rx: 10,
            ry: 10,
            fill: this.hexToRgba(color, 0.1),
            stroke: color,
            'stroke-width': '1'
          });
          
          // リソースのアイコンを中央に描画
          const iconSize = Math.min(this.options.resourceWidth, this.options.resourceHeight) * 0.6;
          const iconX = x - (iconSize / 2);
          const iconY = y - (iconSize / 2);
          
          svg.g({
            transform: `translate(${iconX}, ${iconY}) scale(${iconSize / 48}, ${iconSize / 48})`
          }).path({
            d: this.iconPaths[resource.type],
            stroke: color,
            'stroke-width': '2',
            fill: 'none'
          });
          
          // リソース名を描画
          svg.text({
            x: x,
            y: y + halfHeight + 25,
            'font-family': 'Arial',
            'font-size': this.options.fontSize,
            'text-anchor': 'middle',
            'font-weight': 'bold',
            fill: color
          }, resource.name);
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
          
          // リソース名を描画
          svg.text({
            x: x,
            y: y + halfHeight + 25,
            'font-family': 'Arial',
            'font-size': this.options.fontSize,
            'text-anchor': 'middle'
          }, resource.name);
        }
      }
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