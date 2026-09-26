# Reglas de Negocio de BowlingPro

Las reglas de negocio establecen las condiciones que debe cumplir el sistema para garantizar que las funcionalidades de BowlingPro funcionen de acuerdo con las reglas definidas para el proceso de aprendizaje, entrenamiento y seguimiento de los jugadores.

## RN-01. Avance de nivel por calificación mínima

Un jugador podrá avanzar al siguiente nivel de aprendizaje únicamente cuando haya completado las lecciones y evaluaciones correspondientes al nivel actual y haya obtenido la calificación mínima establecida.

Los niveles contemplados son:

- Principiante.
- Intermedio.
- Avanzado.

## RN-02. Cálculo oficial del puntaje

El sistema debe calcular automáticamente el puntaje de una partida de acuerdo con las reglas oficiales de puntuación del bowling.

El cálculo debe considerar los lanzamientos realizados y las bonificaciones correspondientes a strikes y spares.

## RN-03. Restricción de acceso a lecciones avanzadas

El jugador no podrá acceder a las lecciones de un nivel superior mientras no haya completado los requisitos establecidos para el nivel anterior.

Por lo tanto, el contenido debe mantenerse bloqueado hasta que el jugador cumpla las condiciones de avance.

## RN-04. Validación de retos contra el historial

Los retos y objetivos que dependan de resultados de partidas deberán ser validados utilizando la información registrada en el historial de partidas del jugador.

El sistema no deberá considerar como completado un reto si la condición requerida no se encuentra respaldada por los resultados registrados.

## RN-05. Acceso del entrenador a jugadores asignados

El entrenador únicamente podrá consultar el progreso, estadísticas, historial y demás información de los jugadores que se encuentren asignados a su grupo.

El entrenador no podrá acceder a la información de jugadores que no pertenezcan a su grupo asignado.

## RN-06. Gestión de contenido por el administrador

Únicamente el administrador podrá crear, modificar o eliminar el contenido de aprendizaje de la aplicación.

Esto incluye los módulos, lecciones y demás contenidos educativos administrados por el sistema.
