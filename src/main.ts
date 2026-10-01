import './ui/styles.css';
import { TreeEngineAdapter } from './adapters/tree-engine.adapter';
import { LocalSpecimenAdapter } from './adapters/local-specimen.adapter';
import { CounterfactualTree, PruneImpact } from './core/models';
import { renderTreeApp, PruneImpactView } from './ui/app';

const treeAdapter = new TreeEngineAdapter();
const specimenAdapter = new LocalSpecimenAdapter();

const PRESETS = [
  '如果当初我留在了故乡小城',
  '如果当初我鼓起勇气向TA表白了心意',
  '如果当年我选择了读纯艺术专业',
  '如果当年我没有接受那家大厂的Offer'
];

let currentTree: CounterfactualTree = treeAdapter.createTree(PRESETS[0]);
let isCabinetOpen = false;
// 待确认的修剪影响。每次打开均由当前树状态重新推算，重复打开不会累计
let pendingPrune: PruneImpact | null = null;

const rootEl = document.getElementById('app')!;

function refreshView() {
  const specimens = specimenAdapter.getAll();

  // 以当前最新状态组装级联影响视图（受影响后代 + 受影响标本），纯派生、不累计
  let pruneImpactView: PruneImpactView | null = null;
  if (pendingPrune) {
    const affectedIdSet = new Set(pendingPrune.affectedNodeIds);
    pruneImpactView = {
      ...pendingPrune,
      affectedSpecimens: specimens.filter(s => affectedIdSet.has(s.nodeId))
    };
  }

  renderTreeApp(
    rootEl,
    currentTree,
    specimens,
    isCabinetOpen,
    PRESETS,
    {
      onGrowNewTree: (assumption: string) => {
        currentTree = treeAdapter.createTree(assumption);
        pendingPrune = null;
        refreshView();
      },
      onWaterNode: (nodeId: string) => {
        currentTree = treeAdapter.water(currentTree, nodeId);
        refreshView();
      },
      onPruneNode: (nodeId: string) => {
        // 确认前：仅实时推演并展示受影响的后代与标本，不动树
        pendingPrune = treeAdapter.previewPrune(currentTree, nodeId);
        refreshView();
      },
      onConfirmPrune: (nodeId: string) => {
        const impact = pendingPrune;
        // 确认后：执行修剪，并将受影响标本移出标本馆，最后统一刷新树与展柜
        currentTree = treeAdapter.prune(currentTree, nodeId);
        if (impact) {
          specimenAdapter.removeByNodeIds(impact.affectedNodeIds);
        }
        pendingPrune = null;
        refreshView();
      },
      onCancelPrune: () => {
        pendingPrune = null;
        refreshView();
      },
      onHarvestNode: (nodeId: string) => {
        const sp = treeAdapter.harvest(currentTree, nodeId);
        specimenAdapter.save(sp);
        alert(`已成功将节点【${sp.title}】收入平行人生标本馆！`);
        refreshView();
      },
      onDeleteSpecimen: (id: string) => {
        specimenAdapter.remove(id);
        refreshView();
      },
      onToggleCabinet: (open: boolean) => {
        isCabinetOpen = open;
        refreshView();
      }
    },
    pruneImpactView
  );
}

// Initial render
refreshView();
