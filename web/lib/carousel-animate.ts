/**
 * Carousel animation core (GIF Animator): per-image prompt registry and
 * frame-plan building for 6 FPS stop-motion loops. Pure functions —
 * covered by `npm test`. The thin server route performs the model calls;
 * prompt selection follows the gif-animator agent
 * (agents_orig/gif-animator, skills/frame-prompts.md). Keep the registry
 * in sync with the skill document.
 */

export const ANIMATION_FPS = 6;
export const DEFAULT_FRAME_COUNT = 6;
export const MAX_FRAME_COUNT = 12;

export interface AnimationBrief {
  /** Base loop prompt, used verbatim. */
  base: string;
  /** One motion beat per frame; cycled when the plan exceeds 6. */
  beats: string[];
}

const IDENTITY_LOCK =
  "Cada fotograma debe tener el cuerpo, los colores y el contorno idénticos del personaje.";

const FRAME_NEGATIVES =
  "Genera un solo fotograma fijo, sin cuadrícula ni contact sheet; sin texto, números, etiquetas ni marcas en la imagen.";

/** Animation brief per carousel image id (see web/lib/drawer-media.ts). */
export const IMAGE_ANIMATION_BRIEFS: Record<string, AnimationBrief> = {
  "meta-1": {
    base: "Genera un GIF animado a 6 FPS con un bucle suave de una joven de cabello largo y oscuro tomándose una selfie sonriente dentro de un coche: la brisa mueve apenas el cabello y la luz cambia levemente. Anímalo con movimiento suave cuadro a cuadro. Cada fotograma debe tener la cara, los colores y el contorno idénticos.",
    beats: [
      "cabello quieto, sonrisa plena, luz neutra",
      "la brisa levanta apenas el cabello a la izquierda",
      "el cabello vuelve a su lugar, la sonrisa se mantiene",
      "la brisa levanta apenas el cabello a la derecha",
      "el cabello vuelve a su lugar, leve cambio de luz",
      "pose inicial exacta (cierre del bucle)",
    ],
  },
  "meta-2": {
    base: "Genera un GIF animado a 6 FPS con un bucle suave de una paracaidista rubia con traje azul en la puerta de un avión haciendo corazones con los dedos: las nubes pasan tras ella y el cabello se agita con el viento. Anímalo con movimiento suave cuadro a cuadro. Cada fotograma debe tener el cuerpo, los colores y el contorno idénticos del personaje.",
    beats: [
      "pose inicial, nubes quietas tras ella",
      "las nubes se desplazan a la izquierda, el cabello se agita",
      "las nubes avanzan, los dedos mantienen el corazón",
      "ráfaga de viento, el cabello se levanta más",
      "el viento cede, las nubes siguen pasando",
      "pose y nubes iniciales (cierre del bucle)",
    ],
  },
  "meta-3": {
    base: "Genera un GIF animado a 6 FPS con un bucle suave de un joven con camiseta rosa y monopatín de pie en una rampa de la playa al atardecer: las olas rompen detrás y la brisa mueve su camiseta. Anímalo con movimiento suave cuadro a cuadro. Cada fotograma debe tener el cuerpo, los colores y el contorno idénticos del personaje.",
    beats: [
      "pose inicial, mar en calma relativa",
      "una ola empieza a romper a lo lejos",
      "la ola rompe con espuma, la camiseta se agita",
      "la espuma se disipa, la brisa continúa",
      "el mar se calma, la camiseta vuelve a su lugar",
      "mar y pose iniciales (cierre del bucle)",
    ],
  },
  "meta-4": {
    base: "Genera un GIF animado a 6 FPS con un bucle suave de mí como un personaje de plastilina en stop-motion relajándome en una piscina con un flotador inflable de flamenco rosa, una camisa hawaiana y gafas de sol, llega un plato con un filete y lo come en la alberca. Anímalo como un movimiento clásico de stop-motion de plastilina. Cada fotograma debe tener el cuerpo, los colores y el contorno idénticos del personaje.",
    beats: [
      "flotando relajado, el plato con el filete entra por el borde derecho",
      "el plato se acerca, el personaje gira la cabeza hacia el filete",
      "el plato queda junto al flotador, el personaje estira la mano hacia el filete",
      "el personaje muerde el filete, el plato firme en el agua",
      "el personaje mastica feliz, el plato sigue al lado",
      "vuelve a flotar relajado, el plato sale por el borde (cierre del bucle)",
    ],
  },
};

/**
 * Frame prompts for an image id: base + beat + identity lock + counter +
 * single-frame negatives. Returns null for unknown ids. Beats cycle when
 * count exceeds 6.
 */
export function buildFramePrompts(imageId: string, count: number = DEFAULT_FRAME_COUNT): string[] | null {
  const brief = IMAGE_ANIMATION_BRIEFS[imageId];
  const n = Math.floor(count);
  if (!brief || !Number.isFinite(n) || n < 1 || n > MAX_FRAME_COUNT) return null;
  return Array.from({ length: n }, (_, i) => {
    const beat = brief.beats[i % brief.beats.length];
    return `${brief.base} Fotograma ${i + 1} de ${n}: ${beat}. ${IDENTITY_LOCK} ${FRAME_NEGATIVES}`;
  });
}
