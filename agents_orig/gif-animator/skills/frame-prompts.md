# Skill: Frame Prompts for Carousel Loops

GIF Animator skill. Maps each carousel image id to its animation brief:
a base loop prompt plus one motion beat per frame. Keep headings as-is.

## Purpose

Produce reproducible per-frame prompt recipes that animate the source
carousel image as a smooth 6 FPS loop with identical character identity
in every frame.

## Inputs

- Carousel image id (`meta-1` … `meta-4`, see `web/lib/drawer-media.ts`).
- Frame count (default 6, range 1–12).
- `harness/policy.yaml` (`authorization_gates`, `brand_harness`).

## Steps

1. Look up the image id in the registry below; refuse unknown ids.
2. Take the base loop prompt verbatim.
3. For frame N of M, append beat `((N - 1) mod 6) + 1`, the identity lock
   ("same body, colors, and outline in every frame", in the brief's
   language), the frame counter, and the single-frame negatives (one
   still frame, no grid or contact sheet, no baked text/numbers/labels).
4. Verify the last beat closes the loop toward frame 1.
5. Emit one recipe per frame, in order.

## Registry (image id → brief)

### meta-1 — car selfie
Base: "Genera un GIF animado a 6 FPS con un bucle suave de una joven de
cabello largo y oscuro tomándose una selfie sonriente dentro de un
coche: la brisa mueve apenas el cabello y la luz cambia levemente.
Anímalo con movimiento suave cuadro a cuadro. Cada fotograma debe tener
la cara, los colores y el contorno idénticos."
Beats:
1. cabello quieto, sonrisa plena, luz neutra
2. la brisa levanta apenas el cabello a la izquierda
3. el cabello vuelve a su lugar, la sonrisa se mantiene
4. la brisa levanta apenas el cabello a la derecha
5. el cabello vuelve a su lugar, leve cambio de luz
6. pose inicial exacta (cierre del bucle)

### meta-2 — skydiver
Base: "Genera un GIF animado a 6 FPS con un bucle suave de una
paracaidista rubia con traje azul en la puerta de un avión haciendo
corazones con los dedos: las nubes pasan tras ella y el cabello se agita
con el viento. Anímalo con movimiento suave cuadro a cuadro. Cada
fotograma debe tener el cuerpo, los colores y el contorno idénticos del
personaje."
Beats:
1. pose inicial, nubes quietas tras ella
2. las nubes se desplazan a la izquierda, el cabello se agita
3. las nubes avanzan, los dedos mantienen el corazón
4. ráfaga de viento, el cabello se levanta más
5. el viento cede, las nubes siguen pasando
6. pose y nubes iniciales (cierre del bucle)

### meta-3 — beach skateboarder
Base: "Genera un GIF animado a 6 FPS con un bucle suave de un joven con
camiseta rosa y monopatín de pie en una rampa de la playa al atardecer:
las olas rompen detrás y la brisa mueve su camiseta. Anímalo con
movimiento suave cuadro a cuadro. Cada fotograma debe tener el cuerpo,
los colores y el contorno idénticos del personaje."
Beats:
1. pose inicial, mar en calma relativa
2. una ola empieza a romper a lo lejos
3. la ola rompe con espuma, la camiseta se agita
4. la espuma se disipa, la brisa continúa
5. el mar se calma, la camiseta vuelve a su lugar
6. mar y pose iniciales (cierre del bucle)

### meta-4 — pool flamingo (clay stop-motion)
Base: "Genera un GIF animado a 6 FPS con un bucle suave de mí como un
personaje de plastilina en stop-motion relajándome en una piscina con un
flotador inflable de flamenco rosa, una camisa hawaiana y gafas de sol,
llega un plato con un filete y lo come en la alberca. Anímalo como un
movimiento clásico de stop-motion de plastilina. Cada fotograma debe
tener el cuerpo, los colores y el contorno idénticos del personaje."
Beats:
1. flotando relajado, el plato con el filete entra por el borde derecho
2. el plato se acerca, el personaje gira la cabeza hacia el filete
3. el plato queda junto al flotador, el personaje estira la mano hacia
   el filete
4. el personaje muerde el filete, el plato firme en el agua
5. el personaje mastica feliz, el plato sigue al lado
6. vuelve a flotar relajado, el plato sale por el borde (cierre del
   bucle)

## Outputs

- Ordered frame recipes (base + beat + identity lock + counter).
- Verification verdict: `pass` or `refine:<what failed>`.

## Failure handling

- On unknown image id: refuse with the valid id list.
- On identity drift or wrong beat: refine with a scoped edit, up to two
  attempts, then escalate.
- On `[BRAND_HARNESS: FAILED]`: block, return the rejection ticket, and
  rewrite the recipes before resubmission.
