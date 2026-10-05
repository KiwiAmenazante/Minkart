-- ==========================================
-- MINKA: Script de Limpieza Completa (Reset)
-- ==========================================
-- Ejecuta este script en el Editor SQL de tu panel de Supabase
-- para borrar todo rastro de persistencia (tablas, usuarios y storage).

-- 1. Vaciar todas las tablas de datos de la aplicación
TRUNCATE public.contributions, public.project_updates, public.reward_tiers, public.projects, public.profiles CASCADE;

-- 2. Eliminar todas las cuentas de usuario (incluyendo correos y accesos con Google OAuth)
DELETE FROM auth.users;

-- 3. Vaciar todos los archivos subidos a Supabase Storage
SET session_replication_role = 'replica';
DELETE FROM storage.objects;
SET session_replication_role = 'origin';

-- Confirmación
SELECT 'Base de datos y almacenamiento de Minka limpiados con éxito.' as resultado;
