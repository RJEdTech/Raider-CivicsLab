BioLab.addReview({
margin:{
 questions:[
  {id:'state',kind:'real',lvl:'bio',
   q:'6 million people could vote. A reminder raises turnout by 0.4 percentage points. How many extra votes is that?',
   num:{ans:24000,tol:0,unit:'votes'},
   steps:['Turn points into a decimal: 0.4 ÷ 100 = 0.004.','Multiply: 0.004 × 6,000,000 = 24,000.','24,000 ÷ 537 ≈ 44.7, so that is about 45 times the 2000 Florida margin.'],
   lab:{set:{pop:6000000,effect:0.4,reveal:true},look:'Read <b>Extra votes from the nudge</b> and <b>Times the 537-vote margin</b>.'},verify:[['extra',24000,0.5],['times',44.69,0.01]]},
  {id:'small',kind:'test',lvl:'bio',
   q:'Among 1 million people who could vote, which is the smallest of these nudges that gives more than 537 extra votes?',
   choices:['0.01 points','0.1 points','1 point'],correct:1,
   steps:['0.01 points: 0.0001 × 1,000,000 = 100 votes. Not enough.','0.1 points: 0.001 × 1,000,000 = 1,000 votes. More than 537.','The break-even nudge is 537 ÷ 1,000,000 = 0.0537 points, so 0.1 points is the smallest choice that beats the margin.'],
   lab:{set:{pop:1000000,effect:0.1,reveal:true},look:'Read <b>Extra votes from the nudge</b>.'},verify:[['extra',1000,0.5]]},
  {id:'points',kind:'test',lvl:'bio',
   q:'A click rate goes from 18% to 20%. Which statement is correct?',
   choices:['It went up 2%','It went up 2 percentage points, about 11% relative to where it started','It went up 20%'],correct:1,
   steps:['Percentage points are the plain difference: 20 − 18 = 2 points.','Relative change: 2 ÷ 18 ≈ 0.111, about 11%.','Both are true, but they are different numbers. Saying “2%” is wrong either way.']},
  {id:'lean',kind:'real',lvl:'honors',
   q:'The 24,000 extra voters split 52% for side A and 48% for side B. How many votes does the margin between the sides move?',
   num:{ans:960,tol:0,unit:'votes'},
   steps:['Side A gains 0.52 × 24,000 = 12,480. Side B gains 0.48 × 24,000 = 11,520.','The margin moves by 12,480 − 11,520 = 960.','Shortcut: 24,000 × (2 × 0.52 − 1) = 24,000 × 0.04 = 960, which is more than 537.'],
   lab:{set:{pop:6000000,effect:0.4,lean:52,reveal:true},look:'Read <b>Change in the margin between the sides</b>.'},verify:[['net',960,0.5]]},
  {id:'facebook',kind:'real',lvl:'honors',
   q:'About 61 million users saw the 2010 message, and researchers estimated about 340,000 extra votes. About how many users per extra vote is that?',
   choices:['About 18','About 180','About 1,800'],correct:1,
   steps:['61,000,000 ÷ 340,000 ≈ 179.4.','So about 1 extra vote for every 180 users: roughly 0.56 extra votes per 100 users.','Tiny per person, but 340,000 votes is about 633 times the 537-vote Florida margin.']},
  {id:'z1000',kind:'test',lvl:'ap',
   q:'Two groups of 1 million: 18.0% vs 18.4%. Find z for the difference, to one decimal place.',
   num:{ans:7.3,tol:0.1,unit:''},
   steps:['Pooled rate p̄ = 0.182.','Standard error = √(0.182 × 0.818 × 2 ÷ 1,000,000) ≈ 0.000546.','z = 0.004 ÷ 0.000546 ≈ 7.3. Far past 1.96: significant, yet still only 4 people in 1,000.'],
   lab:{set:{effect:0.4,n:1000000},look:'Read <b>z for this difference</b>, then change the group size.'},verify:[['z',7.33,0.01]]},
  {id:'z30m',kind:'test',lvl:'ap',
   q:'With 30 million per group, what is z for a 0.1-point difference (18.0% vs 18.1%)?',
   num:{ans:10.1,tol:0.1,unit:''},
   steps:['p̄ = 0.1805, so the standard error is √(0.1805 × 0.8195 × 2 ÷ 30,000,000) ≈ 0.0000993.','z = 0.001 ÷ 0.0000993 ≈ 10.1.','Huge groups make tiny differences significant. Significance answers “is it real?”, not “is it big?”'],
   lab:{set:{effect:0.1,n:30000000},look:'Read <b>z for this difference</b>.'},verify:[['z',10.07,0.01]]}
 ]
}
});
