import { defineHandler } from 'nitro';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const dni = getRouterParam(event, 'dni');
  
  if (!dni || dni.length !== 8) {
    throw createError({ statusCode: 400, message: 'DNI inválido' });
  }

  const token = process.env.APIS_PERU_TOKEN;
  const baseUrl = process.env.DNI_API_URL || 'https://dniruc.apisperu.com/api/v1/dni/';

  if (!token) {
    throw createError({ statusCode: 500, message: 'Falta configurar APIS_PERU_TOKEN en el entorno' });
  }

  try {
    const url = baseUrl.endsWith('/') ? `${baseUrl}${dni}` : `${baseUrl}/${dni}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
         throw createError({ statusCode: 404, message: 'DNI no encontrado' });
      }
      throw createError({ statusCode: response.status, message: 'Error al consultar la API de DNI' });
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Error interno al procesar el DNI' 
    });
  }
});