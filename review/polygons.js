BioLab.addReview({
polygons:{
 questions:[
  {id:'settle33',kind:'real',lvl:'bio',
   q:'In the starting town, every shape wants at least 33% of its neighbors to be like it, and the town begins mixed at about 50%. Where does it settle?',
   choices:['About 33%','About 50%','About 77%','100%'],correct:2,
   steps:['Unhappy shapes move to random empty lots. Each move can leave a former neighbor outnumbered, so more shapes become unhappy and move.','The chain stops only when every shape has at least 1 in 3 neighbors like it.','In this town that takes 9 rounds and ends at about 77% same-type neighbors: far above the 33% anyone asked for.'],
   lab:{set:{bias:33,start:'mixed',hi:100},act:'end',look:'Read <b>Same-type neighbors</b> and <b>Rounds of moving</b>.'},verify:[['seg',76.72,0.05],['round',9,0]]},
  {id:'count8',kind:'test',lvl:'bio',
   q:'A shape has 8 neighbors. With a 33% bias, what is the fewest neighbors like it that keep it happy?',
   choices:['2','3','4','6'],correct:1,
   steps:['2 of 8 is 25%, which is below 33%, so 2 is not enough.','3 of 8 is 37.5%, which is at least 33%.','So it needs 3 like it, and it is happy with 5 of its 8 neighbors different.']},
  {id:'edge',kind:'test',lvl:'honors',
   q:'A square on the edge of town has 5 occupied neighbor lots: 4 squares and 1 triangle. The bias is 33% and the variety limit is 75%. Is it happy?',
   choices:['Happy: 80% is above 33%','Unhappy: 80% is above the 75% limit','Unhappy: 20% is below 33%'],correct:1,
   steps:['Same-type share = 4 ÷ 5 = 80%.','80% is above the 33% bias, so the bias is satisfied.','But 80% is above the 75% variety limit, so the square is unhappy and will move.']},
  {id:'remember',kind:'real',lvl:'honors',
   q:'Start from the separated town (77% same-type neighbors) and turn the bias down to 0%. After the town settles, what is its segregation index?',
   num:{ans:77,tol:1,unit:'%'},
   steps:['With a 0% bias and no variety limit, no shape can be unhappy.','Nobody moves, so the town stays exactly where it was: about 77%.','Taking away the bias does not take away the lines it drew. That is path dependence.'],
   lab:{set:{start:'split',bias:0,hi:100},act:'end',look:'Read <b>Same-type neighbors</b> and <b>Rounds of moving</b>.'},verify:[['seg',76.72,0.05],['round',0,0]]},
  {id:'variety',kind:'real',lvl:'honors',
   q:'Start from the separated town. Keep the 33% bias and set the variety limit to 95%, so a shape is also unhappy when every neighbor is like it. About where does the town end up?',
   choices:['About 77%: nothing changes','About 60%','About 40%'],correct:1,
   steps:['Every shape with only same-type neighbors (a third of the town) is now unhappy and moves.','Landing at random spots spreads them out, and the index falls fast.','After 150 rounds the town sits at about 60%, with a few shapes still moving. The share with no unlike neighbor drops from 33% to under 1%.'],
   lab:{set:{start:'split',bias:33,hi:95},act:'end',look:'Read <b>Same-type neighbors</b> and <b>Shapes with no neighbor unlike them</b>.'},verify:[['seg',59.84,0.05]]},
  {id:'index',kind:'test',lvl:'ap',
   q:'Three shapes: one has 2 of 4 neighbors like it, one has 3 of 3, and one has 1 of 5. What is their segregation index (the average same-type share), to the nearest 0.1%?',
   num:{ans:56.7,tol:0.1,unit:'%'},
   steps:['Shares: 2 ÷ 4 = 50%, 3 ÷ 3 = 100%, 1 ÷ 5 = 20%.','Average: (50 + 100 + 20) ÷ 3 = 170 ÷ 3.','≈ 56.7%. Each shape counts equally, however many neighbors it has.']},
  {id:'bias50',kind:'real',lvl:'ap',
   q:'Raise the bias to 50%: every shape wants at least half its neighbors like it. Starting from the mixed town, where does it settle?',
   choices:['About 50%','About 77%','About 87%','100%'],correct:2,
   steps:['At the start, 42% of shapes are unhappy, far more than at 33%.','The moves chain for 17 rounds.','The town settles at about 87%, and 59% of shapes end with no neighbor of the other type.'],
   lab:{set:{bias:50,start:'mixed',hi:100},act:'end',look:'Read <b>Same-type neighbors</b>, then open the graph <b>Where the town settles, for every bias</b>.'},verify:[['seg',87.14,0.05],['round',17,0],['alike',58.89,0.05]]}
 ]
}
});
