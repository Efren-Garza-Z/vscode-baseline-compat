// src/providers/jsTsHoverProvider.ts
import * as vscode from 'vscode';
import { loadFeatures } from '../lib/loadWebFeatures';
import type { FeatureData } from '../types';

export class JsTsHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_$]+/);
    if (!range) return null;
    const word = document.getText(range);

    const lineText = document.lineAt(position.line).text;
    const features = await loadFeatures();

    // heurísticas (de menor a mayor precisión)
    const candidates = new Set<string>();

    // 1) palabra sola
    candidates.add(word);

    // 2) si es miembro: buscar left context p.e. "navigator.clipboard.readText"
    const before = lineText.slice(0, range.end.character + 1);
    const m = before.match(/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)$/);
    if (m) {
      candidates.add(m[1]); // string como "navigator.clipboard.readText" o "Array.prototype.find"
      // agregar also last segment
      const parts = m[1].split('.');
      candidates.add(parts.slice(-1)[0]);
    }

    // 3) buscar en features (object keyed by id is fastest)
    let feature: FeatureData | undefined;
    for (const c of candidates) {
      // intento exacto por id
      feature = (features as any)[c] ?? feature;
      if (feature) break;
      // intento por id terminado en el token
      feature = Object.values(features).find((f: any) => f.id === c || (f.id && f.id.endsWith(c)) || (f.title && f.title.toLowerCase().includes(c.toLowerCase())));
      if (feature) break;
    }

    if (!feature) return null;

     // --- Construir hover ---
    const bs = feature.status?.baseline;
    const title =
      bs === 'high'
        ? 'Widely available'
        : bs === 'low'
        ? 'Newly available'
        : 'Limited/False';

    const md = new vscode.MarkdownString(
      `### Baseline: ${title}\n\n**${feature.title || feature.name || feature.id}**\n\n${feature.description ?? ''}`
    );
    md.isTrusted = false;

    return new vscode.Hover(md, range);
  }
}
