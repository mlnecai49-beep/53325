// CustomSubCListener.js
// Extiende SubCListener (generado automáticamente por ANTLR en generated/)
// Se incluye con fines ilustrativos, tal como en el proyecto de ejemplo de la cátedra.
// La lógica principal del traductor está en CustomSubCVisitor.js

import SubCListener from '../generated/SubCListener.js';

export default class CustomSubCListener extends SubCListener {

    enterPrograma(ctx) {
        console.log('[Listener] Entrando a: programa');
    }
    exitPrograma(ctx) {
        console.log('[Listener] Saliendo de: programa');
    }

    enterBucle(ctx) {
        console.log('[Listener] Entrando a: bucle (while)');
    }
    exitBucle(ctx) {
        console.log('[Listener] Saliendo de: bucle (while)');
    }

    enterSalida(ctx) {
        console.log(`[Listener] Entrando a: salida → printf${ctx.cadena().getText()}`);
    }

    enterTerminar(ctx) {
        console.log('[Listener] Entrando a: terminar → break');
    }
}
