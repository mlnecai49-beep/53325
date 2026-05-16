// Lexer manual para SubC - compatible con la gramática SubC.g4
// Tokeniza la entrada sin requerir ANTLR JAR (para entornos sin Java)

export const TOKEN_TYPES = {
    WHILE:           'WHILE',
    PRINTF:          'PRINTF',
    BREAK:           'BREAK',
    CERO:            'CERO',
    UNO:             'UNO',
    LPAREN:          'LPAREN',
    RPAREN:          'RPAREN',
    LBRACE:          'LBRACE',
    RBRACE:          'RBRACE',
    SEMI:            'SEMI',
    CADENA_LITERAL:  'CADENA_LITERAL',
    EOF:             'EOF',
    UNKNOWN:         'UNKNOWN',
};

export class Token {
    constructor(type, lexeme, line, col) {
        this.type   = type;
        this.lexeme = lexeme;
        this.line   = line;
        this.col    = col;
    }
    toString() {
        return `<${this.type}, "${this.lexeme}", línea ${this.line}, col ${this.col}>`;
    }
}

export class LexerError extends Error {
    constructor(message, line, col) {
        super(message);
        this.line = line;
        this.col  = col;
    }
}

export class SubCLexer {
    constructor(input) {
        this.input  = input;
        this.pos    = 0;
        this.line   = 1;
        this.col    = 1;
        this.errors = [];
        this.tokens = [];
    }

    tokenize() {
        while (this.pos < this.input.length) {
            this._skipWhitespace();
            if (this.pos >= this.input.length) break;

            const ch = this.input[this.pos];

            // Comentario de línea
            if (ch === '/' && this._peek(1) === '/') {
                while (this.pos < this.input.length && this.input[this.pos] !== '\n') this._advance();
                continue;
            }

            // Cadena literal
            if (ch === '"') {
                this._readString();
                continue;
            }

            // Símbolos de un carácter
            const single = this._trySingle(ch);
            if (single) {
                this.tokens.push(new Token(single, ch, this.line, this.col));
                this._advance();
                continue;
            }

            // Identificadores / palabras clave / dígitos especiales
            if (this._isLetter(ch)) {
                this._readKeywordOrId();
                continue;
            }

            // Dígitos (0 y 1 como condición, el resto son ilegales en este sublenguaje)
            if (ch === '0') {
                this.tokens.push(new Token(TOKEN_TYPES.CERO, '0', this.line, this.col));
                this._advance();
                continue;
            }
            if (ch === '1') {
                this.tokens.push(new Token(TOKEN_TYPES.UNO, '1', this.line, this.col));
                this._advance();
                continue;
            }

            // Carácter desconocido
            const err = new LexerError(`Carácter inesperado '${ch}'`, this.line, this.col);
            this.errors.push(err);
            this._advance();
        }

        this.tokens.push(new Token(TOKEN_TYPES.EOF, '', this.line, this.col));
        return this.tokens;
    }

    _readString() {
        const startLine = this.line;
        const startCol  = this.col;
        let lexeme = '"';
        this._advance(); // consume opening "

        while (this.pos < this.input.length) {
            const c = this.input[this.pos];
            if (c === '"') {
                lexeme += '"';
                this._advance();
                this.tokens.push(new Token(TOKEN_TYPES.CADENA_LITERAL, lexeme, startLine, startCol));
                return;
            }
            if (c === '\n') {
                // cadena sin cerrar
                break;
            }
            lexeme += c;
            this._advance();
        }

        const err = new LexerError('Cadena no cerrada', startLine, startCol);
        this.errors.push(err);
    }

    _readKeywordOrId() {
        let word = '';
        const startLine = this.line;
        const startCol  = this.col;
        while (this.pos < this.input.length && (this._isLetter(this.input[this.pos]) || this._isDigit(this.input[this.pos]) || this.input[this.pos] === '_')) {
            word += this.input[this.pos];
            this._advance();
        }
        const keywords = {
            'while':  TOKEN_TYPES.WHILE,
            'printf': TOKEN_TYPES.PRINTF,
            'break':  TOKEN_TYPES.BREAK,
        };
        const type = keywords[word] ?? TOKEN_TYPES.UNKNOWN;
        if (type === TOKEN_TYPES.UNKNOWN) {
            const err = new LexerError(`Token no reconocido: '${word}'`, startLine, startCol);
            this.errors.push(err);
        }
        this.tokens.push(new Token(type, word, startLine, startCol));
    }

    _trySingle(ch) {
        const map = {
            '(': TOKEN_TYPES.LPAREN,
            ')': TOKEN_TYPES.RPAREN,
            '{': TOKEN_TYPES.LBRACE,
            '}': TOKEN_TYPES.RBRACE,
            ';': TOKEN_TYPES.SEMI,
        };
        return map[ch] ?? null;
    }

    _skipWhitespace() {
        while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
            this._advance();
        }
    }

    _isLetter(c) { return /[a-zA-Z_]/.test(c); }
    _isDigit(c)  { return /[0-9]/.test(c); }

    _peek(offset = 1) {
        return this.pos + offset < this.input.length ? this.input[this.pos + offset] : null;
    }

    _advance() {
        if (this.input[this.pos] === '\n') {
            this.line++;
            this.col = 1;
        } else {
            this.col++;
        }
        this.pos++;
    }
}
