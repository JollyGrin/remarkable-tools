<script lang="ts">
	import { onMount } from 'svelte';

	let files = $state<Array<{ ID: string; VissibleName: string; Type: string }>>([]);
	let isLoading = $state(false);
	let logs = $state<Array<{ timestamp: string; message: string; type: 'info' | 'error' | 'success' }>>([]);

	function addLog(message: string, type: 'info' | 'error' | 'success' = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		logs = [...logs, { timestamp, message, type }];
		console.log(`[${type.toUpperCase()}] ${message}`);
	}

	async function fetchFiles() {
		isLoading = true;
		addLog('Fetching files from Remarkable...');
		try {
			const response = await fetch('/remarkable/documents/', {
				method: 'POST'
			});
			const data = await response.json();
			files = data;
			addLog(`Successfully fetched ${data.length} files`, 'success');
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			addLog(`Error fetching files: ${errorMsg}`, 'error');
		} finally {
			isLoading = false;
		}
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const file = input.files[0];
		const fileSizeMB = file.size / (1024 * 1024);
		addLog(`File size: ${fileSizeMB.toFixed(2)} MB`);

		addLog(`Starting upload of ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

		// Get the correct content type based on file extension
		const getContentType = (filename: string) => {
			const ext = filename.toLowerCase().split('.').pop();
			switch (ext) {
				case 'pdf':
					return 'application/pdf';
				case 'epub':
					return 'application/epub+zip';
				case 'md':
				case 'markdown':
					return 'text/markdown';
				default:
					return 'application/octet-stream';
			}
		};

		const formData = new FormData();
		// Match the exact format from the working shell script
		formData.append('file', file, `filename=${file.name};type=${getContentType(file.name)}`);

		try {
			const response = await fetch('/remarkable/upload', {
				method: 'POST',
				headers: {
					'Origin': 'http://10.11.99.1',
					'Accept': '*/*',
					'Referer': 'http://10.11.99.1/',
					'Connection': 'keep-alive'
				},
				body: formData
			});

			if (response.ok) {
				addLog(`Successfully uploaded ${file.name}`, 'success');
				await fetchFiles(); // Refresh file list
			} else {
				let errorMessage = await response.text();
				try {
					// Try to parse error as JSON
					const jsonError = JSON.parse(errorMessage);
					errorMessage = jsonError.error || errorMessage;
				} catch {
					// If not JSON, use as is
				}
				addLog(`Upload failed: ${errorMessage}`, 'error');
			}
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			addLog(`Error uploading file: ${errorMsg}`, 'error');
		}
	}

	// Initial fetch
	onMount(() => {
		fetchFiles();
	});
</script>

{#snippet fileList(files)}
	<div class="files">
		{#each files as file}
			<div class="file">
				<span>{file.VissibleName}</span>
				<span class="type">{file.Type}</span>
			</div>
		{/each}
	</div>
{/snippet}

<main>
	<h1>Remarkable Tools Dashboard</h1>

	<div class="upload-section">
		<label for="file-upload" class="upload-button">
			Upload File
			<input
				type="file"
				id="file-upload"
				accept=".pdf,.epub,.md"
				on:change={handleFileUpload}
				style="display: none"
			/>
		</label>
	</div>

	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else}
		{@render fileList(files)}
	{/if}

	<div class="console">
		<h3>Console</h3>
		<div class="console-content">
			{#each logs as log}
				<div class="log-entry {log.type}">
					<span class="timestamp">{log.timestamp}</span>
					<span class="message">{log.message}</span>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	h1 {
		color: #333;
		margin-bottom: 2rem;
	}

	.upload-section {
		margin-bottom: 2rem;
	}

	.upload-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background-color: #007bff;
		color: white;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.upload-button:hover {
		background-color: #0056b3;
	}

	.files {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.file {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
		background-color: #f8f9fa;
		border-radius: 4px;
		align-items: center;
	}

	.type {
		color: #6c757d;
		font-size: 0.875rem;
	}

	.loading {
		text-align: center;
		color: #6c757d;
		padding: 2rem;
	}

	.console {
		margin-top: auto;
		background-color: #1e1e1e;
		border-radius: 4px;
		padding: 1rem;
	}

	.console h3 {
		color: #fff;
		margin: 0 0 1rem 0;
		font-size: 1rem;
	}

	.console-content {
		max-height: 200px;
		overflow-y: auto;
		font-family: monospace;
	}

	.log-entry {
		padding: 0.25rem;
		color: #fff;
		font-size: 0.875rem;
		display: flex;
		gap: 0.5rem;
	}

	.log-entry.error {
		color: #ff6b6b;
	}

	.log-entry.success {
		color: #51cf66;
	}

	.log-entry .timestamp {
		color: #868e96;
	}

	.log-entry .message {
		flex: 1;
		word-break: break-all;
	}
</style>
