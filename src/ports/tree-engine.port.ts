import { CounterfactualTree, LifeSpecimen, PruneImpact } from '../core/models';

export interface TreeEnginePort {
  createTree(assumption: string): CounterfactualTree;
  water(tree: CounterfactualTree, nodeId: string): CounterfactualTree;
  /** 推演修剪的级联影响（受影响后代与标本比对依据），不修改树 */
  previewPrune(tree: CounterfactualTree, nodeId: string): PruneImpact | null;
  prune(tree: CounterfactualTree, nodeId: string): CounterfactualTree;
  harvest(tree: CounterfactualTree, nodeId: string): LifeSpecimen;
}
