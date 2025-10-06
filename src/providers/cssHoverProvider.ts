// src/providers/cssHoverProvider.ts
import * as vscode from 'vscode';
import type { FeatureData } from '../types';
import { loadFeatures } from '../lib/loadWebFeatures';

export class CssHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {

    if (!['css', 'scss', 'less'].includes(document.languageId)) {
      return null;
    }

    const range = document.getWordRangeAtPosition(position, /[\w-]+/);
    if (!range) return null;
    const word = document.getText(range);

    const features = await loadFeatures();

    // 1) intento directo por id
    let feature: FeatureData | undefined = features[word];

    // 2) si no, intentar como property:value en la línea
    if (!feature) {
      const lineText = document.lineAt(position.line).text;
      const propertyMatch = lineText.match(/([\w-]+)\s*:\s*([\w-]+)/);
      if (propertyMatch && propertyMatch[2] === word) {
        const idCandidate = `${propertyMatch[1]}/${word}`;
        feature = features[idCandidate] ?? Object.values(features).find((f: any) => f.id === idCandidate);
      }
    }

    // 3) busqueda por título / nombre (fallback, más lenta)
    if (!feature) {
      const values = Object.values(features) as FeatureData[];
      feature = values.find((f) => (f.id === word) || (f.title && f.title.toLowerCase().includes(word.toLowerCase())));
    }

    if (!feature) return null;

    const bs = feature.status?.baseline;
    const title = `Baseline: ${bs === 'high' ? 'Widely available' : bs === 'low' ? 'Newly available' : 'Limited/False'}`;

    const md = new vscode.MarkdownString(`### ${title}\n\n**${feature.title || feature.name || feature.id}**\n\n${feature.description ?? ''}`);
    md.isTrusted = false;
    return new vscode.Hover(md, range);
  }
}
