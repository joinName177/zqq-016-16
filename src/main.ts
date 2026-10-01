import './ui/styles.css';
import { TreeEngineAdapter } from './adapters/tree-engine.adapter';
import { LocalSpecimenAdapter } from './adapters/local-specimen.adapter';
import { CounterfactualTree } from './core/models';
import { renderTreeApp, PrunePendingViewModel } from './ui/app';

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
// 全局同时只存在一个待确认修剪；再次打开会整体替换，绝不与上一次累计
let pendingPruneNodeId: string | null = null;

const rootEl = document.getElementById('app')!;

function buildPrunePending(): PrunePendingViewModel | null {
  if (!pendingPruneNodeId) return null;
  const impact = treeAdapter.previewPrune(currentTree, pendingPruneNodeId);
  if (!impact) return null;

  const subtreeIds = new Set([impact.target.id, ...impact.descendants.map(n => n.id)]);
  const affectedSpecimens = specimenAdapter.getAll().filter(s => subtreeIds.has(s.nodeId));

  return {
    nodeId: impact.target.id,
    targetTitle: impact.target.title,
    affectedNodes: impact.descendants,
    affectedSpecimens
  };
}

function refreshView() {
  const specimens = specimenAdapter.getAll();

  renderTreeApp(
    rootEl,
    currentTree,
    specimens,
    isCabinetOpen,
    PRESETS,
    {
      onGrowNewTree: (assumption: string) => {
        currentTree = treeAdapter.createTree(assumption);
        pendingPruneNodeId = null;
        refreshView();
      },
      onWaterNode: (nodeId: string) => {
        currentTree = treeAdapter.water(currentTree, nodeId);
        refreshView();
      },
      onRequestPrune: (nodeId: string) => {
        // 每次打开都以当前树与标本馆重新计算，覆盖旧状态，避免重复打开反复累计
        pendingPruneNodeId = nodeId;
        refreshView();
      },
      onConfirmPrune: (nodeId: string) => {
        const impact = treeAdapter.previewPrune(currentTree, nodeId);
        if (impact) {
          const subtreeIds = new Set([impact.target.id, ...impact.descendants.map(n => n.id)]);
          const specimenIds = specimenAdapter
            .getAll()
            .filter(s => subtreeIds.has(s.nodeId))
            .map(s => s.id);

          // 确认后：统一执行树级联与标本清理，再统一刷新树与展柜
          currentTree = treeAdapter.prune(currentTree, nodeId);
          specimenAdapter.removeMany(specimenIds);
        }
        pendingPruneNodeId = null;
        refreshView();
      },
      onCancelPrune: () => {
        pendingPruneNodeId = null;
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
    buildPrunePending()
  );
}

// Initial render
refreshView();

