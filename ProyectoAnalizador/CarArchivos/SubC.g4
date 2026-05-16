grammar SubC;

// ═══════════════════════════════════════════════════════════
//  REGLAS SINTÁCTICAS
// ═══════════════════════════════════════════════════════════

programa
    : instrucciones EOF
    ;

instrucciones
    : instruccion
    | instrucciones instruccion
    ;

instruccion
    : bucle
    ;

bucle
    : WHILE LPAREN condicion RPAREN LBRACE sentencia RBRACE
    ;

sentencia
    : salida                    #sentSalida
    | terminar                  #sentTerminar
    | salida sentencia          #sentSalidaRec
    ;

salida
    : PRINTF LPAREN cadena RPAREN SEMI
    ;

terminar
    : BREAK SEMI
    ;

condicion
    : CERO   #condCero
    | UNO    #condUno
    ;

cadena
    : CADENA_LITERAL
    ;

// ═══════════════════════════════════════════════════════════
//  REGLAS LÉXICAS
// ═══════════════════════════════════════════════════════════

// Palabras clave
WHILE   : 'while'  ;
PRINTF  : 'printf' ;
BREAK   : 'break'  ;

// Condiciones permitidas
CERO : '0' ;
UNO  : '1' ;

// Delimitadores
LPAREN : '(' ;
RPAREN : ')' ;
LBRACE : '{' ;
RBRACE : '}' ;
SEMI   : ';' ;

// Cadena literal entre comillas dobles
CADENA_LITERAL
    : '"' CARACTER* '"'
    ;

fragment CARACTER
    : LETRA
    | DIGITO
    | SIMBOLO
    | ' '
    ;

fragment LETRA   : [a-zA-Z] ;
fragment DIGITO  : [0-9] ;
fragment SIMBOLO : [.,!?:;'] ;

// Ignorados
WS           : [ \t\r\n]+ -> skip ;
LINE_COMMENT : '//' ~[\r\n]* -> skip ;
