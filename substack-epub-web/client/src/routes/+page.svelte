<script>
	import { env } from '$env/dynamic/public';

	let substackName = '';
	let isLoading = false;
	let error = null;

	const API_URL = env.PUBLIC_API_URL ?? 'http://localhost:3001';

	function handleSubmit() {
		// We'll implement this functionality later
		isLoading = true;
		// For now, just disable loading after 1 second
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	}
</script>

<main class="container">
	<div class="hero">
		<h1>Substack to EPUB Converter</h1>
		<p class="tagline">
			Transform any Substack blog into an EPUB file for easy reading on your e-reader
		</p>
	</div>

	<div class="card">
		<div class="card-body">
			<h2>Convert a Substack Blog</h2>
			<p>
				Enter the username of any Substack blog to generate an EPUB file with the latest articles.
			</p>

			<form on:submit|preventDefault={handleSubmit}>
				<div class="input-group">
					<div class="input-prefix">https://</div>
					<input
						type="text"
						bind:value={substackName}
						placeholder="substackname"
						aria-label="Substack username"
						required
					/>
					<div class="input-suffix">.substack.com</div>
				</div>

				<button type="submit" class="btn-primary" disabled={isLoading || !substackName}>
					{#if isLoading}
						<span class="loader"></span> Converting...
					{:else}
						Create EPUB
					{/if}
				</button>
			</form>

			{#if error}
				<div class="error-message">
					<p>{error}</p>
				</div>
			{/if}
		</div>
	</div>

	<div class="features">
		<div class="feature">
			<div class="icon">📱</div>
			<h3>Read Anywhere</h3>
			<p>Take your favorite Substack content with you on any e-reader device.</p>
		</div>

		<div class="feature">
			<div class="icon">⚡</div>
			<h3>Super Fast</h3>
			<p>Convert entire blogs in seconds with our optimized processing.</p>
		</div>

		<div class="feature">
			<div class="icon">🔄</div>
			<h3>Always Updated</h3>
			<p>Get the latest posts every time you generate a new EPUB.</p>
		</div>
	</div>

	<footer>
		<p>
			Built with ♥ by <a href="https://github.com/JollyGrin/remarkable-tools" target="_blank"
				>JollyGrin</a
			>
		</p>
	</footer>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		background-color: #f9fafb;
		color: #374151;
		line-height: 1.6;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		color: #1a56db;
		margin-bottom: 0.5rem;
	}

	.tagline {
		font-size: 1.25rem;
		color: #6b7280;
		max-width: 600px;
		margin: 0 auto;
	}

	.card {
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		margin-bottom: 3rem;
		overflow: hidden;
	}

	.card-body {
		padding: 2rem;
	}

	h2 {
		font-size: 1.5rem;
		margin-top: 0;
		color: #111827;
	}

	.input-group {
		display: flex;
		align-items: center;
		margin-bottom: 1.5rem;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.input-group:focus-within {
		border-color: #3b82f6;
	}

	.input-prefix,
	.input-suffix {
		background-color: #f3f4f6;
		padding: 0.75rem 1rem;
		color: #6b7280;
		font-family: monospace;
	}

	input {
		flex: 1;
		border: none;
		padding: 0.75rem;
		font-size: 1rem;
		outline: none;
	}

	.btn-primary {
		background-color: #1d4ed8;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.2s;
		width: 100%;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #1e40af;
	}

	.btn-primary:disabled {
		background-color: #93c5fd;
		cursor: not-allowed;
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #fee2e2;
		border-radius: 8px;
		color: #b91c1c;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.feature {
		text-align: center;
	}

	.icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	h3 {
		margin-top: 0;
		color: #111827;
	}

	footer {
		text-align: center;
		color: #6b7280;
		border-top: 1px solid #e5e7eb;
		padding-top: 2rem;
	}

	footer a {
		color: #1d4ed8;
		text-decoration: none;
	}

	footer a:hover {
		text-decoration: underline;
	}

	.loader {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		margin-right: 0.5rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.tagline {
			font-size: 1.1rem;
		}

		.features {
			grid-template-columns: 1fr;
		}

		.card-body {
			padding: 1.5rem;
		}
	}
</style>
