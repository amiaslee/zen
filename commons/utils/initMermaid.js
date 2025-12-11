export default function initMermaid() {
    if (typeof mermaid === 'undefined') {
        return;
    }

    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        suppressErrorRendering: true,
        flowchart: { htmlLabels: false }
    });

    async function processMermaidDiagrams(nodes) {
        for (const node of nodes) {
            if (node.hasAttribute('data-processed')) continue;
            node.setAttribute('data-processed', 'true');

            const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
            const code = node.textContent;

            try {
                // Using mermaid.render for explicit control
                // We need a temporary container sometimes, but render returns svg string now
                const { svg } = await mermaid.render(id, code);
                node.innerHTML = svg;
            } catch (error) {
                console.error('Mermaid rendering failed:', error);
                // Fallback to code block
                node.innerHTML = `
            <div style="color: var(--red-500); font-family: var(--font-family-code); font-size: 0.8em; margin-bottom: 8px;">Mermaid syntax error</div>
            <pre><code class="language-mermaid">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          `;
                node.classList.remove('mermaid-chart');
            }
        }
    }

    const observer = new MutationObserver((mutations) => {
        const newNodes = [];
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('mermaid-chart')) {
                        newNodes.push(node);
                    } else if (node.querySelectorAll) {
                        const charts = node.querySelectorAll('.mermaid-chart');
                        charts.forEach(chart => newNodes.push(chart));
                    }
                }
            });
        });

        if (newNodes.length > 0) {
            processMermaidDiagrams(newNodes);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial pass
    const initialCharts = document.querySelectorAll('.mermaid-chart');
    if (initialCharts.length > 0) {
        processMermaidDiagrams(initialCharts);
    }
}
