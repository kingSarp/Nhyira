/** The guest page is a single column, at most 520px wide (see GuestPage). */
export const COLUMN = 520;
export const fullColumn = `(min-width: ${COLUMN}px) ${COLUMN}px, 100vw`;
/**
 * A photo that fills the screen's height. Covering a tall box makes a portrait
 * photo wider than the column (about 80% of the height for a 4:5 photo).
 */
export const fullHeight = `(min-width: ${COLUMN}px) max(${COLUMN}px, 80vh), max(100vw, 80vh)`;
export const halfColumn = `(min-width: ${COLUMN}px) ${COLUMN / 2}px, 50vw`;
