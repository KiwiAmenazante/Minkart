import React, { useState } from 'react'
import { Info, Code, CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export const SupabaseConfigBanner = ({ isConfigured }) => {
  const [showSql, setShowSql] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isSupabaseConfigured || isConfigured) return null

  const sqlSchema = `-- SQL para crear las 4 tablas del esquema Mink@rt en Supabase SQL Editor:

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
  funding_goal NUMERIC NOT NULL CHECK (funding_goal > 0),
  current_amount NUMERIC DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  ai_analysis_report JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded')),
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

-- 4. Tabla contributions
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  reward_tier_id UUID REFERENCES public.reward_tiers(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de proyectos" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de rewards" ON public.reward_tiers FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de perfiles" ON public.profiles FOR SELECT USING (true);
`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isConfigured) return null

  return (
    <div className="banner-card">
      <div className="banner-header">
        <div className="banner-title-area">
          <Info className="banner-icon" />
          <div>
            <h3>Conexión con tu Base de Datos Supabase</h3>
            <p>
              Estás en <strong>Modo Demostración</strong>. Para vincular las tablas (<code>profiles</code>, <code>projects</code>, <code>reward_tiers</code>, <code>contributions</code>) a tu proyecto de Supabase en tiempo real:
            </p>
          </div>
        </div>
      </div>

      <div className="banner-steps">
        <div className="step-item">
          <span className="step-num">1</span>
          <span>Crea un archivo <code>.env.local</code> en la raíz del proyecto.</span>
        </div>
        <div className="step-item">
          <span className="step-num">2</span>
          <span>
            Agrega tus variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.
          </span>
        </div>
        <div className="step-item">
          <span className="step-num">3</span>
          <button className="text-link-btn" onClick={() => setShowSql(!showSql)}>
            <Code className="btn-icon-sm" />
            {showSql ? 'Ocultar Script SQL de Tablas' : 'Ver Script SQL para Supabase Editor'}
            {showSql ? <ChevronUp className="btn-icon-sm" /> : <ChevronDown className="btn-icon-sm" />}
          </button>
        </div>
      </div>

      {showSql && (
        <div className="sql-box">
          <div className="sql-box-header">
            <span>SQL Script (`tables.md` a PostgreSQL)</span>
            <button className="copy-btn" onClick={handleCopySql}>
              {copied ? <CheckCircle className="copy-icon text-green" /> : <Copy className="copy-icon" />}
              {copied ? '¡Copiado!' : 'Copiar SQL'}
            </button>
          </div>
          <pre><code>{sqlSchema}</code></pre>
        </div>
      )}
    </div>
  )
}
