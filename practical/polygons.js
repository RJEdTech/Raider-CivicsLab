BioLab.addPractical({
polygons:{
 hook:'Every shape in this town is like a family that would gladly live on a block where 2 of every 3 neighbors are different from them. A shape moves only if fewer than 1 in 3 of its neighbors are like it. The town starts mixed at random. When everyone stops moving, what share of a typical shape’s neighbors are like it?',
 answer:'About 77%. The typical shape ends with about 6 of its 8 neighbors like it, up from 50% at the start, and a third of all shapes (33%) have no neighbor of the other type at all. No shape asked for more than 33%.',
 uses:[
  'Denver, 1938: the federal Home Owners’ Loan Corporation graded Denver’s neighborhoods for mortgage lending and shaded the lowest grade red. You can find your own neighborhood on the map at <a href="https://dsl.richmond.edu/panorama/redlining/#loc=12/39.71/-105.084&city=denver-co" target="_blank" rel="noopener">Mapping Inequality</a>; the Denver Public Library holds a copy.',
  'Your zip code as a proxy: in <i>Weapons of Math Destruction</i>, Cathy O’Neil shows how credit, insurance and policing models that use zip code can carry old neighborhood lines forward, even when they never ask about race.',
  'Your lunch table, your retreat group, your club: any group where people drift toward “enough of my people” runs on this arithmetic. What does the variety rule look like at your lunch table, retreat group or club?'
 ],
 takeaway:'Mild preferences can add up to strong separation, and the index is just the average of each shape’s share. In this model, dropping the bias did not mix the town back; only the variety rule did.'
}
});
