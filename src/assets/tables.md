# Especificación de Esquema de Base de Datos - Backend Mink@rt (Supabase / PostgreSQL)

Este documento detalla la estructura relacional de las tablas y el almacenamiento de objetos (Storage) implementados en el backend de Supabase para la plataforma de crowdfunding cultural **Mink@rt** (Canchita Producciones).

---

## 1. Diagrama de Relaciones y Entidades

* **`profiles`**: Almacena los datos del perfil de usuario y rol (Mecenas vs. Creador), vinculado directamente a `auth.users`.
* **`projects`**: Registra la información técnica, meta financiera, imagen de portada, sinopsis y reporte de auditoría (*MinkaGuard AI*).
* **`reward_tiers`**: Define los niveles de recompensa configurados por los creadores para incentivar el financiamiento de sus campañas.
* **`project_updates`**: Registra la bitácora y noticias de producción/hitos publicados por los creadores para mantener informados a los mecenas.
* **`contributions`**: Almacena las transacciones y aportes realizados por los mecenas hacia las campañas activas.
* **`Storage: project-banners`**: Bucket público para almacenar las imágenes de portada/banner de los proyectos culturales.

---

## 2. Descripción Detallada de Tablas

### 2.1. Tabla: `profiles`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users` | Identificador único del usuario (sincronizado con Auth). |
| `full_name` | `TEXT` | `NOT NULL` | Nombre completo del usuario registrado. |
| `role` | `TEXT` | `DEFAULT 'mecenas'`, `CHECK (role IN ('creator', 'mecenas'))` | Rol de usuario dentro del sistema. |
| `avatar_url` | `TEXT` | Opcional | URL de la imagen de perfil. |
| `bio` | `TEXT` | Opcional | Biografía o presentación del usuario/creador. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Fecha y hora de la última actualización del registro. |

---

### 2.2. Tabla: `projects`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único del proyecto. |
| `creator_id` | `UUID` | `NOT NULL`, `REFERENCES profiles(id)` | Identificador del creador propietario del proyecto. |
| `title` | `TEXT` | `NOT NULL` | Título de la obra o proyecto artístico. |
| `category` | `TEXT` | `NOT NULL` | Disciplina (Cine, Teatro, Cómic, Webseries, Animación). |
| `synopsis` | `TEXT` | Opcional | Resumen, propuesta o argumento de la obra. |
| `image_url` | `TEXT` | Opcional | URL pública de la imagen de portada/banner del proyecto. |
| `funding_goal` | `NUMERIC` | `NOT NULL`, `CHECK (funding_goal > 0)` | Meta total de recaudación en Moneda Local (S/). |
| `current_amount`| `NUMERIC` | `DEFAULT 0` | Monto acumulado en tiempo real por los aportes. |
| `risk_score` | `INTEGER` | `DEFAULT 0` | Porcentaje de viabilidad (0-100%) calculado por la IA. |
| `ai_analysis_report`| `JSONB` | Opcional | Desglose y observaciones del análisis de viabilidad (JSON). |
| `status` | `TEXT` | `DEFAULT 'draft'`, `CHECK (status IN ('draft', 'active', 'funded'))` | Estado del proyecto. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Fecha de creación del registro. |

---

### 2.3. Tabla: `reward_tiers`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único del nivel de recompensa. |
| `project_id` | `UUID` | `NOT NULL`, `REFERENCES projects(id) ON DELETE CASCADE` | Proyecto al cual pertenece la recompensa. |
| `title` | `TEXT` | `NOT NULL` | Título o nombre del tier (Ej. "Mecenas Co-creador"). |
| `minimum_amount`| `NUMERIC` | `NOT NULL`, `CHECK (minimum_amount > 0)` | Monto mínimo requerido para acceder al beneficio. |
| `description` | `TEXT` | Opcional | Detalle de los beneficios o entregables del nivel. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Fecha de creación del nivel de recompensa. |

---

### 2.4. Tabla: `project_updates` (Bitácora de Avances de Producción)
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único del avance. |
| `project_id` | `UUID` | `NOT NULL`, `REFERENCES projects(id) ON DELETE CASCADE` | Proyecto asociado a la actualización. |
| `title` | `TEXT` | `NOT NULL` | Título del hito o avance (Ej. "¡Primer día de rodaje!"). |
| `content` | `TEXT` | `NOT NULL` | Cuerpo del mensaje o noticia para los mecenas. |
| `media_url` | `TEXT` | Opcional | Enlace a fotografía o video del avance. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Fecha de publicación del avance. |

---

### 2.5. Tabla: `contributions`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único de la transacción. |
| `project_id` | `UUID` | `NOT NULL`, `REFERENCES projects(id) ON DELETE CASCADE` | Proyecto que recibe la contribución. |
| `user_id` | `UUID` | `REFERENCES profiles(id)` | Mecenas que realiza el aporte económico. |
| `reward_tier_id`| `UUID` | `REFERENCES reward_tiers(id)` | Nivel de recompensa seleccionado. |
| `amount` | `NUMERIC` | `NOT NULL`, `CHECK (amount > 0)` | Importe total aportado en Soles (S/). |
| `status` | `TEXT` | `DEFAULT 'completed'`, `CHECK (status IN ('pending', 'completed', 'failed'))` | Estado de la transacción. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Fecha y hora del registro del pago. |

---

## 3. Almacenamiento de Archivos (Supabase Storage)

### Bucket: `project-banners`
* **Tipo:** Público (`public: true`).
* **Uso:** Almacena los archivos binarios de imágenes (JPG, PNG, WEBP) subidos por los creadores para sus proyectos.
* **Estructura de rutas:** `banners/{nombre_archivo}`.

---

## 4. Script SQL Completo para Supabase (Tablas, RLS y Storage)

```sql
-- 1. Tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'mecenas' CHECK (role IN ('creator', 'mecenas')),
  avatar_url TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  synopsis TEXT,
  image_url TEXT,
  funding_goal NUMERIC NOT NULL CHECK (funding_goal > 0),
  current_amount NUMERIC DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  ai_analysis_report JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','funded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla reward_tiers
CREATE TABLE IF NOT EXISTS public.reward_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  minimum_amount NUMERIC NOT NULL CHECK (minimum_amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla project_updates
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla contributions
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  reward_tier_id UUID REFERENCES public.reward_tiers(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Lectura publica profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Lectura publica projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Lectura publica reward_tiers" ON public.reward_tiers FOR SELECT USING (true);
CREATE POLICY "Lectura publica project_updates" ON public.project_updates FOR SELECT USING (true);
CREATE POLICY "Lectura publica contributions" ON public.contributions FOR SELECT USING (true);

-- Políticas de gestión
CREATE POLICY "Usuario edita su perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuario crea su perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Creador gestiona proyectos" ON public.projects FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Creador gestiona reward_tiers" ON public.reward_tiers FOR ALL USING (
  auth.uid() = (SELECT creator_id FROM public.projects WHERE id = project_id)
);
CREATE POLICY "Creador gestiona project_updates" ON public.project_updates FOR ALL USING (
  auth.uid() = (SELECT creator_id FROM public.projects WHERE id = project_id)
);
CREATE POLICY "Mecenas inserta contribuciones" ON public.contributions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Configuración de Storage para el bucket project-banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-banners', 'project-banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lectura publica de imagenes" ON storage.objects 
FOR SELECT USING (bucket_id = 'project-banners');

CREATE POLICY "Usuarios autenticados suben imagenes" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'project-banners' AND auth.role() = 'authenticated');
```