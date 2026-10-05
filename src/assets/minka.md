# PLATAFORMA MINK@RT - MASTER CONTEXT & UI PROMPTS

## 1. CONTEXTO DEL PROYECTO (SYSTEM PROMPT)
**Nombre del Producto:** Mink@rt (startup Canchita Producciones).
**Concepto:** Plataforma web de crowdfunding interactivo y auditable para el arte independiente peruano (SaaS). 
**Diferenciador:** Resuelve la desconfianza del donante utilizando Inteligencia Artificial ("MinkaGuard AI"). La IA evalúa el guion, presupuesto y cronograma del creador para generar un "Risk Score" (Índice de Viabilidad) público antes de que los mecenas aporten dinero.
**Regla de Negocio Core:** Todos los usuarios registrados pueden ser "Mecenas" (descubrir y donar) o "Creadores" (crear campañas y someterlas a la IA).

---

## 2. GUÍA DE ESTILO VISUAL (DESIGN SYSTEM)
Basado en la referencia visual provista, la herramienta generadora de UI debe aplicar estrictamente los siguientes tokens de diseño:

### 2.1. Tipografía (Google Fonts)
*   **Headline (Títulos H1, H2, H3):** `Syne` (Pesos: Bold, ExtraBold).
*   **Body (Cuerpo de texto, descripciones):** `Plus Jakarta Sans` (Pesos: Regular, Medium).
*   **Label (Etiquetas, Badges, Botones, Inputs):** `JetBrains Mono` (Pesos: Medium, Bold).

### 2.2. Paleta de Colores (Tokens)
*   **Primary (Acción principal, CTA, Destacados):** Terracota Intenso `#D34B26` (o similar al swatch naranja/rojizo).
*   **Secondary (Fondos oscuros, Contraste, Header):** Ciruela Oscuro `#2E183A`.
*   **Tertiary (Acentos, Progreso, Alertas medias):** Mostaza / Ámbar `#F4A22B`.
*   **Neutral (Texto principal, bordes oscuros):** Carbón `#1A1A1A`.
*   **Background (Fondo general de la app):** Crema / Off-White `#F5EFE6` (o un gris/crema muy cálido y claro para contrastar las tarjetas).

### 2.3. Estilos de Componentes (UI Primitives)
*   **Tarjetas (Cards) y Contenedores:** Fondo blanco o crema claro, esquinas redondeadas (border-radius: 16px a 24px), sombras suaves y amplias.
*   **Botones:** 
    *   *Primary:* Fondo `#D34B26`, texto blanco, esquinas redondeadas (pill-shape o 12px).
    *   *Inverted/Secondary:* Fondo `#2E183A`, texto blanco.
    *   *Outlined:* Fondo transparente, borde de 2px sólido, texto a color.
*   **Inputs y Buscadores:** Fondo ligeramente contrastado, bordes suaves, iconos integrados (Search, User). Estilo píldora (pill-shape) para la barra de búsqueda.
*   **Íconos:** Circulares con fondo sólido (Secondary o Primary) e ícono en blanco en el centro.

---

## 3. RESTRICCIONES TÉCNICAS PARA LA IA GENERADORA (ANTI-ERRORES)
*   **Cero Lorem Ipsum:** Usa microcopy real (ej. "Apoyar Proyecto", "Risk Score: 85%", "Sube tu Guion").
*   **Consistencia:** Mantén las esquinas redondeadas y la jerarquía tipográfica en todas las vistas. No inventes colores fuera de la paleta.
*   **Backend Ready:** Deja los formularios listos para conectar con `supabase-js`. 
*   **IA Placeholder:** En la vista de creación, crea una función asíncrona vacía `handleAIAnalysis()` documentada para que el desarrollador inserte su API Key de Gemini/OpenAI.

---
---

## 4. PROMPTS DE PANTALLAS (PARA GENERAR UNA POR UNA)

### PANTALLA 1: Autenticación (Login & Register)
**Instrucción para la IA:** Genera la vista de Autenticación aplicando el Design System de Mink@rt.
*   **Layout:** Vista dividida o Tarjeta central amplia sobre el fondo `Background`.
*   **Header:** Logo tipográfico "Mink@rt" (en fuente Syne, color Primary).
*   **Controles:** Selector de pestañas (Tabs) estilo píldora: [ Iniciar Sesión ] | [ Crear Cuenta ].
*   **Formulario Iniciar Sesión:** 
    *   Inputs de Email y Contraseña (fuente JetBrains Mono para labels).
    *   Botón Primary (100% ancho): "Ingresar".
*   **Formulario Crear Cuenta (Supabase Ready):**
    *   Inputs: Nombre Completo, Email, Contraseña.
    *   Botón Primary (100% ancho): "Registrarme".
*   **Nota Técnica:** Simula el estado de carga (loading) en los botones para cuando se llame a `supabase.auth.signUp()` o `signIn()`.

---

### PANTALLA 2: Cartelera y Descubrimiento de Proyectos
**Instrucción para la IA:** Genera la vista principal (Dashboard/Catálogo) donde los usuarios descubren proyectos.
*   **Navbar:** Logo Mink@rt (izq), Barra de búsqueda central estilo píldora con ícono de lupa, Menú de usuario (der) con Avatar y botón CTA "Crear Proyecto" (estilo Inverted).
*   **Filtros (Sección superior):** Botones tipo "pill" o chips para: [ Todos ] [ Cine ] [ Teatro ] [ Webcómic ]. Y un Dropdown para "Ordenar por Risk Score IA".
*   **Grilla de Proyectos (Project Cards):** Cuadrícula responsiva (3 columnas en desktop). Cada tarjeta debe tener:
    *   Imagen de portada (placeholder).
    *   Badge flotante superpuesto: "IA Risk Score: 88% Viable" (Fondo Tertiary o Verde si es alto).
    *   Título (Syne, H3, color Neutral).
    *   Barra de progreso de recaudación (Color Primary) con texto "S/ 2,500 de S/ 5,000".
    *   Botón CTA Outlined: "Ver Detalles".

---

### PANTALLA 3: Detalle del Proyecto e IA Risk Score
**Instrucción para la IA:** Genera la vista de detalle cuando un usuario hace clic en un proyecto de la cartelera.
*   **Hero Section:** Imagen principal del proyecto a todo lo ancho con un gradiente oscuro en la parte inferior. Título del proyecto en tipografía Syne superpuesto.
*   **Layout (2 columnas en Desktop):**
    *   **Columna Izquierda (Contenido):**
        *   Navegación por pestañas: [ Sinopsis ] | [ Auditoría IA ] | [ Avances ].
        *   **Contenido Pestaña 'Auditoría IA':** Un panel destacado (borde Secondary o Primary) que muestre el "Informe de MinkaGuard AI". Incluye un gráfico circular o barra mostrando el % de viabilidad, y una lista con viñetas: "Presupuesto coherente", "Cronograma realista", "Riesgo detectado: Falta equipo de post-producción".
    *   **Columna Derecha (Panel de Aportes/Checkout Fijo):**
        *   Tarjeta flotante con: Monto recaudado, días restantes y Botón Primary enorme: "Apoyar este Proyecto".
        *   Lista de "Recompensas (Tiers)" en tarjetas pequeñas (ej. Nivel 1: S/ 20 - Agradecimientos, Nivel 2: S/ 50 - Poster digital). Cada tier tiene su propio botón "Seleccionar".

---

### PANTALLA 4: Creación de Proyecto y Generación de Análisis IA
**Instrucción para la IA:** Genera el panel para que cualquier usuario cree un proyecto y lo someta a evaluación por Inteligencia Artificial.
*   **Header:** "Publica tu Proyecto y Valídalo con IA" (Tipografía Syne).
*   **Paso 1: Datos Básicos:** Inputs para Título del Proyecto, Categoría (Dropdown) y Meta de Recaudación en S/.
*   **Paso 2: Subida de Archivos para la IA (Crucial):**
    *   Crea una zona Drag & Drop (líneas punteadas, color Tertiary) con el texto: "Sube tu Guion, Presupuesto y Cronograma (PDF) para el análisis de MinkaGuard AI".
    *   Botón Primary prominente con ícono de destellos (sparkles): "Analizar Viabilidad con IA".
*   **Lógica Funcional Mockeada (JavaScript/React):** 
    *   Añade un estado de `isAnalyzing` (simulando un loader de IA analizando textos).
    *   Añade un comentario explícito en el código generado: 
        `// TODO: Insertar aquí la llamada a la API de Gemini usando la API Key del usuario. Pasar los PDFs a texto y solicitar el JSON con el Risk Score.`
*   **Paso 3: Resultados de la IA:** Una tarjeta oculta que se muestra tras el análisis simulado, mostrando un input readonly con el "Risk Score Asignado" y un botón nal: "Publicar Proyecto Oficialmente".
```eof

Con este documento `.md`, tienes un "mega prompt" estructurado. Las herramientas modernas de generación (como v0.dev o Cursor) leen este tipo de formato a la perfección. Al procesarlo, entenderán toda la arquitectura de la app, los colores, tipografías, restricciones y el flujo exacto (incluyendo el espacio reservado para que tú pongas tu API Key de Gemini en la función de análisis). 

¿Te gustaría que te indique los pasos exactos sobre cómo inyectar la API de Gemini en la función generada una vez que tengas el código en React?