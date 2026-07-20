import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.prospectName || !body.results) {
    throw createError({ statusCode: 400, message: 'Datos insuficientes para el análisis' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Falta configurar OPENROUTER_API_KEY en el entorno' });
  }

  const criticalPoints = Object.entries(body.results)
    .filter(([_, data]: any) => data.score <= 4)
    .map(([q, data]: any) => `- ${q}: Calif (${data.score}/10). Obs: ${data.observation || 'Sin observaciones'}`)
    .join('\n');

  const allResults = Object.entries(body.results)
    .map(([q, data]: any) => `- ${q}: Calif (${data.score}/10). Obs: ${data.observation || 'Sin observaciones'}`)
    .join('\n');

  const prompt = `
Actúa como un auditor experto en clínicas. Genera un informe profesional y detallado 
para el prospecto "${body.prospectName}". 

Estos son todos los resultados de su evaluación:
${allResults}

Estos son los puntos críticos detectados (calificación <= 4):
${criticalPoints.length > 0 ? criticalPoints : 'Ninguno.'}

El informe debe usar formato Markdown (con títulos, viñetas, negritas, etc). 
Estructura el informe de la siguiente manera:
1. Un resumen ejecutivo amigable de 1-2 párrafos.
2. Análisis de los Puntos Fuertes (calificaciones altas).
3. Análisis de las Áreas Críticas o de Mejora.
4. Un Plan de Acción estructurado y concreto para escalar la facturación y mejorar los procesos, priorizando las áreas críticas si las hay.

Usa un tono profesional, empático y orientado a resultados de negocio.
  `.trim();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw createError({ statusCode: response.status, message: 'Error al comunicarse con la IA (OpenRouter)' });
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || 'No se generó reporte.';

    return { report: generatedText };
  } catch (error: any) {
    console.error('IA generation error:', error);
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Error interno al generar el diagnóstico' 
    });
  }
});
