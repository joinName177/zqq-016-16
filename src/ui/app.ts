import { CounterfactualTree, LifeSpecimen, LifeNode } from '../core/models';

/** 修剪确认提示的视图模型：仅描述当前这一次待确认的修剪，不累计历史 */
export interface PrunePendingViewModel {
  nodeId: string;
  targetTitle: string;
  affectedNodes: LifeNode[];
  affectedSpecimens: LifeSpecimen[];
}

export interface TreeUIHandlers {
  onGrowNewTree: (assumption: string) => void;
  onWaterNode: (nodeId: string) => void;
  onRequestPrune: (nodeId: string) => void;
  onConfirmPrune: (nodeId: string) => void;
  onCancelPrune: () => void;
  onHarvestNode: (nodeId: string) => void;
  onDeleteSpecimen: (id: string) => void;
  onToggleCabinet: (open: boolean) => void;
}

export function renderTreeApp(
  container: HTMLElement,
  tree: CounterfactualTree,
  specimens: LifeSpecimen[],
  isCabinetOpen: boolean,
  presets: string[],
  handlers: TreeUIHandlers,
  prunePending?: PrunePendingViewModel | null
) {
  const esc = (s: string) =>
    s.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t));

  // Organize nodes by layer index (0 to 4)
  const layers: LifeNode[][] = [[], [], [], [], []];
  Object.values(tree.nodes).forEach(n => {
    if (layers[n.layerIndex]) {
      layers[n.layerIndex].push(n);
    }
  });

  const eraTitles = ['起点分歧点', '+1年·涟漪微漾', '+3年·风向转折', '+5年·航道分野', '+10年·宿命标本'];

  container.innerHTML = `
    <div class="tree-app">
      <header class="app-header">
        <div class="brand">
          <div class="tree-icon">🌿</div>
          <div>
            <h1>反事实平行人生树 · 平行人生标本集</h1>
            <p>COUNTERFACTUAL LIFE TREE &amp; PARALLEL SPECIMENS · v1.0.0</p>
          </div>
        </div>
        <button class="cabinet-btn" id="btnOpenCabinet">
          🗄️ 平行人生标本馆 (${specimens.length})
        </button>
      </header>

      <!-- Assumption Generator Hub -->
      <section class="generator-hub">
        <div class="assumption-input-wrap">
          <input type="text" class="assumption-input" id="assumptionInput" value="${esc(tree.assumption)}" placeholder="输入一个'如果当初……'的假设，观察平行人生分支生长" />
          <button class="btn-grow" id="btnGrowTree">生长反事实树 🌱</button>
        </div>
        <div class="preset-list">
          <span style="color:var(--text-muted);">经典假设母题：</span>
          ${presets.map(p => `<button class="btn-preset" data-preset="${esc(p)}">${esc(p)}</button>`).join('')}
        </div>
      </section>

      <!-- Main Tree Container -->
      <main class="tree-container">
        <div class="tree-header">
          <h2>🌳 当前反事实时空谱系：${esc(tree.assumption)}</h2>
          <span style="font-size:12px;color:var(--text-muted);">
            提示：点击【💧浇水】注入可能性能量，点击【✂️修剪】减除不想要的走向，点击【📌采集】定格标本
          </span>
        </div>

        <div class="generations-track">
          ${layers
            .map(
              (layerNodes, idx) => `
            <div class="generation-column">
              <div class="column-header">${eraTitles[idx]}</div>
              ${layerNodes
                .map(
                  node => `
                <div class="node-card ${node.isPruned ? 'pruned' : ''}" 
                     style="--cat-color: ${node.color};" 
                     data-id="${node.id}">
                  <span class="node-category-tag">${esc(node.categoryName)}</span>
                  <div class="node-title">${esc(node.title)}</div>
                  <div class="node-desc">${esc(node.scenarioDescription)}</div>
                  <div class="node-quote">${esc(node.specimenQuote)}</div>
                  
                  <div class="vitality-bar-bg">
                    <div class="vitality-bar-fill" style="width: ${node.vitality}%;"></div>
                  </div>

                  <div class="node-actions">
                    <button class="btn-action btn-water" data-id="${node.id}" title="注入生命力" ${node.isPruned ? 'disabled' : ''}>
                      💧 浇水 (${node.waterCount})
                    </button>
                    <button class="btn-action btn-prune" data-id="${node.id}" title="剪除此分支">
                      ✂️ 修剪
                    </button>
                    <button class="btn-action btn-harvest" data-id="${node.id}" title="收录进标本馆">
                      📌 采集标本
                    </button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
            )
            .join('')}
        </div>
      </main>

      <!-- Specimen Cabinet Modal -->
      ${
        isCabinetOpen
          ? `
        <div class="modal-overlay" id="cabinetOverlay">
          <div class="modal-content">
            <div class="cabinet-header">
              <h2>🗄️ 平行人生植物学标本集 (Herbarium of What-Ifs)</h2>
              <button class="btn-action" id="btnCloseCabinet" style="font-size:16px;">✕ 关闭</button>
            </div>

            ${
              specimens.length === 0
                ? `
              <div style="text-align:center;padding:40px;color:var(--text-muted);">
                🌱 标本柜暂空。请在反事实树上点击节点的【📌 采集标本】按钮，将某段平行人生命运封存入馆。
              </div>
            `
                : `
              <div class="specimens-grid">
                ${specimens
                  .map(
                    s => `
                  <div class="specimen-card">
                    <span class="specimen-tag">标本领域 · ${esc(s.butterflyTag)}</span>
                    <div class="specimen-title">${esc(s.title)}</div>
                    <div class="specimen-quote">${esc(s.quote)}</div>
                    <div class="specimen-path">
                      <strong>演化因果链：</strong><br />
                      ${s.pathWay.map(p => `↳ ${esc(p)}`).join('<br />')}
                    </div>
                    <div class="specimen-footer">
                      <span>采集时空：${s.harvestedAt}</span>
                      <button class="btn-del-specimen" data-delid="${s.id}">移出标本集</button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div style="text-align:right;margin-top:24px;">
                <button class="cabinet-btn" onclick="window.print()">🖨️ 导出 / 打印标本图册</button>
              </div>
            `
            }
          </div>
        </div>
      `
          : ''
      }

      <!-- Prune Cascade Confirmation Modal -->
      ${
        prunePending
          ? `
        <div class="modal-overlay prune-overlay" id="pruneOverlay">
          <div class="modal-content prune-modal">
            <div class="prune-header">
              <h2>✂️ 修剪级联影响确认</h2>
              <p class="prune-subtitle">剪除一枝，其下所有平行走向将一并枯萎，封存于这些枝桠上的标本也将随之移出标本馆。</p>
            </div>

            <div class="prune-target">
              <span class="prune-label">目标枝桠</span>
              <div class="prune-target-title">${esc(prunePending.targetTitle)}</div>
            </div>

            <div class="prune-impact-section">
              <div class="prune-impact-title">
                🍂 将一并枯萎的后代走向（${prunePending.affectedNodes.length}）
              </div>
              ${
                prunePending.affectedNodes.length === 0
                  ? `<div class="prune-impact-empty">该枝桠下暂无后代分叉。</div>`
                  : `
                <ul class="prune-impact-list">
                  ${prunePending.affectedNodes
                    .map(
                      n => `
                    <li>
                      <span class="prune-era">${esc(n.eraLabel)}</span>
                      <span class="prune-node-title">${esc(n.title)}</span>
                    </li>`
                    )
                    .join('')}
                </ul>`
              }
            </div>

            <div class="prune-impact-section">
              <div class="prune-impact-title">
                🗄️ 将移出标本馆的标本（${prunePending.affectedSpecimens.length}）
              </div>
              ${
                prunePending.affectedSpecimens.length === 0
                  ? `<div class="prune-impact-empty">这些枝桠上暂无已封存的标本。</div>`
                  : `
                <ul class="prune-impact-list prune-specimen-list">
                  ${prunePending.affectedSpecimens
                    .map(
                      s => `
                    <li>
                      <span class="prune-era">${esc(s.eraLabel)}</span>
                      <span class="prune-node-title">${esc(s.title)}</span>
                    </li>`
                    )
                    .join('')}
                </ul>`
              }
            </div>

            <div class="prune-actions">
              <button class="btn-action prune-cancel-btn" id="btnCancelPrune">再想想，保留枝桠</button>
              <button class="prune-confirm-btn" id="btnConfirmPrune">
                确认修剪（${prunePending.affectedNodes.length + 1} 个节点 · ${prunePending.affectedSpecimens.length} 件标本）
              </button>
            </div>
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;

  // Attach event listeners
  container.querySelector('#btnOpenCabinet')?.addEventListener('click', () => handlers.onToggleCabinet(true));
  container.querySelector('#btnCloseCabinet')?.addEventListener('click', () => handlers.onToggleCabinet(false));
  container.querySelector('#cabinetOverlay')?.addEventListener('click', e => {
    if (e.target === container.querySelector('#cabinetOverlay')) {
      handlers.onToggleCabinet(false);
    }
  });

  const inputEl = container.querySelector('#assumptionInput') as HTMLInputElement;
  const triggerGrow = () => {
    const val = inputEl.value.trim();
    if (val) handlers.onGrowNewTree(val);
  };

  container.querySelector('#btnGrowTree')?.addEventListener('click', triggerGrow);
  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter') triggerGrow();
  });

  container.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      if (preset) {
        inputEl.value = preset;
        handlers.onGrowNewTree(preset);
      }
    });
  });

  // Action buttons on nodes
  container.querySelectorAll('.btn-water').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (id) handlers.onWaterNode(id);
    });
  });

  container.querySelectorAll('.btn-prune').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (id) handlers.onRequestPrune(id);
    });
  });

  container.querySelectorAll('.btn-harvest').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (id) handlers.onHarvestNode(id);
    });
  });

  container.querySelectorAll('.btn-del-specimen').forEach(btn => {
    btn.addEventListener('click', () => {
      const delId = btn.getAttribute('data-delid');
      if (delId) handlers.onDeleteSpecimen(delId);
    });
  });

  // Prune confirmation modal
  const pruneOverlay = container.querySelector('#pruneOverlay');
  pruneOverlay?.addEventListener('click', e => {
    if (e.target === pruneOverlay) handlers.onCancelPrune();
  });
  container.querySelector('#btnCancelPrune')?.addEventListener('click', () => handlers.onCancelPrune());
  container.querySelector('#btnConfirmPrune')?.addEventListener('click', () => {
    if (prunePending) handlers.onConfirmPrune(prunePending.nodeId);
  });
}
