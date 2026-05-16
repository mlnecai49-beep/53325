// Parser manual para SubC - construye el árbol de análisis sintáctico concreto
// Implementa la gramática definida en SubC.g4

import { TOKEN_TYPES } from './SubCLexer.js';

// ─── Nodos del árbol ────────────────────────────────────────────────────────

export class ParseNode {
    constructor(label, token = null) {
        this.label    = label;   // nombre de la regla o lexema
        this.token    = token;   // Token (solo en hojas)
        this.children = [];
    }
    addChild(node) { this.children.push(node); return this; }

    // Representación en texto estructurado (tipo ANTLR)
    toStringTree(indent = 0) {
        const pad = '  '.repeat(indent);
        if (this.children.length === 0) {
            return `${pad}${this.label}`;
        }
        const childStr = this.children.map(c => c.toStringTree(indent + 1)).join('\n');
        return `${pad}(${this.label}\n${childStr}\n${pad})`;
    }

    // Representación compacta tipo ANTLR "(rule child1 child2)"
    toANTLRString() {
        if (this.children.length === 0) return this.label;
        return `(${this.label} ${this.children.map(c => c.toANTLRString()).join(' ')})`;
    }
}

export class ParseError extends Error {
    constructor(message, line, col) {
        super(message);
        this.line = line;
        this.col  = col;
    }
}

// ─── Parser ────────────────────────────────────────────────────────────────

export class SubCParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos    = 0;
        this.errors = [];
    }

    // Token actual
    get current() { return this.tokens[this.pos]; }

    // Mira sin consumir
    peek(offset = 0) { return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]; }

    // Consume y devuelve token actual; lanza error si no coincide el tipo
    consume(expectedType) {
        const tok = this.current;
        if (tok.type !== expectedType) {
            const err = new ParseError(
                `Se esperaba '${expectedType}' pero se encontró '${tok.lexeme || tok.type}' (${tok.type})`,
                tok.line, tok.col
            );
            this.errors.push(err);
            throw err;
        }
        this.pos++;
        return tok;
    }

    // Hoja del árbol
    leaf(tok) { return new ParseNode(`'${tok.lexeme}'`, tok); }

    // ── Reglas gramaticales ────────────────────────────────────────────────

    parse() {
        try {
            const node = this.parsePrograma();
            return node;
        } catch (e) {
            // El error ya fue registrado; devolvemos lo que se haya podido parsear
            return null;
        }
    }

    // programa : instrucciones EOF
    parsePrograma() {
        const node = new ParseNode('programa');
        node.addChild(this.parseInstrucciones());
        const eof = this.consume(TOKEN_TYPES.EOF);
        node.addChild(this.leaf(eof));
        return node;
    }

    // instrucciones : instruccion | instrucciones instruccion
    parseInstrucciones() {
        const node = new ParseNode('instrucciones');
        node.addChild(this.parseInstruccion());
        // mientras haya más instrucciones (siguiente token es WHILE)
        while (this.current.type === TOKEN_TYPES.WHILE) {
            node.addChild(this.parseInstruccion());
        }
        return node;
    }

    // instruccion : bucle
    parseInstruccion() {
        const node = new ParseNode('instruccion');
        node.addChild(this.parseBucle());
        return node;
    }

    // bucle : 'while' '(' condicion ')' '{' sentencia '}'
    parseBucle() {
        const node = new ParseNode('bucle');
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.WHILE)));
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.LPAREN)));
        node.addChild(this.parseCondicion());
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.RPAREN)));
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.LBRACE)));
        node.addChild(this.parseSentencia());
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.RBRACE)));
        return node;
    }

    // sentencia : salida | terminar | salida sentencia
    parseSentencia() {
        const node = new ParseNode('sentencia');
        if (this.current.type === TOKEN_TYPES.BREAK) {
            node.addChild(this.parseTerminar());
        } else if (this.current.type === TOKEN_TYPES.PRINTF) {
            node.addChild(this.parseSalida());
            // si hay más sentencias...
            if (this.current.type === TOKEN_TYPES.PRINTF || this.current.type === TOKEN_TYPES.BREAK) {
                node.addChild(this.parseSentencia());
            }
        } else {
            const tok = this.current;
            const err = new ParseError(
                `Se esperaba 'printf' o 'break' pero se encontró '${tok.lexeme || tok.type}'`,
                tok.line, tok.col
            );
            this.errors.push(err);
            throw err;
        }
        return node;
    }

    // salida : 'printf' '(' cadena ')' ';'
    parseSalida() {
        const node = new ParseNode('salida');
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.PRINTF)));
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.LPAREN)));
        node.addChild(this.parseCadena());
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.RPAREN)));
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.SEMI)));
        return node;
    }

    // terminar : 'break' ';'
    parseTerminar() {
        const node = new ParseNode('terminar');
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.BREAK)));
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.SEMI)));
        return node;
    }

    // condicion : '0' | '1'
    parseCondicion() {
        const node = new ParseNode('condicion');
        if (this.current.type === TOKEN_TYPES.CERO) {
            node.addChild(this.leaf(this.consume(TOKEN_TYPES.CERO)));
        } else if (this.current.type === TOKEN_TYPES.UNO) {
            node.addChild(this.leaf(this.consume(TOKEN_TYPES.UNO)));
        } else {
            const tok = this.current;
            const err = new ParseError(
                `Condición inválida: se esperaba '0' o '1' pero se encontró '${tok.lexeme}'`,
                tok.line, tok.col
            );
            this.errors.push(err);
            throw err;
        }
        return node;
    }

    // cadena : CADENA_LITERAL
    parseCadena() {
        const node = new ParseNode('cadena');
        node.addChild(this.leaf(this.consume(TOKEN_TYPES.CADENA_LITERAL)));
        return node;
    }
}
