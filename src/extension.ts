// src/extension.ts

import * as vscode from 'vscode';
import { CssHoverProvider } from './providers/cssHoverProvider';
import { JsTsHoverProvider } from './providers/jsTsHoverProvider';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
  		vscode.languages.registerHoverProvider(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'], new JsTsHoverProvider()),
 		vscode.languages.registerHoverProvider(['css', 'scss', 'less'], new CssHoverProvider())
 	);

    console.log('Congratulations, your "vscode-baseline-compat" extension is now active!');
}

export function deactivate() {}