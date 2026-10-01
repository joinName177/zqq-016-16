import { CounterfactualTree, LifeSpecimen, PruneImpact } from '../core/models';

export interface TreeEnginePort {
  createTree(assumption: string): CounterfactualTree;
  water(tree: CounterfactualTree, nodeId: string): CounterfactualTree;
  prune(tree: CounterfactualTree, nodeId: string): CounterfactualTree;
  previewPrune(tree: CounterfactualTree, nodeId: string): PruneImpact | null;
  harvest(tree: CounterfactualTree, nodeId: string): LifeSpecimen;
}
