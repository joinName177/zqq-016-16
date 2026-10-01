import { CounterfactualTree, LifeSpecimen, PruneImpact } from '../core/models';
import {
  buildCounterfactualTree,
  waterBranch,
  getPruneImpact,
  pruneBranch,
  harvestSpecimen
} from '../core/tree-engine';
import { TreeEnginePort } from '../ports/tree-engine.port';

export class TreeEngineAdapter implements TreeEnginePort {
  createTree(assumption: string): CounterfactualTree {
    return buildCounterfactualTree(assumption);
  }

  water(tree: CounterfactualTree, nodeId: string): CounterfactualTree {
    return waterBranch(tree, nodeId);
  }

  previewPrune(tree: CounterfactualTree, nodeId: string): PruneImpact | null {
    return getPruneImpact(tree, nodeId);
  }

  prune(tree: CounterfactualTree, nodeId: string): CounterfactualTree {
    return pruneBranch(tree, nodeId);
  }

  harvest(tree: CounterfactualTree, nodeId: string): LifeSpecimen {
    return harvestSpecimen(tree, nodeId);
  }
}
