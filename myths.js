/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
electoral:[
 {k:'popular',s:'A candidate can win the presidency while getting fewer votes nationwide.',fact:true,why:'The winner needs 270 electoral votes, decided state by state. It happened in 1824, 1876, 1888, 2000 and 2016.'},
 {k:'equal',s:'Each state gets the same number of electoral votes.',fact:false,why:'A state gets one for each House seat plus two for its senators, so bigger states get more. Every state has at least 3, and DC has 3.'},
 {k:'all',s:'Every state gives all of its electoral votes to whoever wins that state.',fact:false,why:'48 states and DC do. Maine and Nebraska give two votes to the statewide winner and one to the winner of each congressional district.'}
]
});
