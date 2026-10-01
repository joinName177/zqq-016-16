export type LifeCategory = 'career' | 'romance' | 'inner' | 'twist';

export interface LifeNode {
  id: string;
  parentId?: string;
  layerIndex: number; // 0: 假说分歧点, 1: 1年后涟漪, 2: 3年后质变, 3: 5年后分道, 4: 10年后平行归宿
  eraLabel: string;
  title: string;
  scenarioDescription: string;
  vitality: number; // 0 - 100
  isPruned: boolean;
  waterCount: number;
  category: LifeCategory;
  categoryName: string;
  color: string;
  specimenQuote: string;
  childrenIds: string[];
}

export interface LifeSpecimen {
  id: string;
  nodeId: string;
  title: string;
  eraLabel: string;
  assumption: string;
  pathWay: string[];
  quote: string;
  butterflyTag: string;
  resonanceRating: number;
  harvestedAt: string;
}

export interface CounterfactualTree {
  id: string;
  assumption: string;
  rootId: string;
  nodes: Record<string, LifeNode>;
  createdAt: string;
  specimens: LifeSpecimen[];
}

/**
 * 修剪级联影响：在确认前推算本次修剪将波及的节点范围。
 * 仅统计当前尚未枯萎（未修剪）的节点，因此重复打开提示不会重复累计。
 */
export interface PruneImpact {
  /** 修剪起点 */
  targetNode: LifeNode;
  /** 受影响的全部节点（起点 + 尚未修剪的后代，按代际由近及远） */
  affectedNodes: LifeNode[];
  /** 受影响节点 id 集合，供标本比对 */
  affectedNodeIds: string[];
  /** 受影响的后代（不含起点本身，按代际由近及远） */
  descendantNodes: LifeNode[];
}
