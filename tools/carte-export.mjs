// Génère docs/carte-mentale.md à partir d'un export de la carte mentale (un fichier JSON par nœud).
// Usage : node tools/carte-export.mjs <dossier contenant les <id>.json>
// Le dossier s'obtient avec ArtifactData `list` sur la collection "nodes" et l'option `out_dir`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('Indique le dossier des nœuds exportés');

const STATUS = { 'en-place': 'En place', prevu: 'Prévu', 'a-explorer': 'À explorer', abandonne: 'Abandonné' };
const KIND = { module: 'Module', mecanique: 'Mécanique', idee: 'Idée', question: 'Question' };

const nodes = new Map();
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
	const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
	const body = raw.data ?? raw; // l'export peut envelopper le document
	const id = raw.id ?? raw.doc_id ?? f.replace(/\.json$/, '');
	nodes.set(id, { ...body, id });
}

const childrenOf = (id) =>
	[...nodes.values()]
		.filter((n) => n.id !== 'root' && (nodes.has(n.parent) ? n.parent : 'root') === id)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const lines = [];
const walk = (id, depth) => {
	for (const n of childrenOf(id)) {
		const note = n.note ? ` — ${n.note.replace(/\s*\n\s*/g, ' / ')}` : '';
		lines.push(`${'  '.repeat(depth)}- **${n.label}** · ${KIND[n.kind] ?? ''} · ${STATUS[n.status] ?? ''}${note}`);
		walk(n.id, depth + 1);
	}
};
walk('root', 0);

const root = nodes.get('root');
const md = `# Carte mentale — ${root?.label ?? 'RPG Habitudes'}

Copie en lecture seule de la carte interactive : https://claude.ai/artifact/Bq2ySz5W8oPtYHMQpmxQz9
La carte fait foi ; ce fichier est régénéré avec \`node tools/carte-export.mjs <dossier>\` (${nodes.size} nœuds).

${lines.join('\n')}
`;
writeFileSync('docs/carte-mentale.md', md);
console.log(`docs/carte-mentale.md écrit (${nodes.size} nœuds)`);
