// Construit build/artifact.html : la page publiée comme Artifact claude.ai (lien de test).
// L'hébergeur fournit lui-même <html>/<head>/<body> : on ne garde que le titre, la feuille de style
// et le bloc de démarrage SvelteKit, avec des chemins relatifs.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('build/index.html', 'utf8');
const css = [...html.matchAll(/<link href="(\/app\/[^"]+\.css)" rel="stylesheet">/g)].map((m) => m[1]);
const boot = html.match(/<div style="display: contents">[\s\S]*?<\/div>/)?.[0];
if (!boot || css.length === 0) throw new Error('index.html inattendu : relancer npm run build');

const page = [
	'<title>RPG Habitudes</title>',
	...css.map((href) => `<link rel="stylesheet" href=".${href}">`),
	boot.replaceAll('"/app/', '"./app/')
].join('\n');

writeFileSync('build/artifact.html', page + '\n');
console.log('build/artifact.html écrit');
