#### **README**

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



**DESCRIPCIÓN DEL PROYECTO**

&#x20;  Este proyecto consiste en un analizador que procesa un archivo de entrada input.txt con código fuente escrito en este sub-lenguaje de C, desarrollado utilizando ANTLR4 con JavaScript. El funcionamiento del programa consiste en:

&#x09;- Análisis léxico:

&#x20;  El analizador recibe el código fuente desde el archivo input.txt y lo procesa carácter por carácter para identificar los lexemas del lenguaje.Cada lexema es clasificado en un token específico definido en la gramática, como palabras reservadas (while, printf, break), operadores y símbolos. Como resultado, se genera una tabla de lexemas y tokens, que incluye además la línea y columna donde cada elemento fue encontrado.

&#x09;- Análisis sintáctico

&#x20;  El analizador verifica que la estructura del código respete la gramática definida. Luego, si el código es correcto, se construye un árbol de análisis sintáctico. En caso de errores, se indica la línea y causa del problema.

&#x09;- Construcción del árbol sintáctico

&#x20;  El árbol generado puede visualizarse en dos formatos: formato compacto tipo ANTLR y representación visual en forma jerárquica. Éste permite comprender cómo interpreta la estructura del programa y cómo se organizan sus componentes internos.

&#x09;- Traducción e interpretación

&#x20;  El analizador traduce el código a JavaScript. Una vez traducido, es ejecutado mediante un entorno controlado, simulando el comportamiento de un intérprete. Finalmente, se muestran los resultados.



**¿CÓMO INSTALAR EL PROYECTO?**

&#x20;  Para poder instalar este proyecto, se debe clonar el siguiente repositorio: git clone https://github.com/mlnecai49-beep/53325.git



!\[Imagen 1](images/1-IMAGEN.png)

&#x20;  Luego de eso, se debe colocar el siguiente comando: cd 53325/ProyectoAnalizador/CarArchivos

&#x20;  Una vez dentro, instalar dependencias: npm install

&#x20;  Para proceder a ejecutar programa: node index.js



!\[Imagen 2](images/2-IMAGEN.png)

!\[Imagen 3](images/3-IMAGEN.png)

!\[Imagen 4](images/4-IMAGEN.png)



**INSTRUCCIONES DE USO**

&#x20;  El programa utiliza el archivo input.txt. Así, uno se ubica desde la terminar y ejecuta con node index.js

&#x20;  Una vez ejecutado, el sistema realiza automáticamente:

* Análisis léxico del código
* Análisis sintáctico
* Construcción del árbol de derivación
* Traducción a JavaScript
* Ejecución del código interpretado

&#x20;  Así, muestra en consola:

* Tabla de lexemas y tokens
* Confirmación de si la entrada es válida o inválida
* Árbol sintáctico (formato texto)
* Código JavaScript generado
* Resultado de la ejecución

&#x20;  Para probar distintos casos, se puede editar el archivo input.txt

&#x20;  Se deben guardar los cambios y ejecutar.



&#x20;  Si se desea ver el proyecto en Visual Studio Code, desde la terminal se coloca comando: code .



***ejemplo\_valido\_2.txt***



!\[Imagen 5](images/5-IMAGEN.png)

!\[Imagen 6](images/6-IMAGEN.png)

!\[Imagen 7](images/7-IMAGEN.png)

!\[Imagen 8](images/8-IMAGEN.png)







