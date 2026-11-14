BioLab.addReview({
deathpenalty:{
 questions:[
  {id:'ratio',kind:'test',lvl:'bio',q:'DPIC counts 1,661 executions since 1977 and 202 death-row exonerations since 1973. For every exoneration, how many executions? Round to one decimal place.',num:{ans:8.2,tol:0.1,unit:'executions'},
   steps:['n = executions ÷ exonerations = 1,661 ÷ 202.','1,661 ÷ 202 ≈ 8.2.','About 1 exoneration for every 8.2 executions.'],lab:{set:{reveal:true},look:'Read <b>Executions for every exoneration</b>.'}},
  {id:'pct25',kind:'test',lvl:'bio',q:'Executions rose from 25 in 2024 to 47 in 2025. What was the percent increase?',num:{ans:88,tol:1,unit:'%'},
   steps:['Percent change = (new − old) ÷ old × 100.','(47 − 25) ÷ 25 × 100 = 88%.']},
  {id:'meaning',kind:'real',lvl:'bio',q:'A classmate says “1 for every 8.2 means 1 in 8 people executed was innocent.” What is wrong?',choices:['Nothing','Most exonerated people were freed, not executed; the ratio compares two counts','It should be 1 in 82'],correct:1,
   steps:['The 202 were exonerated: cleared and released.','The ratio compares the size of two counts. It is not the share of executed people who were innocent.']},
  {id:'lag',kind:'real',lvl:'bio',q:'New death sentences fell to 23 in 2025, but executions rose to 47. How can both be true?',choices:['They cannot','Executions mostly carry out sentences given decades earlier','New sentences are carried out the same year'],correct:1,
   steps:['People executed in 2025 had spent about 27 years on death row on average (DPIC).','So executions in a year reflect sentences from long before.']},
  {id:'florida',kind:'test',lvl:'honors',q:'Florida carried out 19 of the 47 executions in 2025. What percent is that, to the nearest whole percent?',num:{ans:40,tol:1,unit:'%'},
   steps:['19 ÷ 47 × 100 ≈ 40.4%.','About 40%: one state drove much of the national total.']},
  {id:'deter',kind:'test',lvl:'honors',q:'Why can’t comparing murder rates in states with and without the death penalty show whether it deters murder?',choices:['The rates are secret','The states differ in many other ways, so the comparison cannot isolate the death penalty’s effect','Murder is not counted'],correct:1,
   steps:['This is a correlation between groups of states that differ in many ways.','The National Research Council (2012) found the research does not show whether it raises, lowers or has no effect on homicide.']},
  {id:'hidden',kind:'ap',lvl:'ap',q:'Of 7,482 people sentenced to death from 1973 to 2004, 117 were exonerated. What percent is that, to one decimal place?',num:{ans:1.6,tol:0.05,unit:'%'},
   steps:['117 ÷ 7,482 × 100 ≈ 1.56%.','About 1.6% observed. The study estimates at least 4.1% would be exonerated if every case kept the scrutiny of a death sentence.']},
  {id:'floor',kind:'ap',lvl:'ap',q:'Why is an exoneration count a “floor”?',choices:['It includes guilty people','It counts only errors that someone found and proved; others stay hidden','It double-counts'],correct:1,
   steps:['Errors are found only when someone reinvestigates.','After a sentence is reduced to life, fewer resources go to finding errors, so many are never found.']}
 ]
}
});
