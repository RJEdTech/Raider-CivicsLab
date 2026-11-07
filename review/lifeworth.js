BioLab.addReview({
lifeworth:{
 questions:[
  {id:'build',kind:'real',lvl:'bio',
   q:'20,000 people each pay $700 for a 1-in-20,000 cut in their risk of dying. What value of a statistical life does that imply, in millions of dollars?',
   num:{ans:14,tol:0.05,unit:'$M'},
   steps:['A 1-in-20,000 cut for each of 20,000 people prevents one death on average.','Together they pay 20,000 × $700 = $14,000,000.','So the VSL is $14.0M per statistical life.']},
  {id:'benefit',kind:'test',lvl:'bio',
   q:'The crosswalk signal is expected to prevent 0.004 deaths a year for 20 years. At DOT’s $14.2M, what is its benefit, in millions of dollars?',
   num:{ans:1.14,tol:0.01,unit:'$M'},
   steps:['Expected lives saved = 0.004 × 20 = 0.08.','Benefit = 0.08 × $14.2M = $1.136M.','That is about $1.14M, more than the $0.75M cost, so it passes.'],
   lab:{set:{proj:'signal',cost:0.75,yrs:20,rate:0.004,vsl:'dot',show:true},look:'Read <b>Benefit: lives × VSL</b>.'},verify:[['benefit',1.136,0.001]]},
  {id:'breakeven',kind:'test',lvl:'honors',
   q:'The guardrails cost $0.40M and are expected to prevent 0.0008 deaths a year for 25 years. What is their break-even VSL, in millions of dollars?',
   num:{ans:20,tol:0.05,unit:'$M'},
   steps:['Expected lives saved = 0.0008 × 25 = 0.02.','Break-even VSL = cost ÷ lives = $0.40M ÷ 0.02 = $20.0M.','They pass only with a VSL of at least $20.0M, such as HHS’s high estimate of $21.5M.'],
   lab:{set:{proj:'rails',cost:0.4,yrs:25,rate:0.0008,vsl:'dot',show:true},look:'Read <b>Cost per statistical life saved</b>.'},verify:[['be',20,0.01]]},
  {id:'range',kind:'real',lvl:'honors',
   q:'Using HHS’s high estimate ($21.5M), what is the crosswalk signal’s benefit minus cost, in millions of dollars?',
   num:{ans:0.97,tol:0.01,unit:'$M'},
   steps:['Benefit = 0.08 × $21.5M = $1.72M.','Benefit − cost = $1.72M − $0.75M = $0.97M.','At HHS’s low estimate the same project shows 0.08 × $6.6M − $0.75M = −$0.22M. The value used can flip the decision.'],
   lab:{set:{proj:'signal',cost:0.75,yrs:20,rate:0.004,vsl:'hi',show:true},look:'Read <b>Benefit minus cost</b>.'},verify:[['net',0.97,0.001]]},
  {id:'vax',kind:'real',lvl:'honors',
   q:'The CDC estimated childhood vaccines prevented about 1,129,000 deaths among children born 1994–2023. If you valued each at DOT’s $14.2M, about how many trillions of dollars would that be?',
   num:{ans:16.0,tol:0.1,unit:'trillion dollars'},
   steps:['1,129,000 × $14,200,000 = $16,031,800,000,000.','That is about $16.0 trillion.','The CDC’s own benefit-cost ratio, 10.9, comes from costs saved, not from a VSL. This is a separate what-if calculation.']},
  {id:'poisson',kind:'test',lvl:'ap',
   q:'The school-zone beacons are expected to prevent 0.001 deaths a year for 10 years. Treating deaths prevented as Poisson, what is the chance they prevent at least one death, in percent?',
   num:{ans:1.0,tol:0.05,unit:'%'},
   steps:['λ = 0.001 × 10 = 0.01 expected lives.','P(at least one) = 1 − e^−0.01 ≈ 0.00995.','That is about 1.0%. They still pass the test: 0.01 × $14.2M = $0.142M is more than their $0.06M cost.'],
   lab:{set:{proj:'beacon',cost:0.06,yrs:10,rate:0.001,vsl:'dot',show:true},look:'Read <b>Chance it prevents at least one death</b>.'},verify:[['pchance',0.995,0.01]]}
 ]
}
});
