# BowlingPro

Aplicación móvil para aprender bowling, registrar partidas y seguir el progreso deportivo. La implementación vive en `mobile/`; los prototipos de `Vistas/` y los requisitos de `docs/` se conservan como referencia funcional y visual.

## Ejecutar

Requisitos: Node.js LTS y npm. Desde la raíz del repositorio:

```powershell
cd mobile
npm install
npm start
```

Escanea el QR con Expo Go para ejecutar la app en Android o iOS. iOS requiere macOS para compilar localmente. Para previsualizar en un navegador:

```powershell
npm run web
```

## Flujos incluidos

- **Jugador:** panel de progreso y estadísticas, academia por niveles, lecciones, evaluación de 5 preguntas con umbral de aprobación del 80%, glosario, ejercicios, clasificación de liga, notificaciones e historial.
- **Marcador:** partida de diez marcos, práctica o juego oficial, entrada táctil de pinos, cálculo de strike/spare, décimo marco, deshacer tiro y registro de resultados.
- **Entrenador:** roster del grupo asignado, búsqueda y filtros, planes semanales y registro de retroalimentación.
- **Administrador:** publicación de módulos, estado de cuentas y registro de auditoría.
- **Cuenta:** registro con validación de campos, selector de rol y bloqueo temporal local tras cinco intentos fallidos.

Los prototipos de la carpeta `Vistas/` no se modificaron. Los estilos y tipografías siguen la dirección visual documentada en `Vistas/athletic_precision/DESIGN.md`.

## Desarrollo

Desde `mobile/`:

```powershell
npm run lint
npx tsc --noEmit
npm test
npx expo install --check
```

El motor de puntuación está en `mobile/src/scoring.ts` y sus pruebas en `mobile/src/scoring.test.ts`.

## Alcance de esta entrega

La app funciona como MVP local de demostración. En el acceso, selecciona un rol y pulsa **Explorar en modo demo**; el perfil permite cambiar entre jugador, entrenador y administrador. El progreso y los datos de prueba se guardan en el dispositivo con AsyncStorage.

No hay backend todavía: el inicio de sesión y el registro no autentican cuentas reales; los jugadores, planes, notificaciones y eventos administrativos son datos de muestra. Para producción se necesita conectar autenticación, API/base de datos, permisos RBAC del lado servidor, almacenamiento multimedia y notificaciones push. El bloqueo de intentos en esta entrega se guarda localmente y no sustituye un control de seguridad en servidor.
