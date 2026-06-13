/**
 * Tag taxonomy constants shared across server and client.
 *
 * Tags with post count at or below RARE_THRESHOLD are folded into
 * the rare-tail section. Above this they appear in the frequent grid.
 * One source of truth so hero metadata, the grid, and the tail
 * toggle never disagree.
 */

export const RARE_THRESHOLD = 2;

// "feature" tile cap. We cap how many of the top tags get the
// featured tile layout. Beyond this, even frequent tags would
// feel like a wall.
export const FEATURE_CAP = 12;
