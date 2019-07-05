// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
	const lastLineId = document.lineCount - 1;
	return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

function getIndentationStyle(options: vscode.FormattingOptions) {
	let tc: string, td: number;
	if (options.insertSpaces) {
		tc = ' ';
		td = options.tabSize;
	}
	else {
		tc = '\t';
		td = 1;
	}
	const ts: number = options.tabSize;
	return { tc, td, ts };
}

function getSelectedLines(document: vscode.TextDocument, selection: vscode.Selection): vscode.Range {
	return new vscode.Range(document.lineAt(selection.start.line).range.start, document.lineAt(selection.end.line).range.end);
}

function getPreviousLineContaintingText(document: vscode.TextDocument, selectedLines: vscode.Range) {
	if (selectedLines.start.line > 0) {
		let priorLineNum: number = selectedLines.start.line;
		let priorLine: vscode.TextLine = document.lineAt(--priorLineNum);
		while (priorLine.text.trim() === '' && priorLineNum > 0) {
			priorLine = document.lineAt(--priorLineNum);
		}
		return priorLine;
	}
}

function guessPreIndentation(priorLine: vscode.TextLine, tabChar: string, tabDepth: number, tabSize: number) {
	let whiteSpace: string = priorLine.text.substr(0, priorLine.firstNonWhitespaceCharacterIndex);
	let preIndent = 0;
	let preIndentRemainder = 0;
	if (tabChar === ' ') {
		preIndent = Math.floor(whiteSpace.replace(/\t/g, ' '.repeat(tabSize)).length / tabSize) * tabDepth;
		preIndentRemainder = whiteSpace.replace(/\t/g, ' '.repeat(tabSize)).length % tabSize;
	} else {
		preIndent = whiteSpace.replace(new RegExp(' '.repeat(tabSize), 'g'), '\t').length;
	}
	if (/^#/.test(priorLine.text.trim())) {
		// do nothing
	} else if (/\{$/.test(priorLine.text.trim())) {
		preIndent += tabDepth;
	} else if (/\{\s*\}$/.test(priorLine.text.trim())) {
		// do nothing
	} else if (/\}$/.test(priorLine.text.trim()) && preIndent > 0) {
		preIndent -= tabDepth;
	}
	return tabChar.repeat(preIndent) + ' '.repeat(preIndentRemainder);
}

function formatRule(inputCode: string, preIndent: string = '', tabChar: string = ' ', tabDepth: number = 4): string {
	let tabLevel = 0;
	let out: string[] = [];
	inputCode.split('\n').forEach(element => {
		let line = element.trim();
		if (line === '') {
			out.push('');
		} else if (/^#/.test(line)) {
			out.push(preIndent + tabChar.repeat(tabLevel) + line);
		} else if (/\b\{\s*\}$/.test(line)) {
			out.push(preIndent + tabChar.repeat(tabLevel) + line);
		} else if (/\{$/.test(line) || /^\{$/.test(line)) {
			if (/^\}/.test(line)) {
				tabLevel = tabLevel - tabDepth;
				if (tabLevel < 0) {
					tabLevel = 0;
					preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
				}
			}
			out.push(preIndent + tabChar.repeat(tabLevel) + line);
			tabLevel += tabDepth;
		} else if (/^\}$/.test(line)) {
			tabLevel = tabLevel - tabDepth;
			if (tabLevel < 0) {
				tabLevel = 0;
				preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
			}
			out.push(preIndent + tabChar.repeat(tabLevel) + line);
		} else {
			out.push(preIndent + tabChar.repeat(tabLevel) + line);
		}
	});
	return out.join('\n');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerDocumentFormattingEditProvider('iapp-lang', {
		provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): vscode.TextEdit[] {
			const { tc, td, ts }: { tc: string; td: number, ts: number } = getIndentationStyle(options);

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return []; // No open text editor
			}

			const selection = editor.selection;
			if (selection.isEmpty) {
				return [vscode.TextEdit.replace(fullDocumentRange(document), formatRule(document.getText(), '', tc, td))];
			}

			let preIndent = '';
			let priorLine = getPreviousLineContaintingText(document, selection);
			if (priorLine !== undefined) {
				preIndent = guessPreIndentation(priorLine, tc, td, ts);
			}
			let selectedLines = getSelectedLines(document, selection);
			return [vscode.TextEdit.replace(selectedLines, formatRule(document.getText(selectedLines), preIndent, tc, td))];
		}
	});

	const iAppcompletionProvider = vscode.languages.registerCompletionItemProvider(
		'iapp-lang',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				let words = document.lineAt(position).text.substr(0, position.character).trim().split(' ');
				switch (words[0]) {
					default: {
						return undefined;
					}
				}
			}
		},
		' ' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(iAppcompletionProvider);

	const APLcompletionProvider = vscode.languages.registerCompletionItemProvider(
		'apl-lang',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				let words = document.lineAt(position).text.substr(0, position.character).trim().split(' ');
				switch (words[0]) {
					case "string": {

					}
					default: {
						return undefined;
					}
				}
			}
		},
		' ' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(APLcompletionProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
