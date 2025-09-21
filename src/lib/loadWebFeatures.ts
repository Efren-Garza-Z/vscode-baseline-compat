// src/lib/loadWebFeatures.ts
export async function loadFeatures() {
  const mod = await import('web-features');
  // el paquete puede exportar `features` o exportar default/objeto
  const maybe = (mod as any).features ?? (mod as any).default ?? mod;
  // si es array, reindexamos por id para un lookup rápido
  if (Array.isArray(maybe)) {
    const map: Record<string, any> = {};
    for (const f of maybe) map[f.id] = f;
    return map;
  }
  return maybe as Record<string, any>;
}
