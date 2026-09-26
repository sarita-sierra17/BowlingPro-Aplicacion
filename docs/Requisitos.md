# Requisitos de BowlingPro

## 1. Introducción

BowlingPro es una aplicación móvil orientada al aprendizaje y entrenamiento de jugadores de bowling. La aplicación busca complementar la formación presencial mediante contenidos educativos, seguimiento del progreso, registro de partidas, estadísticas, planes de entrenamiento, retos y comunicación entre jugadores y entrenadores.

## 2. Objetivo

El objetivo de BowlingPro es proporcionar una herramienta que permita a los jugadores en formación aprender y mejorar sus habilidades de bowling, registrar su progreso y recibir orientación, mientras que los entrenadores pueden realizar seguimiento de sus jugadores y gestionar sus planes de entrenamiento.

## 3. Alcance

La aplicación contempla funcionalidades relacionadas con:

- Gestión de usuarios y autenticación.
- Perfiles de jugadores y entrenadores.
- Contenidos de aprendizaje sobre bowling.
- Registro y cálculo de partidas.
- Estadísticas y seguimiento del rendimiento.
- Planes y recomendaciones de entrenamiento.
- Retos, logros e insignias.
- Seguimiento de jugadores por parte del entrenador.
- Comunicación entre jugadores y entrenadores.
- Glosario y reglas del bowling.
- Notificaciones.
- Gestión administrativa del contenido.

## 4. Usuarios del sistema

### 4.1 Jugador en formación

El jugador utiliza la aplicación para aprender técnicas de bowling, consultar contenidos, registrar partidas, revisar estadísticas, realizar entrenamientos, participar en retos y recibir retroalimentación del entrenador.

### 4.2 Entrenador

El entrenador utiliza la aplicación para consultar el progreso de los jugadores asignados, gestionar sus planes de entrenamiento y registrar comentarios, observaciones y recomendaciones.

### 4.3 Administrador

El administrador gestiona el contenido de aprendizaje y las cuentas de los usuarios registrados de acuerdo con los permisos definidos por el sistema.

---

# 5. Requisitos funcionales

## 5.1 Gestión de usuarios y autenticación

### RF-01. Registro de usuarios
El sistema debe permitir registrar un nuevo usuario, ya sea jugador o entrenador, mediante correo electrónico y contraseña.

El sistema debe validar que:
- El correo electrónico sea único.
- La contraseña tenga mínimo 8 caracteres.
- La contraseña contenga al menos una letra.
- La contraseña contenga al menos un número.

### RF-02. Autenticación de usuarios
El sistema debe permitir autenticar a los usuarios mediante correo electrónico y contraseña.

### RF-03. Bloqueo por intentos fallidos
El sistema debe bloquear temporalmente el acceso durante 15 minutos después de 5 intentos de inicio de sesión fallidos consecutivos.

### RF-04. Navegación según el rol
El sistema debe mostrar un menú de navegación y funcionalidades diferentes de acuerdo con el rol del usuario autenticado.

### RF-05. Perfil del jugador
El sistema debe proporcionar un perfil donde el jugador pueda consultar:
- Nivel actual.
- Progreso.
- Historial de partidas.
- Estadísticas.

### RF-06. Nivel actual del jugador
El sistema debe mostrar el nivel actual del jugador (principiante, intermedio o avanzado), calculado de acuerdo con las lecciones y evaluaciones aprobadas.

### RF-07. Historial de partidas
El sistema debe mostrar el historial de partidas del jugador, incluyendo:
- Fecha.
- Puntaje total.
- Modo de partida: práctica o juego.

---

## 5.2 Aprendizaje

### RF-08. Contenidos organizados por nivel
El sistema debe ofrecer contenidos de aprendizaje organizados de acuerdo con el nivel de conocimiento y experiencia del jugador.

### RF-09. Módulos de aprendizaje
El sistema debe proporcionar módulos de aprendizaje que incluyan contenidos teóricos y prácticos de bowling.

### RF-10. Recursos de aprendizaje
Los módulos de aprendizaje deben proporcionar recursos como:
- Videos.
- Ilustraciones.
- Explicaciones paso a paso.
- Evaluaciones.

---

## 5.3 Partidas y estadísticas

### RF-11. Registro de resultados
El sistema debe permitir registrar los resultados de las partidas, incluyendo los lanzamientos y puntajes obtenidos en cada frame.

### RF-12. Cálculo automático del puntaje
El sistema debe calcular automáticamente el puntaje de las partidas de acuerdo con las reglas de puntuación del bowling.

### RF-13. Estadísticas del jugador
El sistema debe generar estadísticas a partir de los resultados obtenidos por el jugador en sus partidas.

### RF-14. Evolución del rendimiento
El sistema debe permitir visualizar la evolución del rendimiento del jugador mediante gráficas e indicadores.

---

## 5.4 Entrenamiento personalizado

### RF-15. Planes de entrenamiento
El sistema debe proporcionar planes de entrenamiento acordes con el nivel y las necesidades del jugador.

### RF-16. Registro de ejercicios completados
El sistema debe registrar los ejercicios y actividades completados por el jugador para realizar seguimiento de su progreso.

### RF-17. Recomendaciones de entrenamiento
El sistema debe proporcionar recomendaciones de entrenamiento basadas en el rendimiento y las estadísticas del jugador.

### RF-18. Gestión de planes por el entrenador
El sistema debe permitir al entrenador consultar y modificar los planes de entrenamiento de los jugadores asignados.

---

## 5.5 Retos y logros

### RF-19. Retos y objetivos
El sistema debe incluir retos y objetivos que motiven al jugador durante su proceso de aprendizaje.

### RF-20. Sistema de insignias
El sistema debe reconocer los logros alcanzados por los jugadores mediante un sistema de insignias.

### RF-21. Tabla de clasificación
El sistema debe permitir consultar una tabla de clasificación entre jugadores pertenecientes a una misma liga o grupo.

---

## 5.6 Seguimiento y comunicación con el entrenador

### RF-22. Consulta del progreso de jugadores
El sistema debe permitir al entrenador consultar el progreso, estadísticas e historial de los jugadores asignados.

### RF-23. Retroalimentación del entrenador
El sistema debe permitir al entrenador registrar comentarios, observaciones y recomendaciones sobre el desempeño de los jugadores.

### RF-24. Comunicación jugador-entrenador
El sistema debe proporcionar un medio de comunicación entre jugadores y entrenadores.

---

## 5.7 Información y notificaciones

### RF-25. Glosario de bowling
El sistema debe incluir un glosario de términos relacionados con el bowling.

### RF-26. Reglas del bowling
El sistema debe proporcionar información sobre las principales reglas y normas del bowling.

### RF-27. Notificaciones
El sistema debe enviar notificaciones relacionadas con:
- Entrenamientos.
- Actividades pendientes.
- Logros.
- Retroalimentación.
- Recomendaciones.

### RF-28. Gestión de cuentas
El sistema debe permitir gestionar las cuentas de jugadores y entrenadores ya registrados.

---

# 6. Trazabilidad

Los requisitos funcionales serán relacionados posteriormente con las historias de usuario, épicas, casos de uso, prototipos y pruebas del sistema.

Esta trazabilidad permitirá comp
