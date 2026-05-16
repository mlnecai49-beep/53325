// CustomSubCVisitor.js
// Responsabilidades:
//   1. Recorre el árbol de análisis sintáctico generado por ANTLR
//   2. Traduce el código SubC a JavaScript equivalente
//   3. Ejecuta el JavaScript generado (interpretación básica)

import SubCVisitor from '../generated/SubCVisitor.js';

export default class CustomSubCVisitor extends SubCVisitor {

    constructor() {
        super();
        this._jsLines = []; // líneas de JS acumuladas durante la visita
    }

    // ── programa : instrucciones EOF ────────────────────────────────────────
    visitPrograma(ctx) {
        return this.visit(ctx.instrucciones());
    }

    // ── instrucciones : instruccion | instrucciones instruccion ─────────────
    visitInstrucciones(ctx) {
    const instrucciones = ctx.instruccion();

    return (Array.isArray(instrucciones)
        ? instrucciones
        : [instrucciones]
    )
    .map(i => this.visit(i))
    .join('\n');
    }

    // ── instruccion : bucle ─────────────────────────────────────────────────
    visitInstruccion(ctx) {
        return this.visit(ctx.bucle());
    }

    // ── bucle : 'while' '(' condicion ')' '{' sentencia '}' ─────────────────
    visitBucle(ctx) {
        const cond   = this.visit(ctx.condicion());
        const cuerpo = this.visit(ctx.sentencia());
        return `while (${cond}) {\n${this._indent(cuerpo)}\n}`;
    }

    // ── condicion : '0' | '1' ───────────────────────────────────────────────
    visitCondCero(ctx) { return '0'; }
    visitCondUno(ctx)  { return '1'; }

    // ── sentencia (alternativas etiquetadas) ────────────────────────────────

    // sentencia : salida  (#sentSalida)
    visitSentSalida(ctx) {
        return this.visit(ctx.salida());
    }

    // sentencia : terminar  (#sentTerminar)
    visitSentTerminar(ctx) {
        return this.visit(ctx.terminar());
    }

    // sentencia : salida sentencia  (#sentSalidaRec)
    visitSentSalidaRec(ctx) {
        const s = this.visit(ctx.salida());
        const r = this.visit(ctx.sentencia());
        return `${s}\n${r}`;
    }

    // ── salida : 'printf' '(' cadena ')' ';' ────────────────────────────────
    visitSalida(ctx) {
        const cadena = this.visit(ctx.cadena());
        return `console.log(${cadena});`;
    }

    // ── terminar : 'break' ';' ───────────────────────────────────────────────
    visitTerminar(ctx) {
        return 'break;';
    }

    // ── cadena : CADENA_LITERAL ──────────────────────────────────────────────
    visitCadena(ctx) {
        // El token ya incluye las comillas dobles, p.ej. "Hola, mundo!"
        return ctx.CADENA_LITERAL().getText();
    }

    // ── Traducción completa ──────────────────────────────────────────────────

    /**
     * Punto de entrada: visita el árbol y devuelve el JS generado.
     * @param {ParserRuleContext} tree - raíz del árbol (resultado de parser.programa())
     * @returns {string} código JavaScript equivalente
     */
    translate(tree) {
        const js = this.visit(tree);
        this._jsLines = js ? js.split('\n') : [];
        return js ?? '';
    }

    // ── Interpretación ───────────────────────────────────────────────────────

    /**
     * Ejecuta el código JS generado en un sandbox básico y devuelve las líneas
     * de salida que habría producido console.log.
     * @param {string} jsCode
     * @returns {string[]} líneas de salida
     */
    interpret(jsCode) {
        const logs = [];

        // Detección de bucle infinito: while(1) sin break
        const tieneBreak = /\bbreak\b/.test(jsCode);
        const esInfinito = /while\s*\(\s*1\s*\)/.test(jsCode) && !tieneBreak;
        if (esInfinito) {
            logs.push('[Advertencia]: Bucle infinito detectado (while(1) sin break). Ejecución omitida.');
            return logs;
        }

        // Sandbox: reemplaza console por capturador propio
        try {
            const captura = { log: (...args) => logs.push(args.join(' ')) };
            // eslint-disable-next-line no-new-func
            const fn = new Function('console', jsCode);
            fn(captura);
        } catch (e) {
            logs.push(`[Error de ejecución]: ${e.message}`);
        }

        return logs;
    }

    // ── Utilidades ───────────────────────────────────────────────────────────

    _indent(code, spaces = 4) {
        return code.split('\n').map(l => ' '.repeat(spaces) + l).join('\n');
    }
}
