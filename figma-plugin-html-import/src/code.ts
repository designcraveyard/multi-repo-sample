import { convertTree } from './converter/node-factory';
import type { LayerNode } from './parser/types';

figma.showUI(__html__, { width: 420, height: 520, themeColors: true });

interface ConvertMsg {
  type: 'convert';
  tree: LayerNode;
}

interface ConvertBatchMsg {
  type: 'convert-batch';
  pages: Array<{ name: string; tree: LayerNode }>;
}

type PluginMessage = ConvertMsg | ConvertBatchMsg;

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === 'convert' && msg.tree) {
    try {
      const nodeCount = countNodes(msg.tree);
      console.log('[h2f] Received tree for conversion:', {
        nodeCount,
        rootName: msg.tree.name,
        rootSize: `${msg.tree.width}x${msg.tree.height}`,
        rootLayout: msg.tree.layoutMode,
        rootWrap: msg.tree.layoutWrap,
        childCount: msg.tree.children.length,
      });

      const rootFrame = await convertTree(msg.tree, (current, total) => {
        figma.ui.postMessage({ type: 'progress', current, total });
      });

      console.log('[h2f] Conversion complete:', {
        nodeCount,
        figmaFrameSize: `${rootFrame.width}x${rootFrame.height}`,
        figmaLayoutMode: rootFrame.layoutMode,
      });

      figma.ui.postMessage({ type: 'done', nodeCount });
      figma.notify(`Imported ${nodeCount} layers`, { timeout: 3000 });

      figma.currentPage.selection = [rootFrame];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      figma.ui.postMessage({ type: 'error', message });
      figma.notify('Import failed: ' + message, { error: true });
    }
  }

  if (msg.type === 'convert-batch' && msg.pages) {
    try {
      const frames: FrameNode[] = [];
      let totalNodes = 0;

      for (let i = 0; i < msg.pages.length; i++) {
        const page = msg.pages[i];
        figma.ui.postMessage({
          type: 'batch-progress',
          current: i + 1,
          total: msg.pages.length,
          pageName: page.name,
        });

        const rootFrame = await convertTree(page.tree, (current, total) => {
          figma.ui.postMessage({ type: 'progress', current, total });
        });

        rootFrame.name = page.name;
        frames.push(rootFrame);
        totalNodes += countNodes(page.tree);
      }

      figma.currentPage.selection = frames;
      figma.viewport.scrollAndZoomIntoView(frames);

      figma.ui.postMessage({ type: 'done', nodeCount: totalNodes, pageCount: msg.pages.length });
      figma.notify(`Imported ${msg.pages.length} pages (${totalNodes} layers)`, { timeout: 3000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      figma.ui.postMessage({ type: 'error', message });
      figma.notify('Import failed: ' + message, { error: true });
    }
  }
};

function countNodes(node: LayerNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}
