// index.js — Programa principal del Analizador SubC
// Sintaxis y Semántica de Lenguajes de Programación — UTN FRM
//
// Estructura espejada del proyecto ejemplo ssl-antlr-calculator de la cátedra.
// Los archivos SubCLexer.js, SubCParser.js, SubCListener.js y SubCVisitor.js
// son generados automáticamente por ANTLR a partir de SubC.g4.
// El único código propio está en src/CustomSubCVisitor.js y src/CustomSubCListener.js

import fs       from 'fs';
import readline from 'readline';

// ── Importaciones de archivos GENERADOS por ANTLR ────────────────────────────
import antlr4            from 'antlr4';
import SubCLexer         from './generated/SubCLexer.js';
import SubCParser        from './generated/SubCParser.js';

// ── Importaciones de código PROPIO ───────────────────────────────────────────
import CustomSubCVisitor  from './src/CustomSubCVisitor.js';
import CustomSubCListener from './src/CustomSubCListener.js';

const { CharStreams, CommonTokenStream, tree: { ParseTreeWalker } } = antlr4;

// ─── Colores ANSI ─────────────────────────────────────────────────────────────
const C = {
    reset:  '\x1b[0m',  bold:  '\x1b[1m',
    red:    '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', cyan:  '\x1b[36m',
};

function title(text) {
    const bar = '═'.repeat(text.length + 4);
    console.log(`\n${C.bold}${C.cyan}╔${bar}╗\n║  ${text}  ║\n╚${bar}╝${C.reset}\n`);
}
function section(text) {
    console.log(`\n${C.bold}${C.yellow}▶ ${text}${C.reset}`);
    console.log('─'.repeat(60));
}

// ─── Tabla de tokens ──────────────────────────────────────────────────────────
function imprimirTablaTokens(tokens, parser) {
    const header  = '┌─────────────────────────┬──────────────────────┬──────────┬──────┐';
    const divider = '├─────────────────────────┼──────────────────────┼──────────┼──────┤';
    const footer  = '└─────────────────────────┴──────────────────────┴──────────┴──────┘';
    const row = (lex, tok, lin, col) =>
        `│ ${String(lex).substring(0,23).padEnd(23)} │ ${String(tok).substring(0,20).padEnd(20)} │ ${String(lin).padEnd(8)} │ ${String(col).padEnd(4)} │`;

    console.log(header);
    console.log(row('LEXEMA', 'TOKEN', 'LÍNEA', 'COL'));
    console.log(divider);

    for (const tok of tokens) {
        if (tok.type === antlr4.Token.EOF) continue;
        const nombre = tok.type === -1 ? 'EOF'
            : (parser.symbolicNames[tok.type] ?? parser.literalNames[tok.type] ?? tok.type);
        console.log(row(tok.text, nombre, tok.line, tok.column));
    }
    console.log(footer);
}

// ─── Árbol de derivación en texto ────────────────────────────────────────────
function imprimirArbol(nodo, parser, prefijo = '', esUltimo = true) {
    const conector  = esUltimo ? '└── ' : '├── ';
    const childPfx  = esUltimo ? '    ' : '│   ';
    const esHoja    = !(nodo instanceof antlr4.ParserRuleContext);
    const etiqueta  = esHoja
        ? `${C.cyan}'${nodo.getText()}'${C.reset}`
        : `${C.yellow}${parser.ruleNames[nodo.ruleIndex]}${C.reset}`;

    console.log(`${prefijo}${conector}${etiqueta}`);

    if (!esHoja && nodo.children) {
        for (let i = 0; i < nodo.children.length; i++) {
            const ultimo = i === nodo.children.length - 1;
            imprimirArbol(nodo.children[i], parser, prefijo + childPfx, ultimo);
        }
    }
}

// ─── Lectura de entrada ───────────────────────────────────────────────────────
async function leerCadena() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        console.log(`${C.yellow}No se encontró input.txt. Ingrese el código (línea con solo "EOF" para terminar):${C.reset}`);
        const lines = [];
        rl.on('line', line => {
            if (line.trim() === 'EOF') { rl.close(); resolve(lines.join('\n')); }
            else lines.push(line);
        });
    });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    title('ANALIZADOR SubC — ANTLR4 + JavaScript');

    // 1. Leer fuente ────────────────────────────────────────────────────────
    let input;
    try {
        input = fs.readFileSync('input.txt', 'utf8');
        console.log(`${C.green}✓ Archivo input.txt cargado.${C.reset}`);
    } catch {
        input = await leerCadena();
    }

    console.log(`\n${C.bold}Código fuente:${C.reset}\n${input}`);

    // 2. Lexer ──────────────────────────────────────────────────────────────
    // (igual que en ssl-antlr-calculator)
    const inputStream  = CharStreams.fromString(input);
    const lexer        = new SubCLexer(inputStream);
    const tokenStream  = new CommonTokenStream(lexer);

    // Captura errores léxicos
    const lexerErrors = [];
    lexer.removeErrorListeners();
    lexer.addErrorListener({
        syntaxError(recognizer, offendingSymbol, line, col, msg) {
            lexerErrors.push({ line, col, msg });
        }
    });

    // 3. Parser ─────────────────────────────────────────────────────────────
    const parser = new SubCParser(tokenStream);

    const parserErrors = [];
    parser.removeErrorListeners();
    parser.addErrorListener({
        syntaxError(recognizer, offendingSymbol, line, col, msg) {
            parserErrors.push({ line, col, msg });
        }
    });

    // Construir el árbol (igual que ssl-antlr-calculator: parser.prog())
    const tree = parser.programa();

    // ── FASE 1: Análisis léxico ─────────────────────────────────────────────
    section('FASE 1 — Análisis Léxico');

    // Rellenar el buffer de tokens para poder mostrarlos
    tokenStream.fill();
    const tokens = tokenStream.tokens;

    if (lexerErrors.length > 0) {
        console.log(`${C.red}✗ ${lexerErrors.length} error(es) léxico(s):${C.reset}`);
        for (const e of lexerErrors)
            console.log(`  ${C.red}[Léxico] Línea ${e.line}, col ${e.col}: ${e.msg}${C.reset}`);
    } else {
        console.log(`${C.green}✓ Análisis léxico completado sin errores.${C.reset}`);
    }

    // ── Tabla de lexemas/tokens ─────────────────────────────────────────────
    section('TABLA DE LEXEMAS — TOKENS');
    imprimirTablaTokens(tokens, parser);

    // ── FASE 2: Análisis sintáctico ─────────────────────────────────────────
    section('FASE 2 — Análisis Sintáctico');

    if (parserErrors.length > 0) {
        console.log(`${C.red}✗ ${parserErrors.length} error(es) sintáctico(s):${C.reset}`);
        for (const e of parserErrors)
            console.log(`  ${C.red}[Sintáctico] Línea ${e.line}, col ${e.col}: ${e.msg}${C.reset}`);
    } else {
        console.log(`${C.green}✓ Análisis sintáctico completado sin errores. Entrada VÁLIDA.${C.reset}`);
    }

    // ── FASE 3: Árbol de análisis sintáctico ────────────────────────────────
    section('FASE 3 — Árbol de Análisis Sintáctico');

    // Formato compacto tipo ANTLR (igual que ssl-antlr-calculator)
    const cadena_tree = tree.toStringTree(parser.ruleNames);
    console.log(`${C.bold}Formato compacto (estilo ANTLR):${C.reset}`);
    console.log(cadena_tree);

    // Árbol visual en ASCII
    console.log(`\n${C.bold}Árbol visual:${C.reset}`);
    console.log(`${C.yellow}programa${C.reset}`);
    if (tree.children) {
        for (let i = 0; i < tree.children.length; i++) {
            imprimirArbol(tree.children[i], parser, '', i === tree.children.length - 1);
        }
    }

    // ── Listener (ilustrativo) ──────────────────────────────────────────────
    if (parserErrors.length === 0) {
        section('LISTENER (ilustrativo)');
        const listener = new CustomSubCListener();
        ParseTreeWalker.DEFAULT.walk(listener, tree);
    }

    // ── FASE 4: Traducción e interpretación ─────────────────────────────────
    if (parserErrors.length === 0 && lexerErrors.length === 0) {
        section('FASE 4 — Traducción a JavaScript e Interpretación');

        const visitor = new CustomSubCVisitor();
        const jsCode  = visitor.translate(tree);

        console.log(`${C.bold}Código JavaScript generado:${C.reset}`);
        console.log(`${C.cyan}${'─'.repeat(60)}${C.reset}`);
        console.log(jsCode);
        console.log(`${C.cyan}${'─'.repeat(60)}${C.reset}`);

        console.log(`\n${C.bold}Resultado de la ejecución:${C.reset}`);
        const salida = visitor.interpret(jsCode);
        if (salida.length === 0)
            console.log(`${C.yellow}(sin salida)${C.reset}`);
        else
            for (const l of salida) console.log(`  ${C.green}>> ${l}${C.reset}`);
    }

    // ── Resumen ─────────────────────────────────────────────────────────────
    section('RESUMEN');
    const totalErrores = lexerErrors.length + parserErrors.length;
    if (totalErrores === 0)
        console.log(`${C.green}${C.bold}✓ Entrada VÁLIDA. Sin errores.${C.reset}`);
    else
        console.log(`${C.red}${C.bold}✗ ${totalErrores} error(es) encontrado(s).${C.reset}`);
    console.log('');
}

main().catch(err => {
    console.error(`${C.red}Error fatal:${C.reset}`, err.message);
    process.exit(1);
});
