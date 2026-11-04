/**
 * Featured Meta AI creations for the style drawer's carousel.
 *
 * Animated portraits made with Meta AI, vendored so the drawer works
 * offline and never depends on expiring CDN links. (c) Meta.
 * Pure data — covered by `npm test`.
 */

export interface DrawerMedia {
  /** Stable id; selects the animation brief (see carousel-animate.ts). */
  id: string;
  src: string;
  /** English descriptive alt; media names stay universal like style names. */
  alt: string;
}

export const DRAWER_CAROUSEL_IMAGES: DrawerMedia[] = [
  {
    id: "meta-1",
    src: "/images/drawer/meta-1.gif",
    alt: "Animated portrait: smiling woman taking a selfie in a car",
  },
  {
    id: "meta-2",
    src: "/images/drawer/meta-2.gif",
    alt: "Animated portrait: skydiver smiling at an airplane door",
  },
  {
    id: "meta-3",
    src: "/images/drawer/meta-3.gif",
    alt: "Animated portrait: skateboarder on a beach ramp at sunset",
  },
  {
    id: "meta-4",
    src: "/images/drawer/meta-4.gif",
    alt: "Animated portrait: 3D character floating on a flamingo in a pool",
  },
];
