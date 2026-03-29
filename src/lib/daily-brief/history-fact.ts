const HISTORY_FACTS = [
  "Father Andrew White stepped into early Maryland in 1634 and wrote about shining rivers, thick woods, and the creatures moving through them. His careful notes gave us one of the first written windows into the colony's living landscape.",
  "Captain John Smith studied Chesapeake shorelines from a small boat, watching wind, channels, and muddy edges as he traveled. The map he made from those sharp observations helped people understand the bay for generations.",
  "Benjamin Banneker watched the night sky with homemade tools and used what he saw to guide serious mathematical work on the new federal city. His sky notes showed that patient outdoor observation could shape a nation.",
  "Thomas Harriot filled his notebooks with weather, stars, crops, and coastal life while English settlements were still new. Those pages captured how survival depended on noticing what the land and sky were doing each day.",
  "William Bartram moved through forests and wetlands with sketchbook in hand, pausing over birds, flowers, and riverbanks. His vivid drawings and descriptions turned wild places into scenes people could almost step inside.",
  "John Lawson walked long miles through the Carolina backcountry, writing down fish, trees, birds, and farming details as he went. His notes became one of the richest early records of how people lived with the natural world.",
  "John Clayton pressed Chesapeake plants into specimens and sent them across the Atlantic with careful field notes attached. His work helped build one of the earliest serious botanical records for this part of America.",
  "Meriwether Lewis packed his journals with weather readings, animal descriptions, and plant notes while crossing rough country. Because he kept writing even in hard conditions, the expedition became a science story as well as an exploration story.",
  "John James Audubon followed birds through swamps, forests, and river edges, trying to catch every pose and feather pattern on paper. His restless fieldwork helped people see American wildlife with new attention and wonder.",
  "Rachel Carson explored woods and streams as a girl, listening closely to birds and watching how water moved through a place. That habit of careful noticing later helped her change how the world talked about nature.",
  "Harriet Tubman learned the marshes and woods of Maryland's Eastern Shore so deeply that she could travel through them at night by stars, seasons, and hidden paths. Her knowledge of the land became a tool of courage and freedom.",
  "Chesapeake watermen and surveyors read tides, wind shifts, mud flats, and shoreline curves the way others read a book. That hard-earned skill turned daily work on the water into a living map of the bay."
];

export function getHistoryFactForDate(requestDate: string) {
  return HISTORY_FACTS[stableIndex(requestDate, HISTORY_FACTS.length)];
}

function stableIndex(seed: string, length: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}
