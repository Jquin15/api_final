## 💾 Plan de Respaldos (Backup & Disaster Recovery)

### 1. Información a Respaldar
* **Base de Datos PostgreSQL:** Copia completa (*dump*) de los esquemas, tablas de usuarios, relaciones y datos almacenados.
* **Configuraciones y Variables de Entorno:** Archivos de configuración (`.env`) guardados de forma cifrada en un gestor de secretos seguro (ej. Bitwarden/1Password).

### 2. Frecuencia de Respaldos
* **Respaldos Automáticos:** Diarios a las 02:00 UTC (ejecutados en horas de bajo tráfico).
* **Respaldos Manuales:** Obligatorios antes de realizar despliegues mayores, migraciones de esquema con Prisma o cambios estructurales en la base de datos.
* **Retención:** Se mantendrán los respaldos diarios durante 30 días y los semanales por 3 meses.

### 3. Lugar de Almacenamiento
* **Almacenamiento Principal:** Render PostgreSQL Backups (almacenamiento automatizado en el proveedor).
* **Almacenamiento Secundario (Off-site):** Copia descargada en un bucket cifrado de Amazon S3 / Google Cloud Storage fuera del entorno de producción.

### 4. Procedimiento de Recuperación ante Fallos (Disaster Recovery)

En caso de pérdida de datos o corrupción de la base de datos, seguir el siguiente protocolo:

1. **Notificación e Aislamiento:**
    * Cambiar temporalmente la API a modo de mantenimiento o pausar el Web Service en Render para evitar escrituras inconsistentes.

2. **Obtención del Último Backup Válido:**
    * Identificar la última copia de seguridad consistente (`.dump` o `.sql`).

3. **Restauración de la Base de Datos:**
    * Conectarse a la instancia mediante `pg_restore` o la consola PostgreSQL con la cadena de conexión de producción:
      ```bash
      pg_restore --clean --no-acl --no-owner -h <HOST> -U <USER> -d <DATABASE_NAME> backup_file.dump
      ```
    * O en su defecto, ejecutar la migración desde cero con Prisma y poblar los datos:
      ```bash
      pnpm db:deploy
      ```

4. **Verificación e Infección:**
    * Probar el endpoint `/health` y realizar consultas de verificación en los endpoints `/users` y `/auth` para validar integridad.
    * Reanudar el Web Service de Render.