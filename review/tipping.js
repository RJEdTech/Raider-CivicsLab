BioLab.addReview({
tipping:{
 questions:[
  {id:'ladder',kind:'real',lvl:'bio',
   q:'A club of 100 has thresholds 0, 1, 2, 3 … 99. How many rounds does it take for everyone to sign up?',
   num:{ans:100,tol:0,unit:'rounds'},
   steps:['Round 1: the person with threshold 0 signs up. 1 has joined.','Round 2: the person with threshold 1 signs up. 2 have joined.','Each round adds exactly one person, so it takes 100 rounds to reach all 100.'],
   lab:{set:{crowd:'ladder',starters:0},act:'end',look:'Read <b>Signed up so far</b> and <b>Rounds</b>.'},verify:[['joined',100,0],['round',100,0]]},
  {id:'gap',kind:'test',lvl:'bio',
   q:'Thresholds 0, 2, 2, 3, 4 … 99 (the person who needed 1 now needs 2). How many sign up?',
   choices:['1','2','99','100'],correct:0,
   steps:['Round 1: the person with threshold 0 signs up. 1 has joined.','Who has a threshold of 1 or less and has not joined? Nobody.','The chain stops at 1.'],
   lab:{set:{crowd:'gap',starters:0},act:'end',look:'Read <b>Signed up so far</b> and <b>Next person in line needs</b>.'},verify:[['joined',1,0],['next',2,0]]},
  {id:'firstmover',kind:'real',lvl:'bio',
   q:'In that stuck crowd, one more person decides to sign up no matter what. How many rounds until all 100 have signed up?',
   num:{ans:50,tol:0,unit:'rounds'},
   steps:['Thresholds are now 0, 0, 2, 2, 3, 4 … 98: two first movers.','Round 1: 2 join. That meets both people who need 2, so round 2 brings the count to 4. Then 6, 8, 10 …','Each round adds 2 people, so it takes 100 ÷ 2 = 50 rounds.'],
   lab:{set:{crowd:'gap',starters:1},act:'end',look:'Read <b>Signed up so far</b> and <b>Rounds</b>.'},verify:[['joined',100,0],['round',50,0]]},
  {id:'average',kind:'test',lvl:'honors',
   q:'Find the average threshold of the stuck crowd 0, 2, 2, 3, 4 … 99, to two decimal places.',
   num:{ans:49.51,tol:0.005,unit:'people'},
   steps:['The full ladder 0 + 1 + … + 99 = 99 × 100 ÷ 2 = 4,950.','Changing one threshold from 1 to 2 adds 1: the total is 4,951.','4,951 ÷ 100 = 49.51, against 49.50 for the ladder. The averages are almost equal; the outcomes are 1 and 100.'],
   lab:{set:{crowd:'gap',starters:0},look:'Read <b>Average threshold</b>.'},verify:[['avg',49.51,0.001]]},
  {id:'fixed',kind:'test',lvl:'honors',
   q:'A crowd has F(0) = 3, F(3) = 7, F(7) = 12 and F(12) = 12. Starting from nobody, where does the chain stop?',
   choices:['3','7','12','100'],correct:2,
   steps:['Start at x = 0. F(0) = 3, so 3 join.','F(3) = 7, then F(7) = 12.','F(12) = 12: the curve meets y = x, so the next round adds nobody. The chain stops at 12.']},
  {id:'bell',kind:'real',lvl:'ap',
   q:'Bell-shaped thresholds with an average of 25. How many sign up when the spread is 12, and when it is 12.5?',
   choices:['4 and 5','4 and 100','100 and 100','0 and 4'],correct:1,
   steps:['At a spread of 12 the chain reaches 4, and the next person needs 5.','At 12.5 a few more people have very low thresholds, so F(x) stays above y = x at every step.','The chain runs to all 100 in 13 rounds. The tipping spread lies between 12 and 12.5.'],
   lab:{set:{crowd:'bell',mu:25,sd:12.5,starters:0},act:'end',look:'Read <b>Signed up so far</b>, then try a spread of 12.'},verify:[['joined',100,0],['round',13,0]]}
 ]
}
});
