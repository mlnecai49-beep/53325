// treeRenderer.js — renderiza el árbol de análisis sintáctico en ASCII/texto

/**
 * Genera una representación visual del árbol en estilo árbol de directorio:
 *
 *  programa
 *  ├── instrucciones
 *  │   └── instruccion
 *  │       └── bucle
 *  │           ├── 'while'
 *  │           ├── '('
 *  │           ├── condicion
 *  │           │   └── '1'
 *  │           ├── ')'
 *  │           ├── '{'
 *  │           ├── sentencia
 *  │           │   └── ...
 *  │           └── '}'
 *  └── '<EOF>'
 */
export function renderTree(node, prefix = '', isLast = true) {
    const connector = isLast ? '└── ' : '├── ';
    const childPfx  = isLast ? '    ' : '│   ';

    // Etiqueta del nodo
    const label = node.children.length === 0
        ? `\x1b[36m${node.label}\x1b[0m`          // hojas en cian
        : `\x1b[33m${node.label}\x1b[0m`;          // reglas en amarillo

    let result = `${prefix}${connector}${label}\n`;

    for (let i = 0; i < node.children.length; i++) {
        const last = i === node.children.length - 1;
        result += renderTree(node.children[i], prefix + childPfx, last);
    }
    return result;
}

/**
 * Versión sin colores ANSI (para archivo / log)
 */
export function renderTreePlain(node, prefix = '', isLast = true) {
    const connector = isLast ? '└── ' : '├── ';
    const childPfx  = isLast ? '    ' : '│   ';
    let result = `${prefix}${connector}${node.label}\n`;
    for (let i = 0; i < node.children.length; i++) {
        const last = i === node.children.length - 1;
        result += renderTreePlain(node.children[i], prefix + childPfx, last);
    }
    return result;
}

/**
 * Tabla de tokens formateada
 */
export function renderTokenTable(tokens) {
    const header  = '┌─────────────────────┬──────────────────────┬──────────┬────────┐';
    const divider = '├─────────────────────┼──────────────────────┼──────────┼────────┤';
    const footer  = '└─────────────────────┴──────────────────────┴──────────┴────────┘';
    const row = (lexeme, type, line, col) =>
        `│ ${lexeme.padEnd(19)} │ ${type.padEnd(20)} │ ${String(line).padEnd(8)} │ ${String(col).padEnd(6)} │`;

    const lines = [
        header,
        row('LEXEMA', 'TOKEN', 'LÍNEA', 'COL'),
        divider,
    ];
    for (const t of tokens) {
        if (t.type === 'EOF') continue;
        lines.push(row(
            t.lexeme.substring(0, 19),
            t.type.substring(0, 20),
            t.line,
            t.col
        ));
    }
    lines.push(footer);
    return lines.join('\n');
}
