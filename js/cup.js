/* ============================================================
   Ireland Trip 2026 — Cup & Championship tab
   Extends the trip planner's global `state` (from index.html) with
   `state.cup`. Reuses the trip planner's globals directly: `state`,
   `saveState`, `syncKey`, `SYNCED_KEYS`, `esc`, `PARTICIPANTS`,
   `DAYS`, `COURSE_SHORT`, `getParticipant`. Not wrapped in an IIFE
   so its onclick-referenced functions stay callable from HTML
   strings, same convention as the rest of index.html.

   Course data (CUP_COURSES) carries real Par + Stroke Index for every
   hole and real Rating/Slope/Par per tee for all six courses, taken
   from official scorecards — each course's comment notes its source
   and any quirk worth knowing when editing it.
   ============================================================ */

// ============================================================
// STATIC TRIP-SPECIFIC MAPPING
// ============================================================
const CUP_GOLFER_IDS = ['george', 'eric', 'jeff', 'phil', 'robert', 'gary', 'elizabeth'];

// Starting Handicap Indexes, from the group's GHIN records. Stored the way
// the maths wants them, which is the OPPOSITE sign from how golf writes
// them: GHIN shows a better-than-scratch index as "+0.6", and the Course
// Handicap formula consumes that as -0.6. Everything below is the maths
// value; the UI reads and writes GHIN notation. Editable in Handicaps &
// Tees — these are just the starting point.
const CUP_SEED_HANDICAPS = {
  george: 6.5,
  eric: 12.9,
  jeff: 12.9,
  phil: 7.8,
  gary: 10.5,
  robert: -0.6, // GHIN shows this as +0.6
  elizabeth: 28.0,
};
const CUP_ROUND_DAYS = { R1: 'aug2', R2: 'aug3', R3: 'aug4', R4: 'aug5', R5: 'aug6', R6: 'aug7' };
const SF_ROUNDS = Object.keys(CUP_ROUND_DAYS);
const RANK_PTS = [10, 8, 6, 5, 4, 3];
const CUP_CLINCH = 9.5, CUP_TOTAL = 18;

// ============================================================
// COURSE DATA
// ============================================================
// Royal County Down — full official scorecard (mournegolfclub.com PDF):
// real Par + Stroke Index for all 18 holes, separately for the men's
// tees (Blue/White/Yellow/Green share one Par/SI column) and the
// women's Red tee (its own Par/SI column — 5 holes play a stroke
// longer for women, which is why men's total is 71 and women's 76).
const CUP_RCD_HOLES = [
  { num: 1, parMen: 5, siMen: 13, parWomen: 5, siWomen: 13 },
  { num: 2, parMen: 4, siMen: 9, parWomen: 4, siWomen: 3 },
  { num: 3, parMen: 4, siMen: 3, parWomen: 5, siWomen: 9 },
  { num: 4, parMen: 3, siMen: 15, parWomen: 3, siWomen: 15 },
  { num: 5, parMen: 4, siMen: 7, parWomen: 4, siWomen: 7 },
  { num: 6, parMen: 4, siMen: 11, parWomen: 4, siWomen: 1 },
  { num: 7, parMen: 3, siMen: 17, parWomen: 3, siWomen: 17 },
  { num: 8, parMen: 4, siMen: 1, parWomen: 5, siWomen: 5 },
  { num: 9, parMen: 4, siMen: 5, parWomen: 5, siWomen: 11 },
  { num: 10, parMen: 3, siMen: 18, parWomen: 3, siWomen: 16 },
  { num: 11, parMen: 4, siMen: 8, parWomen: 4, siWomen: 2 },
  { num: 12, parMen: 5, siMen: 16, parWomen: 5, siWomen: 8 },
  { num: 13, parMen: 4, siMen: 2, parWomen: 5, siWomen: 12 },
  { num: 14, parMen: 3, siMen: 12, parWomen: 3, siWomen: 14 },
  { num: 15, parMen: 4, siMen: 4, parWomen: 5, siWomen: 4 },
  { num: 16, parMen: 4, siMen: 14, parWomen: 4, siWomen: 18 },
  { num: 17, parMen: 4, siMen: 10, parWomen: 4, siWomen: 6 },
  { num: 18, parMen: 5, siMen: 6, parWomen: 5, siWomen: 10 },
];
// Ardglass Golf Club — full official scorecard: real Par + Stroke Index
// for all 18 holes. Unlike RCD, men's (White/Green) and women's (Red)
// Par are identical hole-for-hole here — only Stroke Index differs.
// This card's total Par (70) corrected the Par (71/72) that had been
// read off the handicap-calculator app for these same tees; kept that
// app's Rating/Slope numbers since Course Rating isn't algebraically
// tied to Par, but flag them for re-confirmation if precision matters.
const CUP_ARDGLASS_HOLES = [
  { num: 1, parMen: 4, siMen: 10, parWomen: 4, siWomen: 10 },
  { num: 2, parMen: 3, siMen: 14, parWomen: 3, siWomen: 16 },
  { num: 3, parMen: 4, siMen: 16, parWomen: 4, siWomen: 14 },
  { num: 4, parMen: 4, siMen: 6, parWomen: 4, siWomen: 6 },
  { num: 5, parMen: 3, siMen: 18, parWomen: 3, siWomen: 12 },
  { num: 6, parMen: 4, siMen: 4, parWomen: 4, siWomen: 8 },
  { num: 7, parMen: 3, siMen: 12, parWomen: 3, siWomen: 18 },
  { num: 8, parMen: 4, siMen: 2, parWomen: 4, siWomen: 4 },
  { num: 9, parMen: 5, siMen: 8, parWomen: 5, siWomen: 2 },
  { num: 10, parMen: 3, siMen: 13, parWomen: 3, siWomen: 17 },
  { num: 11, parMen: 5, siMen: 3, parWomen: 5, siWomen: 5 },
  { num: 12, parMen: 3, siMen: 7, parWomen: 3, siWomen: 15 },
  { num: 13, parMen: 4, siMen: 1, parWomen: 4, siWomen: 9 },
  { num: 14, parMen: 4, siMen: 11, parWomen: 4, siWomen: 1 },
  { num: 15, parMen: 5, siMen: 15, parWomen: 5, siWomen: 7 },
  { num: 16, parMen: 4, siMen: 5, parWomen: 4, siWomen: 11 },
  { num: 17, parMen: 4, siMen: 9, parWomen: 4, siWomen: 3 },
  { num: 18, parMen: 4, siMen: 17, parWomen: 4, siWomen: 13 },
];
// Portmarnock Golf Club — real Par + Stroke Index for the "Red Nine" +
// "Blue Nine" 18-hole combination (from a blank competition scorecard;
// no Rating/Slope printed on it, so tees stay placeholder until that's
// sourced). NOTE: the club's name wasn't actually printed on this card —
// inferred from the Red/Blue/Yellow "three nines" naming that's a known
// signature of Portmarnock's 27-hole layout, and the combined Stroke
// Index running a clean 1-18 across both nines. Flag to the group to
// confirm this is the right nine-pairing before trusting it fully.
const CUP_PORTMARNOCK_HOLES = [
  { num: 1, parMen: 4, siMen: 7, parWomen: 4, siWomen: 7 },
  { num: 2, parMen: 4, siMen: 15, parWomen: 4, siWomen: 15 },
  { num: 3, parMen: 4, siMen: 13, parWomen: 4, siWomen: 13 },
  { num: 4, parMen: 4, siMen: 1, parWomen: 4, siWomen: 1 },
  { num: 5, parMen: 4, siMen: 9, parWomen: 4, siWomen: 9 },
  { num: 6, parMen: 5, siMen: 5, parWomen: 5, siWomen: 5 },
  { num: 7, parMen: 3, siMen: 17, parWomen: 3, siWomen: 17 },
  { num: 8, parMen: 4, siMen: 11, parWomen: 4, siWomen: 11 },
  { num: 9, parMen: 4, siMen: 3, parWomen: 4, siWomen: 3 },
  { num: 10, parMen: 4, siMen: 12, parWomen: 4, siWomen: 12 },
  { num: 11, parMen: 4, siMen: 6, parWomen: 4, siWomen: 6 },
  { num: 12, parMen: 3, siMen: 16, parWomen: 3, siWomen: 16 },
  { num: 13, parMen: 5, siMen: 14, parWomen: 5, siWomen: 14 },
  { num: 14, parMen: 4, siMen: 2, parWomen: 4, siWomen: 2 },
  { num: 15, parMen: 3, siMen: 18, parWomen: 3, siWomen: 18 },
  { num: 16, parMen: 5, siMen: 8, parWomen: 5, siWomen: 8 },
  { num: 17, parMen: 4, siMen: 4, parWomen: 4, siWomen: 4 },
  { num: 18, parMen: 4, siMen: 10, parWomen: 4, siWomen: 10 },
];
// The Royal Dublin Golf Club — full official scorecard: real Par +
// Stroke Index for all 18 holes, separately for men's (Blue/White/
// Yellow) and women's (Red) tees — 6 holes play a different Par by
// gender, which is why men's total is 72 and women's 74.
const CUP_ROYAL_DUBLIN_HOLES = [
  { num: 1, parMen: 4, siMen: 10, parWomen: 4, siWomen: 6 },
  { num: 2, parMen: 5, siMen: 17, parWomen: 5, siWomen: 13 },
  { num: 3, parMen: 4, siMen: 8, parWomen: 4, siWomen: 17 },
  { num: 4, parMen: 3, siMen: 13, parWomen: 3, siWomen: 9 },
  { num: 5, parMen: 4, siMen: 2, parWomen: 5, siWomen: 16 },
  { num: 6, parMen: 5, siMen: 9, parWomen: 5, siWomen: 5 },
  { num: 7, parMen: 3, siMen: 15, parWomen: 3, siWomen: 15 },
  { num: 8, parMen: 4, siMen: 6, parWomen: 4, siWomen: 7 },
  { num: 9, parMen: 3, siMen: 16, parWomen: 3, siWomen: 10 },
  { num: 10, parMen: 4, siMen: 1, parWomen: 4, siWomen: 1 },
  { num: 11, parMen: 5, siMen: 11, parWomen: 5, siWomen: 14 },
  { num: 12, parMen: 3, siMen: 14, parWomen: 3, siWomen: 8 },
  { num: 13, parMen: 4, siMen: 7, parWomen: 5, siWomen: 11 },
  { num: 14, parMen: 5, siMen: 12, parWomen: 4, siWomen: 2 },
  { num: 15, parMen: 4, siMen: 4, parWomen: 4, siWomen: 4 },
  { num: 16, parMen: 4, siMen: 18, parWomen: 4, siWomen: 18 },
  { num: 17, parMen: 4, siMen: 5, parWomen: 4, siWomen: 3 },
  { num: 18, parMen: 4, siMen: 3, parWomen: 5, siWomen: 12 },
];
// Portstewart Golf Club — Strand Course: full official scorecard (via
// Google Images / SWING Golf Ireland), real Par + Stroke Index for all
// 18 holes. Blue/White share one men's Par/SI column; Red has its own
// women's column — only hole 17 differs in Par by gender (Par 4 for
// Blue/White, Par 5 for Red), which is why men's total is 72 and
// women's is 73. This card's Par 72 corrects the Par 71 read off the
// handicap-calculator app for the same named tees earlier — same
// situation as Ardglass, kept the app's Rating/Slope, flagged for
// re-confirmation. Card's own yardages differ meaningfully from the
// app's for tees sharing a name (e.g. White: 6,606 here vs 6,075 on
// the app), so these may not be the exact same physical markers —
// another thing worth the group double-checking on the ground.
const CUP_PORTSTEWART_HOLES = [
  { num: 1, parMen: 4, siMen: 11, parWomen: 4, siWomen: 7 },
  { num: 2, parMen: 4, siMen: 7, parWomen: 4, siWomen: 1 },
  { num: 3, parMen: 3, siMen: 13, parWomen: 3, siWomen: 17 },
  { num: 4, parMen: 5, siMen: 5, parWomen: 5, siWomen: 9 },
  { num: 5, parMen: 4, siMen: 1, parWomen: 4, siWomen: 3 },
  { num: 6, parMen: 3, siMen: 15, parWomen: 3, siWomen: 13 },
  { num: 7, parMen: 5, siMen: 17, parWomen: 5, siWomen: 11 },
  { num: 8, parMen: 4, siMen: 3, parWomen: 4, siWomen: 5 },
  { num: 9, parMen: 4, siMen: 9, parWomen: 4, siWomen: 15 },
  { num: 10, parMen: 4, siMen: 10, parWomen: 4, siWomen: 2 },
  { num: 11, parMen: 4, siMen: 4, parWomen: 4, siWomen: 14 },
  { num: 12, parMen: 3, siMen: 18, parWomen: 3, siWomen: 18 },
  { num: 13, parMen: 5, siMen: 16, parWomen: 5, siWomen: 6 },
  { num: 14, parMen: 5, siMen: 12, parWomen: 5, siWomen: 8 },
  { num: 15, parMen: 3, siMen: 14, parWomen: 3, siWomen: 16 },
  { num: 16, parMen: 4, siMen: 6, parWomen: 4, siWomen: 4 },
  { num: 17, parMen: 4, siMen: 2, parWomen: 5, siWomen: 12 },
  { num: 18, parMen: 4, siMen: 8, parWomen: 4, siWomen: 10 },
];
// Royal Portrush Golf Club — Dunluce Course: full official scorecard
// (club crest, user-confirmed authentic), superseding two earlier
// conflicting screenshots entirely — this is a third, different tee
// set (White/Green/Bronze) with its own Par/Rating/Slope, not a
// resolution in favor of either previous guess. No gender split is
// shown on this card at all (one shared Par/SI column for everyone),
// unlike every other course here.
// One real wrinkle this model can't fully capture: hole 11's Par
// differs BY TEE, not by gender — Par 5 from White/Green, Par 4 from
// the shorter Bronze tee (that's why White/Green total 72 but Bronze
// totals 71). Since holes[] only splits Par by rating-set (men/women),
// not by which specific tee within a gender, hole 11 is recorded as
// Par 5 (matching White/Green) — a Bronze-tee golfer's Stableford on
// that one hole will be computed a stroke off from their tee's actual
// par until the model supports per-tee par.
const CUP_ROYAL_PORTRUSH_HOLES = [
  { num: 1, parMen: 4, siMen: 7, parWomen: 4, siWomen: 7 },
  { num: 2, parMen: 5, siMen: 13, parWomen: 5, siWomen: 13 },
  { num: 3, parMen: 3, siMen: 17, parWomen: 3, siWomen: 17 },
  { num: 4, parMen: 4, siMen: 1, parWomen: 4, siWomen: 1 },
  { num: 5, parMen: 4, siMen: 15, parWomen: 4, siWomen: 15 },
  { num: 6, parMen: 3, siMen: 11, parWomen: 3, siWomen: 11 },
  { num: 7, parMen: 5, siMen: 5, parWomen: 5, siWomen: 5 },
  { num: 8, parMen: 4, siMen: 9, parWomen: 4, siWomen: 9 },
  { num: 9, parMen: 4, siMen: 3, parWomen: 4, siWomen: 3 },
  { num: 10, parMen: 4, siMen: 16, parWomen: 4, siWomen: 16 },
  { num: 11, parMen: 5, siMen: 8, parWomen: 5, siWomen: 8 }, // Par 4 from the Bronze tee — see note above
  { num: 12, parMen: 5, siMen: 12, parWomen: 5, siWomen: 12 },
  { num: 13, parMen: 3, siMen: 18, parWomen: 3, siWomen: 18 },
  { num: 14, parMen: 4, siMen: 2, parWomen: 4, siWomen: 2 },
  { num: 15, parMen: 4, siMen: 10, parWomen: 4, siWomen: 10 },
  { num: 16, parMen: 3, siMen: 4, parWomen: 3, siWomen: 4 },
  { num: 17, parMen: 4, siMen: 14, parWomen: 4, siWomen: 14 },
  { num: 18, parMen: 4, siMen: 6, parWomen: 4, siWomen: 6 },
];
const CUP_COURSES = {
  // Portmarnock's "Red + Blue Nine" routing (see CUP_PORTMARNOCK_HOLES
  // above) is now confirmed from two independent sources: the
  // competition scorecard used for its per-hole Par/SI, and this
  // handicap-calculator app's own course entry "Portmarnock Golf Club /
  // Red", whose tee list includes matching "- Red/Blue" suffixed tees
  // at the same Par 72 total. Only kept the "- Red/Blue" tees, not the
  // app's unsuffixed Blue/White/Green/Yellow entries — those likely
  // represent a different nine-pairing we don't have hole-by-hole data
  // for, so mixing them in here would apply the wrong Stroke Index
  // allocation. Women's Par varies by tee here (72/73) in a way that
  // isn't reflected per-hole (CUP_PORTMARNOCK_HOLES currently mirrors
  // men's Par for women on every hole) since the exact hole(s) that
  // reclassify aren't known — Course Handicap is accurate, per-hole
  // Stableford for a women's-tee golfer is an approximation until that's
  // pinned down.
  aug2: {
    name: 'Portmarnock Golf Club — Red + Blue Nine',
    holes: CUP_PORTMARNOCK_HOLES,
    tees: [
      { id: 'blue-red-blue', name: 'Blue', yardage: 7470, ratingMen: 77.1, slopeMen: 143, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'white-red-blue', name: 'White', yardage: 6941, ratingMen: 74.7, slopeMen: 137, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'green-red-blue', name: 'Green', yardage: 6691, ratingMen: 73.6, slopeMen: 135, parMen: 72, ratingWomen: 79.9, slopeWomen: 147, parWomen: 73 },
      { id: 'yellow-red-blue', name: 'Yellow', yardage: 5828, ratingMen: 69.5, slopeMen: 125, parMen: 72, ratingWomen: 74.9, slopeWomen: 136, parWomen: 72 },
    ]
  },
  aug3: {
    name: 'Royal County Down — Championship Course',
    holes: CUP_RCD_HOLES,
    tees: [
      { id: 'blue', name: 'Blue', yardage: 7206, ratingMen: 75.9, slopeMen: 145, parMen: 71, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'white', name: 'White', yardage: 6925, ratingMen: 74.8, slopeMen: 136, parMen: 71, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'yellow', name: 'Yellow', yardage: 6641, ratingMen: 73.5, slopeMen: 134, parMen: 71, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'green', name: 'Green', yardage: 6249, ratingMen: 71.6, slopeMen: 130, parMen: 71, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'red', name: 'Red', yardage: 6249, ratingMen: null, slopeMen: null, parMen: null, ratingWomen: 79.4, slopeWomen: 151, parWomen: 76 },
    ]
  },
  aug4: {
    name: 'Ardglass Golf Club',
    holes: CUP_ARDGLASS_HOLES,
    tees: [
      { id: 'white', name: 'White', yardage: 6268, ratingMen: 70.6, slopeMen: 118, parMen: 70, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'green', name: 'Green', yardage: 5814, ratingMen: 68.6, slopeMen: 114, parMen: 70, ratingWomen: 73.9, slopeWomen: 123, parWomen: 70 },
      { id: 'red', name: 'Red', yardage: 5344, ratingMen: 66.2, slopeMen: 106, parMen: 70, ratingWomen: 71.1, slopeWomen: 118, parWomen: 70 },
    ]
  },
  aug5: {
    name: 'Portstewart Golf Club — Strand Course',
    holes: CUP_PORTSTEWART_HOLES,
    tees: [
      { id: 'black', name: 'Black', yardage: 7043, ratingMen: 74.2, slopeMen: 131, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'black-temp', name: 'Black Temp', yardage: 6868, ratingMen: 73.2, slopeMen: 127, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'blue', name: 'Blue', yardage: 6604, ratingMen: 72.6, slopeMen: 127, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'blue-temp', name: 'Blue Temp', yardage: 6429, ratingMen: 71.5, slopeMen: 124, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'white', name: 'White', yardage: 6075, ratingMen: 69.5, slopeMen: 117, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'white-temp', name: 'White Temp', yardage: 5900, ratingMen: 68.7, slopeMen: 114, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'gold', name: 'Gold', yardage: 5730, ratingMen: 68.0, slopeMen: 112, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'red', name: 'Red', yardage: 5853, ratingMen: null, slopeMen: null, parMen: null, ratingWomen: null, slopeWomen: null, parWomen: 73 },
    ]
  },
  aug6: {
    name: 'Royal Portrush Golf Club — Dunluce Course',
    holes: CUP_ROYAL_PORTRUSH_HOLES,
    tees: [
      { id: 'white', name: 'White', yardage: 6705, ratingMen: 76.0, slopeMen: 139, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'green', name: 'Green', yardage: 6476, ratingMen: 72.4, slopeMen: 131, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'bronze', name: 'Bronze', yardage: 6097, ratingMen: 69.5, slopeMen: 122, parMen: 71, ratingWomen: null, slopeWomen: null, parWomen: null },
    ]
  },
  aug7: {
    name: 'The Royal Dublin Golf Club',
    // Real Par + Stroke Index for all 18 holes from the official card
    // (Blue/White/Yellow share one men's Par/SI column, Red has its
    // own women's column — verified both SI columns are clean 1-18
    // permutations and Par sums match the printed 72/74 totals).
    holes: CUP_ROYAL_DUBLIN_HOLES,
    // NOTE: the handicap-calculator app's tee names (Black/White/
    // Shamrock A/Shamrock B/Blue/Green) don't match the scorecard's
    // own names (Blue/White/Yellow/Red) for what look like the same
    // physical tees by yardage — kept each source's own naming rather
    // than guess a mapping. Par/SI above applies to all of them since
    // it's a course-and-hole property, not tee-specific. No women's
    // Rating/Slope was found for the Red tee, only its Par/yardage
    // from the scorecard.
    tees: [
      { id: 'black', name: 'Black', yardage: 7289, ratingMen: 76.2, slopeMen: 139, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'white', name: 'White', yardage: 6925, ratingMen: 74.6, slopeMen: 134, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'shamrock-a', name: 'Shamrock A', yardage: 6720, ratingMen: 73.6, slopeMen: 131, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'shamrock-b', name: 'Shamrock B', yardage: 6689, ratingMen: 73.5, slopeMen: 134, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'blue', name: 'Blue', yardage: 6484, ratingMen: 72.4, slopeMen: 131, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'green', name: 'Green', yardage: 5511, ratingMen: 67.7, slopeMen: 122, parMen: 72, ratingWomen: null, slopeWomen: null, parWomen: null },
      { id: 'red', name: 'Red', yardage: 5987, ratingMen: null, slopeMen: null, parMen: null, ratingWomen: null, slopeWomen: null, parWomen: 74 },
    ]
  },
};

// ============================================================
// DEFAULTS / HYDRATE
// ============================================================
function cupDefaults() {
  const golferProfiles = {};
  CUP_GOLFER_IDS.forEach(pid => {
    golferProfiles[pid] = {
      handicapIndex: CUP_SEED_HANDICAPS[pid] !== undefined ? CUP_SEED_HANDICAPS[pid] : null,
      ratingSet: pid === 'elizabeth' ? 'women' : 'men'
    };
  });
  return {
    teams: { A: { name: 'The Fescue' }, B: { name: 'The Claret' } },
    players: [
      { id: 'george', personId: 'george', seat: false, team: 'A' },
      { id: 'eric', personId: 'eric', seat: false, team: 'A' },
      { id: 'jeff', personId: 'jeff', seat: false, team: 'A' },
      { id: 'phil', personId: 'phil', seat: false, team: 'B' },
      { id: 'robert', personId: 'robert', seat: false, team: 'B' },
      { id: 'seat', personId: null, seat: true, team: 'B' },
    ],
    rounds: [
      { id: 'r30', game: '30 Scores', dayId: null, items: [
        { id: 'i1', name: 'Team match — lowest total of 30 net scores', value: 2, state: null }] },
      { id: 'grivey', game: 'Grivey', dayId: null, items: [
        { id: 'g1', name: 'Low individual net', value: 1, state: null },
        { id: 'g2', name: 'Low team — best 2 net of 3', value: 1, state: null },
        { id: 'g3', name: 'Most team skins', value: 1, state: null },
        { id: 'g4', name: 'Most team KPs', value: 1, state: null }] },
      { id: 'draw', game: 'Random Draw', dayId: null, items: [
        { id: 'd1', name: 'Net best-ball match — high + low', value: 1, state: null },
        { id: 'd2', name: 'Mids — 1 v 1', value: 1, state: null }] },
      { id: 'pick', game: 'Pick a Player', dayId: null, items: [
        { id: 'k1', name: 'Match 1', value: 1, state: null },
        { id: 'k2', name: 'Match 2', value: 1, state: null },
        { id: 'k3', name: 'Match 3', value: 1, state: null }] },
      { id: 'twovone', game: '2 v 1', dayId: null, items: [
        { id: 't1', name: 'Match 1', value: 1, state: null },
        { id: 't2', name: 'Match 2', value: 1, state: null },
        { id: 't3', name: 'Match 3', value: 1, state: null },
        { id: 't4', name: 'Match 4', value: 1, state: null }] },
      { id: 'match', game: 'Match Play — the 4 & 2 day', dayId: null, items: [
        { id: 'm1', name: 'Singles 1 — the four', value: 1, state: null },
        { id: 'm2', name: 'Singles 2 — the four', value: 1, state: null },
        { id: 'm3', name: 'Singles 3 — the pair', value: 1, state: null }] }
    ],
    stableford: {},
    golferProfiles,
    teeSelections: {},
    groups: {},
    holeScores: {},
    matchups: {}
  };
}

function cupHydrate(saved) {
  const out = cupDefaults();
  if (!saved) return out;
  if (saved.teams) out.teams = saved.teams;
  if (saved.stableford) out.stableford = saved.stableford;
  if (Array.isArray(saved.players)) {
    saved.players.forEach(sp => { const p = out.players.find(x => x.id === sp.id); if (p && sp.team) p.team = sp.team; });
  }
  if (Array.isArray(saved.rounds)) {
    saved.rounds.forEach(sr => {
      const r = out.rounds.find(x => x.id === sr.id); if (!r) return;
      if (sr.dayId !== undefined) r.dayId = sr.dayId;
      (sr.items || []).forEach(si => { const it = r.items.find(x => x.id === si.id); if (it) it.state = si.state; });
    });
  }
  if (saved.golferProfiles) {
    Object.keys(saved.golferProfiles).forEach(pid => {
      if (!out.golferProfiles[pid]) return;
      const sp = saved.golferProfiles[pid] || {};
      // A saved null means nobody ever typed one in — let the seeded
      // handicap show through rather than blanking it out.
      if (sp.handicapIndex != null) out.golferProfiles[pid].handicapIndex = sp.handicapIndex;
      if (sp.ratingSet) out.golferProfiles[pid].ratingSet = sp.ratingSet;
    });
  }
  if (saved.teeSelections) out.teeSelections = saved.teeSelections;
  if (saved.groups) out.groups = saved.groups;
  if (saved.holeScores) out.holeScores = saved.holeScores;
  if (saved.matchups) out.matchups = saved.matchups;
  return out;
}

const cupFmt = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
const cupTeamName = t => state.cup.teams[t] ? state.cup.teams[t].name : ('Team ' + t);

// ---------- handicap notation ----------
// Golf writes a better-than-scratch handicap as "+0.6" but the maths needs
// -0.6, so the sign flips between what people read and what we store. These
// three keep that conversion in one place: parse takes GHIN notation in,
// the two formatters put GHIN notation back on screen.
function cupParseHcp(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return null;
  const m = s.match(/^([+-]?)\s*(\d+(?:\.\d+)?)$/);
  if (!m) return NaN;
  const n = Number(m[2]);
  return m[1] === '+' ? -n : n;
}
function cupFmtHcp(v) {
  if (v == null) return '';
  return v < 0 ? '+' + cupFmt(Math.abs(v)) : cupFmt(v);
}
function cupFmtCourseHcp(v) {
  return v == null ? '—' : cupFmtHcp(v);
}

// ============================================================
// ROSTER RESOLUTION — Seat alternates Gary / Elizabeth by round
// ============================================================
function cupSeatGolferForDay(dayId) {
  const day = DAYS.find(d => d.id === dayId);
  if (!day || !day.golf) return null;
  if (day.golf.golfers.includes('gary')) return 'gary';
  if (day.golf.golfers.includes('elizabeth')) return 'elizabeth';
  return null;
}
function cupResolvedPerson(playerId, dayId) {
  const p = state.cup.players.find(x => x.id === playerId);
  if (!p) return null;
  return p.personId || (p.seat ? cupSeatGolferForDay(dayId) : null);
}

// ============================================================
// HANDICAP MATHS
// ============================================================
// WHS Course Handicap = round(Handicap Index x (Slope/113) + (Course Rating - Par))
// Rating/Slope/Par all come from the golfer's tee + rating set (men's/
// women's) — Ardglass's Green tee, for instance, is Par 71 for men but
// Par 72 for women off the same physical tee, so Par has to be looked
// up per tee+gender, not assumed to be one course-wide number.
function cupCourseHandicap(hi, tee, ratingSet) {
  if (hi == null || hi === '' || !tee) return null;
  const rating = ratingSet === 'women' ? tee.ratingWomen : tee.ratingMen;
  const slope = ratingSet === 'women' ? tee.slopeWomen : tee.slopeMen;
  const par = ratingSet === 'women' ? tee.parWomen : tee.parMen;
  if (rating == null || slope == null || par == null) return null;
  return Math.round(Number(hi) * (slope / 113) + (rating - par));
}
function cupTeeIsRatedFor(tee, ratingSet) {
  const rating = ratingSet === 'women' ? tee.ratingWomen : tee.ratingMen;
  const slope = ratingSet === 'women' ? tee.slopeWomen : tee.slopeMen;
  const par = ratingSet === 'women' ? tee.parWomen : tee.parMen;
  return rating != null && slope != null && par != null;
}
// Which tee a golfer is on if they haven't picked one. Not simply the
// first tee: several courses list their back tees with men's ratings
// only, so a women's-tee golfer defaulted there would silently get no
// Course Handicap at all. Prefer the first tee actually rated for them.
function cupDefaultTeeFor(course, ratingSet) {
  return course.tees.find(t => cupTeeIsRatedFor(t, ratingSet)) || course.tees[0];
}
function cupTeeFor(personId, dayId) {
  const course = CUP_COURSES[dayId]; if (!course || !personId) return null;
  const profile = state.cup.golferProfiles[personId] || {};
  const ratingSet = profile.ratingSet || 'men';
  const teeId = state.cup.teeSelections[dayId] && state.cup.teeSelections[dayId][personId];
  return course.tees.find(t => t.id === teeId) || cupDefaultTeeFor(course, ratingSet);
}
function cupCourseHandicapFor(personId, dayId) {
  const course = CUP_COURSES[dayId]; if (!course || !personId) return null;
  const profile = state.cup.golferProfiles[personId];
  if (!profile || profile.handicapIndex == null || profile.handicapIndex === '') return null;
  return cupCourseHandicap(profile.handicapIndex, cupTeeFor(personId, dayId), profile.ratingSet || 'men');
}
// Strokes received on a given hole from a Course Handicap + that hole's Stroke Index.
// Handles the >18 overflow (2nd stroke on hardest holes) and plus-handicap give-back
// (subtract on easiest holes, working in from Stroke Index 18) symmetrically.
function cupStrokesForHole(ch, si) {
  if (ch == null || si == null) return 0;
  if (ch >= 0) {
    const base = Math.floor(ch / 18);
    const extra = ch % 18;
    return base + (si <= extra ? 1 : 0);
  }
  const pos = -ch;
  const base = Math.floor(pos / 18);
  const extra = pos % 18;
  return -(base + (si > (18 - extra) ? 1 : 0));
}
function cupStablefordPoints(par, net) {
  const diff = net - par;
  if (diff >= 2) return 0;
  if (diff === 1) return 1;
  if (diff === 0) return 2;
  if (diff === -1) return 3;
  if (diff === -2) return 4;
  return 5;
}
function cupHoleScoresFor(personId, dayId) {
  return (state.cup.holeScores[dayId] && state.cup.holeScores[dayId][personId]) || {};
}
// Live net-Stableford total from whatever holes have a gross score entered so far.
function cupAutoStablefordForPerson(personId, dayId) {
  if (!personId) return null;
  const course = CUP_COURSES[dayId]; if (!course) return null;
  const scores = cupHoleScoresFor(personId, dayId);
  const enteredHoles = Object.keys(scores).filter(h => scores[h] != null && scores[h] !== '');
  if (!enteredHoles.length) return null;
  const ch = cupCourseHandicapFor(personId, dayId);
  const profile = state.cup.golferProfiles[personId] || {};
  let total = 0;
  enteredHoles.forEach(hNum => {
    const hole = course.holes.find(h => h.num === Number(hNum)); if (!hole) return;
    const isWomen = profile.ratingSet === 'women';
    const si = isWomen ? hole.siWomen : hole.siMen;
    const par = isWomen ? hole.parWomen : hole.parMen;
    const strokes = ch == null ? 0 : cupStrokesForHole(ch, si);
    const net = Number(scores[hNum]) - strokes;
    total += cupStablefordPoints(par, net);
  });
  return { total, thru: enteredHoles.length };
}
function cupAutoStablefordForRound(playerId, dayId) {
  return cupAutoStablefordForPerson(cupResolvedPerson(playerId, dayId), dayId);
}

// ============================================================
// AUTO-DERIVING CUP GAME RESULTS FROM HOLE DATA
// Once a round card is pinned to a calendar day ("Played on"), these
// compute a suggested A/B/½ result from entered hole scores. Results
// are surfaced as a suggestion with an Apply button next to the
// existing manual A/½/B toggle — never silently overwritten, since a
// dispute or local-rule nuance should stay a human call.
// ============================================================
function cupNetForHole(personId, dayId, holeNum) {
  const scores = cupHoleScoresFor(personId, dayId);
  const g = scores[holeNum];
  if (g == null || g === '') return null;
  const course = CUP_COURSES[dayId];
  const hole = course.holes.find(h => h.num === holeNum);
  const ch = cupCourseHandicapFor(personId, dayId);
  const profile = state.cup.golferProfiles[personId] || {};
  const si = profile.ratingSet === 'women' ? hole.siWomen : hole.siMen;
  const strokes = ch == null ? 0 : cupStrokesForHole(ch, si);
  return Number(g) - strokes;
}
function cupNetStrokeTotal(personId, dayId) {
  const scores = cupHoleScoresFor(personId, dayId);
  let sum = 0, thru = 0;
  for (let h = 1; h <= 18; h++) {
    const g = scores[h];
    if (g == null || g === '') continue;
    sum += Number(g); thru++;
  }
  if (thru < 18) return null;
  return sum - (cupCourseHandicapFor(personId, dayId) || 0);
}
function cupTeamRosterForDay(team, dayId) {
  return state.cup.players.filter(p => p.team === team).map(p => cupResolvedPerson(p.id, dayId)).filter(Boolean);
}
// Straight net match play, hole by hole. winner is only decided once thru===18
// (no early-closeout detection) to keep the maths simple and unambiguous.
function cupMatchPlayResult(personA, personB, dayId) {
  if (!personA || !personB) return null;
  let holesA = 0, holesB = 0, thru = 0;
  for (let h = 1; h <= 18; h++) {
    const na = cupNetForHole(personA, dayId, h);
    const nb = cupNetForHole(personB, dayId, h);
    if (na == null || nb == null) continue;
    thru++;
    if (na < nb) holesA++; else if (nb < na) holesB++;
  }
  const winner = thru < 18 ? null : (holesA > holesB ? 'A' : holesB > holesA ? 'B' : 'T');
  return { holesA, holesB, thru, winner };
}
// Net best-ball: each side's hole score is the better of its two members' net scores.
function cupNetBestBallResult(pairA, pairB, dayId) {
  let holesA = 0, holesB = 0, thru = 0;
  for (let h = 1; h <= 18; h++) {
    const na = pairA.map(pid => cupNetForHole(pid, dayId, h)).filter(v => v != null);
    const nb = pairB.map(pid => cupNetForHole(pid, dayId, h)).filter(v => v != null);
    if (na.length < pairA.length || nb.length < pairB.length) continue;
    thru++;
    const bestA = Math.min(...na), bestB = Math.min(...nb);
    if (bestA < bestB) holesA++; else if (bestB < bestA) holesB++;
  }
  const winner = thru < 18 ? null : (holesA > holesB ? 'A' : holesB > holesA ? 'B' : 'T');
  return { holesA, holesB, thru, winner };
}
// Random Draw: rank each team's 3 by that day's net Stableford. High+low
// form a net best-ball side; the two mids play 1v1. Needs all 6 golfers
// complete (18 holes) — this game is meant to be scored after the round.
function cupRandomDrawResult(dayId) {
  const rosterA = cupTeamRosterForDay('A', dayId), rosterB = cupTeamRosterForDay('B', dayId);
  if (rosterA.length !== 3 || rosterB.length !== 3) return null;
  const rank = list => {
    const rows = list.map(pid => ({ pid, sf: cupAutoStablefordForPerson(pid, dayId) }));
    if (rows.some(r => !r.sf || r.sf.thru !== 18)) return null;
    return rows.sort((a, b) => b.sf.total - a.sf.total);
  };
  const rA = rank(rosterA), rB = rank(rosterB);
  if (!rA || !rB) return null;
  return {
    bestBall: cupNetBestBallResult([rA[0].pid, rA[2].pid], [rB[0].pid, rB[2].pid], dayId),
    mids: cupMatchPlayResult(rA[1].pid, rB[1].pid, dayId),
    highA: rA[0].pid, lowA: rA[2].pid, midA: rA[1].pid,
    highB: rB[0].pid, lowB: rB[2].pid, midB: rB[1].pid
  };
}
// Grivey: low individual net, low team (best 2 of 3 net), most team skins —
// all derivable from complete (18-hole) net stroke totals. KPs stay manual.
function cupSkinsForDay(dayId) {
  const day = DAYS.find(d => d.id === dayId);
  if (!day || !day.golf) return null;
  const golfers = day.golf.golfers;
  const skinsByGolfer = {}; golfers.forEach(pid => { skinsByGolfer[pid] = 0; });
  for (let h = 1; h <= 18; h++) {
    const nets = golfers.map(pid => ({ pid, net: cupNetForHole(pid, dayId, h) }));
    if (nets.some(x => x.net == null)) continue;
    const min = Math.min(...nets.map(x => x.net));
    const winners = nets.filter(x => x.net === min);
    if (winners.length === 1) skinsByGolfer[winners[0].pid]++;
  }
  return skinsByGolfer;
}
function cupGriveyAutoResults(dayId) {
  const rosterA = cupTeamRosterForDay('A', dayId), rosterB = cupTeamRosterForDay('B', dayId);
  if (rosterA.length !== 3 || rosterB.length !== 3) return null;
  const totals = {};
  for (const pid of [...rosterA, ...rosterB]) { totals[pid] = cupNetStrokeTotal(pid, dayId); if (totals[pid] == null) return null; }
  const all = [...rosterA.map(pid => ({ pid, team: 'A' })), ...rosterB.map(pid => ({ pid, team: 'B' }))].sort((a, b) => totals[a.pid] - totals[b.pid]);
  // A tie for the single lowest score only halves the point if the tied
  // golfers are on different teams — a same-team tie still wins it outright.
  const tiedForLow = totals[all[0].pid] === totals[all[1].pid];
  const lowIndiv = tiedForLow ? (all[0].team === all[1].team ? all[0].team : 'T') : all[0].team;
  const sum2 = roster => roster.map(pid => totals[pid]).sort((a, b) => a - b).slice(0, 2).reduce((a, b) => a + b, 0);
  const sA = sum2(rosterA), sB = sum2(rosterB);
  const lowTeam = sA === sB ? 'T' : (sA < sB ? 'A' : 'B');
  const skins = cupSkinsForDay(dayId);
  const skinsA = rosterA.reduce((a, pid) => a + skins[pid], 0), skinsB = rosterB.reduce((a, pid) => a + skins[pid], 0);
  const mostSkins = skinsA === skinsB ? 'T' : (skinsA > skinsB ? 'A' : 'B');
  return { lowIndiv, lowTeam, mostSkins, totals, skinsA, skinsB };
}

// ============================================================
// CUP MATHS (unchanged Ryder-Cup-style scoring)
// ============================================================
function cupTotals() {
  let A = 0, B = 0;
  state.cup.rounds.forEach(r => r.items.forEach(it => {
    if (it.state === 'A') A += it.value;
    else if (it.state === 'B') B += it.value;
    else if (it.state === 'T') { A += it.value / 2; B += it.value / 2; }
  }));
  return { A, B, undecided: CUP_TOTAL - A - B };
}
function cupRoundTotals(r) {
  let A = 0, B = 0;
  r.items.forEach(it => {
    if (it.state === 'A') A += it.value; else if (it.state === 'B') B += it.value;
    else if (it.state === 'T') { A += it.value / 2; B += it.value / 2; }
  });
  return { A, B };
}

// ============================================================
// CHAMPIONSHIP MATHS — prefers live hole data, falls back to manual entry
// ============================================================
// A round only counts toward ranking once it's either complete (18 holes
// live) or has a manual total — partial live rounds show in Live Scoring
// only, so an in-progress round can't distort the Championship standings.
function cupRoundRankPts(roundKey) {
  const dayId = CUP_ROUND_DAYS[roundKey];
  const rows = state.cup.players.map(p => {
    const personId = cupResolvedPerson(p.id, dayId);
    const auto = cupAutoStablefordForPerson(personId, dayId);
    if (auto) return auto.thru === 18 ? { id: p.id, v: auto.total } : null;
    const manual = state.cup.stableford[roundKey] && state.cup.stableford[roundKey][p.id];
    if (manual === undefined || manual === null || manual === '') return null;
    return { id: p.id, v: Number(manual) };
  }).filter(Boolean);
  rows.sort((a, b) => b.v - a.v);
  const out = {};
  let i = 0;
  while (i < rows.length) {
    let j = i; while (j + 1 < rows.length && rows[j + 1].v === rows[i].v) j++;
    let sum = 0; for (let k = i; k <= j; k++) sum += (RANK_PTS[k] || 0);
    const avg = sum / (j - i + 1);
    for (let k = i; k <= j; k++) out[rows[k].id] = avg;
    i = j + 1;
  }
  return out;
}
function cupSfTotals() {
  const totals = {}; const perRound = {};
  state.cup.players.forEach(p => { totals[p.id] = 0; perRound[p.id] = {}; });
  SF_ROUNDS.forEach(rk => {
    const pts = cupRoundRankPts(rk);
    state.cup.players.forEach(p => {
      const v = pts[p.id];
      perRound[p.id][rk] = (v === undefined ? null : v);
      if (v !== undefined) totals[p.id] += v;
    });
  });
  return { totals, perRound };
}

// ============================================================
// RENDER — scoreboard + Ryder Cup rounds
// ============================================================
function renderCupBoard() {
  const { A, B, undecided } = cupTotals();
  document.getElementById('cup-scoreA').textContent = cupFmt(A);
  document.getElementById('cup-scoreB').textContent = cupFmt(B);
  document.getElementById('cup-lblA').textContent = cupTeamName('A');
  document.getElementById('cup-lblB').textContent = cupTeamName('B');
  document.getElementById('cup-fillA').style.width = (A / CUP_TOTAL * 100) + '%';
  document.getElementById('cup-fillB').style.width = (B / CUP_TOTAL * 100) + '%';
  document.getElementById('cup-clinchA').style.left = (CUP_CLINCH / CUP_TOTAL * 100) + '%';

  let html;
  if (A >= CUP_CLINCH) html = `<span class="won a">${esc(cupTeamName('A'))} win the Cup</span>`;
  else if (B >= CUP_CLINCH) html = `<span class="won b">${esc(cupTeamName('B'))} win the Cup</span>`;
  else if (undecided <= 0 && A === B) html = `<span class="won halved">Cup halved — retained</span>`;
  else {
    const need = (CUP_CLINCH - Math.max(A, B));
    const lead = A === B ? 'All square' : (A > B ? `${esc(cupTeamName('A'))} lead` : `${esc(cupTeamName('B'))} lead`);
    html = `<b>${lead}</b> · ${cupFmt(undecided)} point${undecided === 1 ? '' : 's'} still to play · leader needs <b>${cupFmt(need)}</b> more to clinch`;
  }
  document.getElementById('cup-status').innerHTML = html;
}
function cupSegHTML(roundId, it) {
  const mk = (s, txt) => `<button type="button" data-s="${s}" class="${it.state === s ? 'on' : ''}" aria-pressed="${it.state === s}" data-round="${roundId}" data-item="${it.id}">${txt}</button>`;
  return `<div class="seg" role="group" aria-label="${esc(it.name)} result">${mk('A', 'A')}${mk('T', '½')}${mk('B', 'B')}</div>`;
}
function cupApplyBtn(roundId, itemId, suggestion) {
  if (!suggestion) return '';
  const label = suggestion === 'T' ? 'Halve' : cupTeamName(suggestion);
  return ` <button type="button" class="apply-btn" onclick="cupApplySuggestion('${roundId}','${itemId}','${suggestion}')">Apply: ${esc(label)}</button>`;
}
function cupApplySuggestion(roundId, itemId, s) {
  const r = state.cup.rounds.find(x => x.id === roundId); if (!r) return;
  const it = r.items.find(x => x.id === itemId); if (!it) return;
  it.state = s;
  renderCupBoard(); renderCupRounds();
  saveState(); syncKey('cup');
}
function cupSetRoundDay(roundId, dayId) {
  const r = state.cup.rounds.find(x => x.id === roundId); if (!r) return;
  r.dayId = dayId || null;
  saveState(); syncKey('cup');
  renderCupRounds();
}
function cupSetMatchup(itemId, side, val) {
  if (!state.cup.matchups[itemId]) state.cup.matchups[itemId] = { a: null, b: null };
  state.cup.matchups[itemId][side] = val || null;
  saveState(); syncKey('cup');
  renderCupRounds();
}
function cupMatchupPickerHtml(round, item, dayId) {
  const day = DAYS.find(d => d.id === dayId);
  const golfers = (day && day.golf) ? day.golf.golfers : [];
  const mu = state.cup.matchups[item.id] || { a: null, b: null };
  const opt = sel => `<option value="">Pick…</option>` + golfers.map(pid => `<option value="${pid}" ${sel === pid ? 'selected' : ''}>${esc(getParticipant(pid).name)}</option>`).join('');
  let resultHtml = '';
  if (mu.a && mu.b) {
    const res = cupMatchPlayResult(mu.a, mu.b, dayId);
    if (res && res.thru > 0) {
      resultHtml = res.thru < 18
        ? `${esc(getParticipant(mu.a).name)} ${res.holesA} – ${res.holesB} ${esc(getParticipant(mu.b).name)}, thru ${res.thru}`
        : `${esc(getParticipant(mu.a).name)} ${res.holesA} – ${res.holesB} ${esc(getParticipant(mu.b).name)} — final.${cupApplyBtn(round.id, item.id, res.winner)}`;
    } else resultHtml = 'No holes scored yet for this pairing.';
  }
  return `<div class="auto-hint matchup-row">
    <select onchange="cupSetMatchup('${item.id}','a',this.value)" aria-label="${esc(item.name)} player A">${opt(mu.a)}</select> vs
    <select onchange="cupSetMatchup('${item.id}','b',this.value)" aria-label="${esc(item.name)} player B">${opt(mu.b)}</select>
    <div style="margin-top:4px">${resultHtml}</div>
  </div>`;
}
function cupItemAutoHtml(round, item) {
  const dayId = round.dayId;
  if (round.id === 'r30' || round.id === 'pick') return '';
  if (!dayId) return `<div class="auto-hint">Pick the round above and this scores itself from the hole scores.</div>`;

  if (round.id === 'grivey') {
    if (item.id === 'g4') return `<div class="auto-hint">Closest to the pin — tap the winner yourself.</div>`;
    const g = cupGriveyAutoResults(dayId);
    if (!g) return `<div class="auto-hint">Ready once all six golfers have a full 18 holes entered.</div>`;
    if (item.id === 'g1') return `<div class="auto-hint">Lowest net total.${cupApplyBtn(round.id, item.id, g.lowIndiv)}</div>`;
    if (item.id === 'g2') return `<div class="auto-hint">Best two net scores of three.${cupApplyBtn(round.id, item.id, g.lowTeam)}</div>`;
    if (item.id === 'g3') return `<div class="auto-hint">${esc(cupTeamName('A'))} ${g.skinsA} skins · ${esc(cupTeamName('B'))} ${g.skinsB} skins.${cupApplyBtn(round.id, item.id, g.mostSkins)}</div>`;
  }
  if (round.id === 'draw') {
    const d = cupRandomDrawResult(dayId);
    if (!d) return `<div class="auto-hint">Ready once all six golfers have a full 18 holes entered.</div>`;
    if (item.id === 'd1') return `<div class="auto-hint">High + low best ball, ${d.bestBall.holesA}–${d.bestBall.holesB} thru ${d.bestBall.thru}.${cupApplyBtn(round.id, item.id, d.bestBall.winner)}</div>`;
    if (item.id === 'd2') return `<div class="auto-hint">Mids: ${esc(getParticipant(d.midA).name)} v ${esc(getParticipant(d.midB).name)}, ${d.mids.holesA}–${d.mids.holesB} thru ${d.mids.thru}.${cupApplyBtn(round.id, item.id, d.mids.winner)}</div>`;
  }
  if (round.id === 'match' || round.id === 'twovone') return cupMatchupPickerHtml(round, item, dayId);
  return '';
}
function renderCupRounds() {
  const dayOptions = Object.values(CUP_ROUND_DAYS);
  document.getElementById('cup-rounds').innerHTML = state.cup.rounds.map((r, idx) => {
    const tot = cupRoundTotals(r);
    const worth = r.items.reduce((a, b) => a + b.value, 0);
    const dayOpts = dayOptions.map(dId => `<option value="${dId}" ${r.dayId === dId ? 'selected' : ''}>${esc(COURSE_SHORT[dId] || dId)}</option>`).join('');
    const items = r.items.map(it => `
      <div class="item">
        <span class="lbl">${esc(it.name)}${it.value > 1 ? `<span class="worth">${it.value} pts</span>` : ''}</span>
        ${cupSegHTML(r.id, it)}
      </div>
      ${cupItemAutoHtml(r, it)}`).join('');
    const dayPickerHtml = (r.id === 'r30' || r.id === 'pick') ? '' : `<div class="round-day-row">
        <label for="round-day-${r.id}">Played on</label>
        <select id="round-day-${r.id}" onchange="cupSetRoundDay('${r.id}',this.value)">
          <option value="">Not assigned</option>${dayOpts}
        </select>
      </div>`;
    return `<div class="card">
      <header>
        <div class="gname"><span class="no">G${idx + 1}</span>${esc(r.game)}</div>
        <div class="rsub"><span class="pts">${cupFmt(tot.A)} – ${cupFmt(tot.B)}</span><span>of ${worth}</span></div>
      </header>
      ${dayPickerHtml}
      <div class="items">${items}</div>
    </div>`;
  }).join('');
}

// ============================================================
// RENDER — Championship standings + entry table
// ============================================================
function cupPlayerLabel(p) {
  return p.seat ? 'The Seat' : getParticipant(p.personId).name;
}
function renderCupStandings() {
  const { totals, perRound } = cupSfTotals();
  const ranked = state.cup.players.map(p => ({ p, t: totals[p.id] })).sort((a, b) => b.t - a.t);
  const top = ranked.length ? ranked[0].t : 0;
  document.getElementById('cup-standings').innerHTML = `<h3>Championship standings</h3>` + ranked.map((row, i) => {
    const counted = SF_ROUNDS.filter(rk => perRound[row.p.id][rk] !== null).length;
    const lead = (row.t === top && top > 0);
    return `<div class="stand-row ${lead ? 'lead' : ''}">
      <span class="rank">${i + 1}</span>
      <span class="who"><span class="dot ${row.p.team === 'A' ? 'a' : 'b'}"></span>${esc(cupPlayerLabel(row.p))}${row.p.seat ? '<span class="seat-tag">Seat</span>' : ''}</span>
      <span class="tot">${cupFmt(row.t)}<small>${counted}/6 rounds</small></span>
    </div>`;
  }).join('');
}
function renderCupSFTable() {
  const { perRound } = cupSfTotals();
  const head = `<thead><tr><th class="name">Player</th>` + SF_ROUNDS.map(r => `<th>${r}</th>`).join('') + `<th>Total</th></tr></thead>`;
  const body = '<tbody>' + state.cup.players.map(p => {
    let total = 0;
    const cells = SF_ROUNDS.map(rk => {
      const dayId = CUP_ROUND_DAYS[rk];
      const personId = cupResolvedPerson(p.id, dayId);
      const auto = cupAutoStablefordForPerson(personId, dayId);
      const pp = perRound[p.id][rk];
      if (pp !== null) total += pp;
      if (auto) {
        return `<td class="auto" data-round="${rk}">${cupFmt(auto.total)}<span class="src">thru ${auto.thru}${auto.thru === 18 ? '' : ' · live'}</span><span class="pp">${pp !== null ? '+' + cupFmt(pp) : ''}</span></td>`;
      }
      const raw = (state.cup.stableford[rk] && state.cup.stableford[rk][p.id] != null) ? state.cup.stableford[rk][p.id] : '';
      return `<td data-round="${rk}">
        <input type="number" inputmode="numeric" min="0" step="1" value="${raw}" data-round="${rk}" data-player="${p.id}" aria-label="${esc(cupPlayerLabel(p))} ${rk} Stableford">
        <span class="pp">${pp !== null ? '+' + cupFmt(pp) : ''}</span>
      </td>`;
    }).join('');
    return `<tr>
      <td class="name"><span class="dot" style="background:${p.team === 'A' ? 'var(--green)' : 'var(--rust)'}"></span>${esc(cupPlayerLabel(p))}</td>
      ${cells}<td class="tot">${cupFmt(total)}</td>
    </tr>`;
  }).join('') + '</tbody>';
  document.getElementById('cup-sfTable').innerHTML = head + body;
}

// ============================================================
// RENDER — Handicaps & Tees
// ============================================================
function renderCupHcpPanel() {
  const mount = document.getElementById('cup-hcp-mount');
  if (!mount) return;

  const golferRows = CUP_GOLFER_IDS.map(pid => {
    const p = getParticipant(pid);
    const prof = state.cup.golferProfiles[pid];
    return `<tr>
      <td class="name">${esc(p.name)}</td>
      <td><input type="text" inputmode="decimal" placeholder="—" value="${esc(cupFmtHcp(prof.handicapIndex))}"
        onchange="cupSetHandicapIndex('${pid}',this.value)" aria-label="${esc(p.name)} Handicap Index"></td>
      <td><select onchange="cupSetRatingSet('${pid}',this.value)" aria-label="${esc(p.name)} rating set">
        <option value="men" ${prof.ratingSet === 'men' ? 'selected' : ''}>Men's</option>
        <option value="women" ${prof.ratingSet === 'women' ? 'selected' : ''}>Women's</option>
      </select></td>
    </tr>`;
  }).join('');

  const roundBlocks = SF_ROUNDS.map(rk => {
    const dayId = CUP_ROUND_DAYS[rk];
    const day = DAYS.find(d => d.id === dayId);
    const course = CUP_COURSES[dayId];
    if (!day || !day.golf) return '';
    const rows = day.golf.golfers.map(pid => {
      const p = getParticipant(pid);
      const prof = state.cup.golferProfiles[pid] || {};
      const ratingSet = prof.ratingSet || 'men';
      const tee = cupTeeFor(pid, dayId);
      const ch = cupCourseHandicapFor(pid, dayId);
      const teeOptions = course.tees.map(t =>
        `<option value="${t.id}" ${t.id === tee.id ? 'selected' : ''}${cupTeeIsRatedFor(t, ratingSet) ? '' : ' disabled'}>${esc(t.name)}${cupTeeIsRatedFor(t, ratingSet) ? '' : ' — not rated'}</option>`).join('');
      const rating = ratingSet === 'women' ? tee.ratingWomen : tee.ratingMen;
      const slope = ratingSet === 'women' ? tee.slopeWomen : tee.slopeMen;
      const unrated = !cupTeeIsRatedFor(tee, ratingSet);
      return `<tr>
        <td class="name">${esc(p.name)}</td>
        <td><select onchange="cupSetTeeSelection('${dayId}','${pid}',this.value)" aria-label="${esc(p.name)} tee">${teeOptions}</select></td>
        <td>${rating != null ? rating.toFixed(1) : '—'} / ${slope != null ? slope : '—'}</td>
        <td class="hcp-ch ${ch != null && ch < 0 ? 'minus' : ''}">${unrated ? '<span class="hcp-unrated">no rating</span>' : cupFmtCourseHcp(ch)}</td>
      </tr>`;
    }).join('');
    return `<div class="hcp-round-block">
      <div class="hcp-round-title">${esc(day.date.replace(/\(.*\)/, '').trim())} — ${esc(course.name)}</div>
      <div class="hcp-table-wrap"><table class="hcp">
        <thead><tr><th>Golfer</th><th>Tee</th><th>Rating / Slope</th><th>Course HCP</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
  }).join('');

  mount.innerHTML = `
    <div class="hcp-table-wrap"><table class="hcp">
      <thead><tr><th>Golfer</th><th>Handicap Index</th><th>Rating set</th></tr></thead>
      <tbody>${golferRows}</tbody>
    </table></div>
    <div class="hcp-hint">Enter each index exactly as GHIN shows it — a better-than-scratch handicap is written with a plus, like +0.6.</div>
    ${roundBlocks}`;
}
function cupSetHandicapIndex(pid, val) {
  const parsed = cupParseHcp(val);
  if (Number.isNaN(parsed)) { renderCupHcpPanel(); return; } // unreadable — put the old value back
  state.cup.golferProfiles[pid].handicapIndex = parsed;
  saveState(); syncKey('cup');
  renderCupHcpPanel(); renderCupLivePanel(); renderCupStandings(); renderCupSFTable();
}
function cupSetRatingSet(pid, val) {
  state.cup.golferProfiles[pid].ratingSet = val;
  saveState(); syncKey('cup');
  renderCupHcpPanel(); renderCupLivePanel(); renderCupStandings(); renderCupSFTable();
}
function cupSetTeeSelection(dayId, pid, teeId) {
  if (!state.cup.teeSelections[dayId]) state.cup.teeSelections[dayId] = {};
  state.cup.teeSelections[dayId][pid] = teeId;
  saveState(); syncKey('cup');
  renderCupHcpPanel(); renderCupLivePanel(); renderCupStandings(); renderCupSFTable();
}

// ============================================================
// RENDER — Live Scoring (Golf-Genius-style hole-by-hole entry)
// ============================================================
let cupLiveView = { dayId: null, groupIdx: 0, hole: 1 };

// Groups default to an even 3/3 split, except where the day's format
// calls for something else: Royal County Down is the trip's "4 & 2 day"
// (the Match Play game is two singles in a group of four plus one in a
// pair), so it splits 4/2. Still editable per day via "move to Group N".
const CUP_GROUP_FIRST_SIZE = { aug3: 4 };
function cupDefaultGroups(dayId) {
  const day = DAYS.find(d => d.id === dayId);
  if (!day || !day.golf) return [[], []];
  const g = day.golf.golfers;
  const firstSize = CUP_GROUP_FIRST_SIZE[dayId] || 3;
  return [g.slice(0, firstSize), g.slice(firstSize)];
}
function cupGroupsForDay(dayId) {
  return (state.cup.groups[dayId] && state.cup.groups[dayId].length === 2) ? state.cup.groups[dayId] : cupDefaultGroups(dayId);
}
function cupSwapGroup(dayId, pid) {
  const groups = cupGroupsForDay(dayId).map(g => g.slice());
  const idx0 = groups[0].indexOf(pid);
  if (idx0 !== -1) { groups[0].splice(idx0, 1); groups[1].push(pid); }
  else { const idx1 = groups[1].indexOf(pid); if (idx1 !== -1) { groups[1].splice(idx1, 1); groups[0].push(pid); } }
  state.cup.groups[dayId] = groups;
  saveState(); syncKey('cup');
  renderCupLivePanel();
}
function cupSetLiveRound(dayId) { cupLiveView.dayId = dayId; cupLiveView.groupIdx = 0; cupLiveView.hole = 1; renderCupLivePanel(); }
function cupSetLiveGroup(idx) { cupLiveView.groupIdx = idx; renderCupLivePanel(); }
function cupSetLiveHole(n) { if (n < 1 || n > 18) return; cupLiveView.hole = n; renderCupLivePanel(); }

// Par for this golfer on this hole — the starting point every score
// is entered relative to.
function cupParFor(dayId, pid, hole) {
  const holeData = CUP_COURSES[dayId].holes.find(h => h.num === hole);
  const prof = state.cup.golferProfiles[pid] || {};
  return prof.ratingSet === 'women' ? holeData.parWomen : holeData.parMen;
}
function cupWriteGross(dayId, pid, hole, value) {
  if (!state.cup.holeScores[dayId]) state.cup.holeScores[dayId] = {};
  if (!state.cup.holeScores[dayId][pid]) state.cup.holeScores[dayId][pid] = {};
  state.cup.holeScores[dayId][pid][hole] = Math.max(1, value);
  saveState(); syncKey('cup');
  renderCupLivePanel(); renderCupStandings(); renderCupSFTable();
}
function cupAdjustGross(dayId, pid, hole, delta) {
  const cur = cupHoleScoresFor(pid, dayId)[hole];
  const start = (cur != null && cur !== '') ? Number(cur) : cupParFor(dayId, pid, hole);
  cupWriteGross(dayId, pid, hole, start + delta);
}
// Scores start showing par, so a par is a single tap to confirm rather
// than a +/- round trip. Deliberately NOT pre-written into state for
// every hole: "thru N" and the Championship standings only count holes
// actually entered, so scrolling ahead to look at hole 18 must not mark
// the round as played.
function cupConfirmPar(dayId, pid, hole) {
  cupWriteGross(dayId, pid, hole, cupParFor(dayId, pid, hole));
}
function cupClearGross(dayId, pid, hole) {
  if (state.cup.holeScores[dayId] && state.cup.holeScores[dayId][pid]) {
    delete state.cup.holeScores[dayId][pid][hole];
    saveState(); syncKey('cup');
    renderCupLivePanel(); renderCupStandings(); renderCupSFTable();
  }
}

function cupLiveLeaderboardHtml(dayId) {
  const day = DAYS.find(d => d.id === dayId);
  if (!day || !day.golf) return '';
  const rows = day.golf.golfers.map(pid => {
    const p = getParticipant(pid);
    const auto = cupAutoStablefordForPerson(pid, dayId);
    return { p, total: auto ? auto.total : 0, thru: auto ? auto.thru : 0 };
  }).sort((a, b) => b.total - a.total || b.thru - a.thru);
  return `<div class="live-leaderboard">
    <h3>Today's leaderboard — ${esc(COURSE_SHORT[dayId] || '')}</h3>
    ${rows.map((r, i) => `<div class="llb-row">
      <span class="rank">${i + 1}</span>
      <span>${esc(r.p.name)}</span>
      <span class="thru">${r.thru ? ('thru ' + r.thru) : '—'}</span>
      <span class="pts">${r.thru ? r.total + ' pts' : ''}</span>
    </div>`).join('')}
  </div>`;
}

function renderCupLivePanel() {
  const mount = document.getElementById('cup-live-mount');
  if (!mount) return;
  const roundDayIds = Object.values(CUP_ROUND_DAYS);
  if (!cupLiveView.dayId) cupLiveView.dayId = roundDayIds[0];
  const dayId = cupLiveView.dayId;
  const day = DAYS.find(d => d.id === dayId);
  const course = CUP_COURSES[dayId];

  const roundPicker = roundDayIds.map(dId =>
    `<button class="live-round-btn ${dId === dayId ? 'active' : ''}" onclick="cupSetLiveRound('${dId}')">${esc(COURSE_SHORT[dId] || dId)}</button>`
  ).join('');

  if (!day || !day.golf) { mount.innerHTML = `<div class="live-round-picker">${roundPicker}</div><div class="cup-note">No golf scheduled this day.</div>`; return; }

  const groups = cupGroupsForDay(dayId);
  const groupPicker = groups.map((g, i) => `<button class="live-group-btn ${i === cupLiveView.groupIdx ? 'active' : ''}" onclick="cupSetLiveGroup(${i})">
      Group ${i + 1}<small>${g.map(pid => getParticipant(pid).name).join(', ') || '—'}</small>
    </button>`).join('');

  const group = groups[cupLiveView.groupIdx] || groups[0];
  const hole = Math.min(Math.max(cupLiveView.hole, 1), 18);
  const holeData = course.holes.find(h => h.num === hole);

  const jumpStrip = course.holes.map(h => {
    const anyScored = group.some(pid => { const s = cupHoleScoresFor(pid, dayId)[h.num]; return s != null && s !== ''; });
    return `<button class="hole-jump-btn ${anyScored ? 'done' : ''} ${h.num === hole ? 'current' : ''}" onclick="cupSetLiveHole(${h.num})">${h.num}</button>`;
  }).join('');

  const otherGroupLabel = cupLiveView.groupIdx === 0 ? 'Grp 2' : 'Grp 1';
  const scoreRows = group.map(pid => {
    const p = getParticipant(pid);
    const prof = state.cup.golferProfiles[pid] || {};
    const ch = cupCourseHandicapFor(pid, dayId);
    const isWomen = prof.ratingSet === 'women';
    const si = isWomen ? holeData.siWomen : holeData.siMen;
    const par = isWomen ? holeData.parWomen : holeData.parMen;
    const strokes = ch == null ? 0 : cupStrokesForHole(ch, si);
    const scores = cupHoleScoresFor(pid, dayId);
    const gross = scores[hole];
    const hasGross = gross != null && gross !== '';
    const net = hasGross ? Number(gross) - strokes : null;
    const pts = net != null ? cupStablefordPoints(par, net) : null;
    const dots = strokes > 0 ? '<span class="stroke-dot"></span>'.repeat(Math.min(strokes, 3)) : '';
    // Unentered scores show par, greyed, as a one-tap confirm. Entered
    // scores are solid and tapping clears them back to unentered.
    const grossBtn = hasGross
      ? `<button type="button" class="lsr-gross" onclick="cupClearGross('${dayId}','${pid}',${hole})" title="Clear this score" aria-label="${esc(p.name)} scored ${gross}. Clear score">${gross}</button>`
      : `<button type="button" class="lsr-gross pending" onclick="cupConfirmPar('${dayId}','${pid}',${hole})" title="Tap to record par (${par})" aria-label="${esc(p.name)} — tap to record par, ${par}">${par}</button>`;
    return `<div class="live-score-row">
      <div class="lsr-name">
        <div class="n">${esc(p.name)}${dots}</div>
        <div class="meta">${ch != null ? 'HCP ' + cupFmtCourseHcp(ch) : (prof.handicapIndex != null ? 'Tee not rated' : 'Set handicap')} · <a href="#" onclick="cupSwapGroup('${dayId}','${pid}');return false;" title="Move ${esc(p.name)} to the other group">→ ${otherGroupLabel}</a></div>
      </div>
      <div class="lsr-stepper">
        <button type="button" onclick="cupAdjustGross('${dayId}','${pid}',${hole},-1)" aria-label="Decrease ${esc(p.name)}'s score">−</button>
        ${grossBtn}
        <button type="button" onclick="cupAdjustGross('${dayId}','${pid}',${hole},1)" aria-label="Increase ${esc(p.name)}'s score">+</button>
      </div>
      <div class="lsr-result">${pts != null ? `<b>${pts} pt${pts === 1 ? '' : 's'}</b>net ${net}` : '<span class="lsr-pending-hint">tap par</span>'}</div>
    </div>`;
  }).join('');

  mount.innerHTML = `
    <div class="live-round-picker">${roundPicker}</div>
    <div class="live-group-picker">${groupPicker}</div>
    <div class="hole-nav">
      <button class="hole-nav-btn" onclick="cupSetLiveHole(${hole - 1})" ${hole <= 1 ? 'disabled' : ''} aria-label="Previous hole">‹</button>
      <div class="hole-nav-mid">
        <div class="hole-nav-num">Hole ${hole}</div>
        <div class="hole-nav-meta">Par ${holeData.parMen}${holeData.parWomen !== holeData.parMen ? ' / ' + holeData.parWomen + ' (w)' : ''} · SI ${holeData.siMen}${holeData.siWomen !== holeData.siMen ? ' / ' + holeData.siWomen + ' (w)' : ''}</div>
      </div>
      <button class="hole-nav-btn" onclick="cupSetLiveHole(${hole + 1})" ${hole >= 18 ? 'disabled' : ''} aria-label="Next hole">›</button>
    </div>
    <div class="hole-nav-jump">${jumpStrip}</div>
    <div class="live-score-rows">${scoreRows}</div>
    ${cupLiveLeaderboardHtml(dayId)}`;
}

// ============================================================
// RENDER — Setup (teams & roster)
// ============================================================
function renderCupSetup() {
  document.getElementById('cup-teamAName').value = cupTeamName('A');
  document.getElementById('cup-teamBName').value = cupTeamName('B');
  document.getElementById('cup-playersSet').innerHTML = state.cup.players.map(p => `
    <div class="pset">
      <div style="font-weight:600;font-size:13.5px;display:flex;align-items:center">${esc(p.seat ? 'The Seat — Gary / Elizabeth alternate' : getParticipant(p.personId).name)}</div>
      <select class="txt" onchange="cupSetPlayerTeam('${p.id}',this.value)" aria-label="${esc(cupPlayerLabel(p))} team">
        <option value="A" ${p.team === 'A' ? 'selected' : ''}>Team A</option>
        <option value="B" ${p.team === 'B' ? 'selected' : ''}>Team B</option>
      </select>
    </div>`).join('');
}
function cupSetPlayerTeam(pid, team) {
  const p = state.cup.players.find(x => x.id === pid); if (!p) return;
  p.team = team;
  saveState(); syncKey('cup');
  renderCupBoard(); renderCupRounds(); renderCupStandings(); renderCupSFTable();
}

// ============================================================
// RENDER ALL
// ============================================================
function renderCupAll() {
  renderCupSetup();
  renderCupBoard();
  renderCupRounds();
  renderCupStandings();
  renderCupSFTable();
  renderCupHcpPanel();
  renderCupLivePanel();
}

// ============================================================
// INIT
// ============================================================
if (!SYNCED_KEYS.includes('cup')) SYNCED_KEYS.push('cup');
state.cup = cupHydrate(state.cup);

document.getElementById('cup-rounds').addEventListener('click', e => {
  const b = e.target.closest('.seg button'); if (!b) return;
  const r = state.cup.rounds.find(x => x.id === b.dataset.round); if (!r) return;
  const it = r.items.find(x => x.id === b.dataset.item); if (!it) return;
  it.state = (it.state === b.dataset.s) ? null : b.dataset.s;
  renderCupBoard(); renderCupRounds();
  saveState(); syncKey('cup');
});

document.getElementById('cup-sfTable').addEventListener('input', e => {
  const inp = e.target.closest('input'); if (!inp) return;
  const rk = inp.dataset.round, pid = inp.dataset.player;
  if (!state.cup.stableford[rk]) state.cup.stableford[rk] = {};
  const v = inp.value.trim();
  if (v === '') delete state.cup.stableford[rk][pid]; else state.cup.stableford[rk][pid] = Number(v);
  renderCupStandings();
  const { perRound } = cupSfTotals();
  document.querySelectorAll('#cup-sfTable tbody tr').forEach((tr, ri) => {
    const p = state.cup.players[ri]; let total = 0;
    tr.querySelectorAll('td[data-round]').forEach(td => {
      const pp = perRound[p.id][td.dataset.round];
      const hint = td.querySelector('.pp'); if (hint) hint.textContent = pp !== null ? ('+' + cupFmt(pp)) : '';
      if (pp !== null) total += pp;
    });
    const totCell = tr.querySelector('td.tot'); if (totCell) totCell.textContent = cupFmt(total);
  });
  saveState(); syncKey('cup');
});

document.getElementById('cup-teamAName').addEventListener('input', e => { state.cup.teams.A = { name: e.target.value || 'Team A' }; renderCupBoard(); saveState(); syncKey('cup'); });
document.getElementById('cup-teamBName').addEventListener('input', e => { state.cup.teams.B = { name: e.target.value || 'Team B' }; renderCupBoard(); saveState(); syncKey('cup'); });

document.getElementById('cup-resetBtn').addEventListener('click', () => {
  if (confirm('Reset all Cup results, Championship scores, handicaps, tee choices and hole scores? This clears them for everyone, not just you.')) {
    state.cup = cupDefaults();
    renderCupAll();
    saveState(); syncKey('cup');
  }
});

const CUP_SUBTABS = [['cup-subtab-ryder', 'cup-panel-ryder'], ['cup-subtab-sf', 'cup-panel-sf'], ['cup-subtab-hcp', 'cup-panel-hcp'], ['cup-subtab-live', 'cup-panel-live']];
CUP_SUBTABS.forEach(([tid, pid]) => {
  document.getElementById(tid).addEventListener('click', () => {
    CUP_SUBTABS.forEach(([t, p]) => {
      const sel = t === tid;
      document.getElementById(t).setAttribute('aria-selected', sel);
      document.getElementById(p).classList.toggle('active', sel);
    });
  });
});

renderCupAll();
