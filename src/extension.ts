// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama'; // Add this line to import ollama

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vs-ext-deepseek" is now active!');

	const disposable = vscode.commands.registerCommand('vs-ext-deepseek.hiDeepseek', () => {
		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);
		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage(async (message: any) => {
			if (message.command === 'chat') {
				const userPrompt = message.text;
				let responseText = '';

				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:1.5b',
						messages: [{ role: 'user', content: userPrompt }],
						stream: true
					});
					for await (const part of streamResponse) {
						responseText += part.message.content;
						panel.webview.postMessage({ command: 'chatResponse', text: responseText });
					}

				}
				catch (err){
					panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(err)}`});
				}
			}
		});
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
	return `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<style>
				body {
					background-color: #333;
					color: #fff;
					margin: 1rem;
					font-family: sans-serif;
				}
					#prompt { width: 100%; box-sizing: border-box; padding: 0.5rem; }
					#response { border: 1px solid #ccc; margin-top: 1rem; width: 100%; padding: 0.5rem; }
			</style>
		</head>
		<body>
			<h2>Deep Seek Chat VS Code extension</h2>
			<textarea id="prompt" rows="3" placeholder="Test me..."></textarea><br />
			<button id="askBtn">Ask</button>
			<div id="response"></div>
		
			<script>
				const vscode = acquireVsCodeApi();
		
				document.getElementById('askBtn').addEventListener('click', () => {
					const text = document.getElementById('prompt').value;
					vscode.postMessage({ command: 'chat', text });
				});
		
				window.addEventListener('message', event => {
					const { command, text } = event.data;
					if (command === 'chatResponse') {
						document.getElementById('response').innerText = text;
					}
				});
			</script>
		</body>
	</html>`;
}


// This method is called when your extension is deactivated
export function deactivate() {}
