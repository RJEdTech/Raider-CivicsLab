BioLab.addReview({
seatsvotes:{
 questions:[
  {id:'share',kind:'test',lvl:'bio',q:'A party won 411 of the 650 seats. What percent of the seats is that, to one decimal place?',num:{ans:63.2,tol:0.1,unit:'%'},
   steps:['411 ÷ 650 = 0.632.','× 100 = 63.2%.'],lab:{set:{reveal:true,sys:'fptp'},look:'Read <b>Party A’s share of seats</b>.'}},
  {id:'gap',kind:'test',lvl:'bio',q:'That party won 33.7% of the votes and 63.2% of the seats. How many percentage points more seats than votes?',num:{ans:29.5,tol:0.1,unit:'points'},
   steps:['63.2 − 33.7 = 29.5 percentage points.']},
  {id:'partyd',kind:'real',lvl:'bio',q:'A party won 14.3% of the votes but only 5 seats. What is the best explanation?',choices:['Its votes were not counted','Its votes were spread out, so it rarely came first in any district','It ran in only 5 districts'],correct:1,
   steps:['In single-member districts only first place wins a seat.','Many second and third places add up to votes but not seats.']},
  {id:'rule',kind:'real',lvl:'bio',q:'Your club votes for 3 officers. Why agree on the voting rule before anyone votes?',choices:['It does not matter','The same ballots can produce different winners under different rules','Rules only matter for countries'],correct:1,
   steps:['Different rules turn the same votes into different results.','Agreeing first keeps the result fair to everyone.']},
  {id:'dhondt',kind:'test',lvl:'honors',q:'D’Hondt: Party X has 40,000 votes and 1 seat; Party Y has 25,000 votes and 0 seats. Who gets the next seat?',choices:['X: 40,000 ÷ 2 = 20,000','Y: 25,000 ÷ 1 = 25,000 is larger','They tie'],correct:1,
   steps:['Compare votes ÷ (seats + 1).','X: 40,000 ÷ 2 = 20,000. Y: 25,000 ÷ 1 = 25,000.','Y’s is larger, so Y gets the seat.']},
  {id:'mixed',kind:'test',lvl:'honors',q:'Russia elects 225 Duma members in districts and 225 from party lists. What fraction comes from lists?',choices:['One quarter','One half','Three quarters'],correct:1,
   steps:['225 of 450 = ½.']},
  {id:'gall',kind:'ap',lvl:'ap',q:'Two parties: votes 60% and 40%, seats 80% and 20%. What is the Gallagher index?',num:{ans:20,tol:0.1,unit:''},
   steps:['Gaps: 60 − 80 = −20 and 40 − 20 = 20.','Squares: 400 + 400 = 800. Half: 400.','√400 = 20.']}
 ]
}
});
