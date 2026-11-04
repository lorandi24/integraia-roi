# Calculadora de ROI de IA – IntegraIA by EMET

Aplicación web para que dueños de pymes mexicanas estimen cuánto tiempo y dinero pueden ahorrar con inteligencia artificial, cuánto invertir y en cuántos meses lo recuperan.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3. Sin base de datos ni autenticación.

## Flujo

| Ruta | Qué hace |
| --- | --- |
| `/` | Landing: qué es el ROI, por qué importa a una pyme y botón para empezar. |
| `/calculadora` | Formulario guiado en 3 pasos (negocio → tiempo y costo → mejora a evaluar). |
| `/resultado?...` | Resultados renderizados en servidor: KPIs, barras, gráfica de flujo acumulado y explicación. Copiar, PDF y WhatsApp. |

Los datos viajan en la URL (`?s=comercio&p=3&h=60&m=sueldo&c=13000&v=600&i=whatsapp`), así que cada resultado es **un enlace que se puede compartir** y “Editar datos” regresa al formulario con todo precargado.

## Correr en local

Requisitos: Node.js 18.18+ (recomendado 20 o 22).

```bash
npm install
```

```bash
npm run dev
```

Abre http://localhost:3000.

Build de producción:

```bash
npm run build && npm start
```

## Logo

| Archivo | Uso |
| --- | --- |
| `public/logo-integraia.png` | Emblema (lobo + aro), 512×512 con fondo transparente. Encabezado. |
| `public/logo-integraia-full.webp` | Logo completo con wordmark (WebP, ~85 KB). Portada. |
| `app/icon.png`, `app/apple-icon.png` | Favicon e ícono de iOS (Next.js los detecta solos). |

Para cambiarlo, reemplaza los archivos con los mismos nombres y vuelve a compilar. Si falta `logo-integraia.png`, el encabezado muestra un placeholder punteado que dice “LOGO”.

## Desplegar

### Vercel (recomendado)

1. Sube el repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repo. Detecta Next.js automáticamente; no requiere variables de entorno.
3. Opcional: conecta tu dominio (por ejemplo `roi.integraia.mx`) en *Settings → Domains*.

O desde la terminal:

```bash
npx vercel --prod
```

### Netlify u otro hosting Node

Usa `npm run build` como comando de build. Netlify detecta Next.js con su runtime oficial. En un VPS: `npm ci && npm run build && npm start` (puerto 3000; usa `PORT=8080 npm start` para cambiarlo).

## Modelo de cálculo (`lib/roi.ts`)

Supuestos conservadores, todo en MXN:

- **Horas/mes** = horas semanales × 4.33.
- **Costo por hora**: directo, o sueldo mensual ÷ 208 h × 1.30 (carga social: IMSS, INFONAVIT, aguinaldo, vacaciones).
- **Tasa de automatización** por tipo de mejora (WhatsApp 45%, reportes 65%, inventarios 40%, facturación 55%, contenido 50%, CRM 40%), ajustada por giro (±5%) y volumen mensual (−10% a +15%), con **tope de 70%**.
- **Costo mensual de operación** (licencias, API, WhatsApp Business, soporte) que se descuenta del ahorro.
- **Inversión**: rango por tipo de mejora, escalado por personas involucradas y volumen. Para payback y ROI se usa el punto medio.
- **Curva de adopción**: mes 1 sin ahorro (implementación), mes 2 al 50%, del mes 3 en adelante al 100%.
- **Payback** = mes en que el flujo acumulado cruza cero (interpolado). **ROI 12 meses** = (ahorro neto año 1 − inversión) ÷ inversión.

Para ajustar tarifas, porcentajes o rangos de inversión, edita los arreglos `IMPROVEMENTS` y `SECTORS` en `lib/roi.ts`. El número de WhatsApp está en `lib/summary.ts` (`WHATSAPP_NUMBER`).

## Estructura

```
app/
  layout.tsx           Layout, fuente Inter (self-hosted) y metadatos
  page.tsx             Landing
  calculadora/page.tsx Lee la URL y monta el formulario
  resultado/page.tsx   Resultados (Server Component)
components/
  Wizard.tsx           Formulario guiado (único componente cliente pesado)
  ResultActions.tsx    Copiar / PDF / WhatsApp
  CashflowChart.tsx    Gráfica SVG renderizada en servidor (0 KB de JS)
  Logo.tsx, SiteHeader.tsx, SiteFooter.tsx
lib/
  roi.ts               Modelo de cálculo y (de)serialización de la URL
  format.ts            Formatos es-MX
  summary.ts           Texto para copiar y mensaje de WhatsApp
```

## Rendimiento

- Sin librerías de gráficas ni de UI: la página de resultados envía ~1.6 KB de JS propio.
- Gráficas en SVG generadas en servidor; el PDF usa la impresión nativa del navegador con estilos de impresión en blanco.

> Las cifras son estimaciones orientativas y no constituyen una cotización formal.
