BioLab.addReview({
foodmath:{
 questions:[
  {id:'fam4',kind:'real',lvl:'bio',
   q:'ReFED: about 412 lb of surplus food per person per year, and 33.5% of surplus happens at home. About how many pounds of home surplus is that for a household of 5?',
   num:{ans:690,tol:2,unit:'lb'},
   steps:['Home surplus per person: 412 × 0.335 = 138.02 lb.','For 5 people: 138.02 × 5 = 690.1 lb.','About 690 lb a year.'],
   lab:{set:{family:5},act:'reveal',look:'Read <b>The household’s home surplus a year</b>.'},verify:[['home',690.1,0.2]]},
  {id:'prev30',kind:'test',lvl:'bio',
   q:'Out of 100 lb of surplus food, 33.5 lb happens at home. If homes prevented 30% of it, how many pounds of the 100 would be prevented?',
   num:{ans:10.05,tol:0.05,unit:'lb'},
   steps:['Prevented = 33.5 × 0.30.','= 10.05 lb of every 100.'],
   lab:{set:{prevent:30},act:'reveal',look:'Read <b>Prevented at home, of 100</b>.'},verify:[['prev',10.05,0.01]]},
  {id:'perlb',kind:'test',lvl:'honors',
   q:'ReFED values U.S. surplus food at $380B for 70 million tons (2,000 lb per ton). What is the average value per pound, to the nearest cent?',
   num:{ans:2.71,tol:0.01,unit:'$'},
   steps:['70 million tons × 2,000 = 140 billion lb.','$380B ÷ 140 billion lb ≈ $2.714.','About $2.71 a pound, on average across every stage.']},
  {id:'chain',kind:'test',lvl:'honors',
   q:'Prevent 20% at home, donate 10% of the rest of the surplus, then compost 50% of what is left. How many pounds of the 100.1 lb are kept out of landfill?',
   num:{ans:56.7,tol:0.1,unit:'lb'},
   steps:['Prevent: 33.5 × 0.20 = 6.70 lb.','Donate: (100.1 − 33.5) × 0.10 = 6.66 lb.','Left: 100.1 − 6.70 − 6.66 = 86.74 lb. Compost half: 43.37 lb.','Kept out of landfill counts all three: 6.70 + 6.66 + 43.37 = 56.73, about 56.7 lb.'],
   lab:{set:{prevent:20,donate:10,compost:50},act:'reveal',look:'Read <b>Pounds kept out of landfill</b> (Closer look).'},verify:[['kept',56.73,0.05]]},
  {id:'scale',kind:'real',lvl:'bio',
   q:'Your club has 30 lb of untouched, packaged snacks left after an event. Using EPA’s Wasted Food Scale, what is the best option still available?',
   choices:['Compost them','Donate them to a food pantry','Throw them away','Burn them'],correct:1,
   steps:['Prevention is no longer possible: the food already exists.','The next rung is donation, which feeds people.','Composting and landfill sit lower on the scale.']},
  {id:'usco2',kind:'test',lvl:'ap',
   q:'If U.S. homes prevented 40% of their surplus, about how many million metric tons of CO₂e would that avoid, using ReFED’s total of 219 MMT for all surplus?',
   num:{ans:29.3,tol:0.2,unit:'MMT'},
   steps:['Homes are 33.5 of 100.1 lb of surplus: 0.3347.','Prevented share of all surplus: 0.3347 × 0.40 ≈ 0.1339.','0.1339 × 219 ≈ 29.3 MMT CO₂e, at the average footprint.'],
   lab:{set:{prevent:40},act:'reveal',look:'Read <b>Whole U.S.: CO₂e avoided by preventing</b> (Deep dive).'},verify:[['usCO2',29.32,0.05]]}
 ]
}
});
