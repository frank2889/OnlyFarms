// Reistijd-indicatie naast kilometers: stadsmensen denken in minuten, niet in km.
// Lopen ~5 km/u, fietsen ~16 km/u; onder de 2 km tonen we looptijd.

export function travelInfo(km: number): { mode: "lopen" | "fietsen"; minutes: number } {
  if (km <= 2) {
    return { mode: "lopen", minutes: Math.max(1, Math.round((km / 5) * 60)) };
  }
  return { mode: "fietsen", minutes: Math.max(2, Math.round((km / 16) * 60)) };
}
