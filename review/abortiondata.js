BioLab.addReview({
abortiondata:{
 questions:[
  {id:'ratio',kind:'test',lvl:'bio',q:'930,160 abortions and 3,613,647 live births in 2020. How many abortions per 1,000 live births, to the nearest whole number?',num:{ans:257,tol:1,unit:'per 1,000 births'},
   steps:['930,160 ÷ 3,613,647 = 0.2574.','× 1,000 ≈ 257.'],lab:{set:{reveal:true},look:'Read <b>Abortions per 1,000 live births, 2020</b>.'}},
  {id:'diff',kind:'test',lvl:'bio',q:'Guttmacher counted 930,160 in 2020 and the CDC 620,327. What fraction of Guttmacher’s count did the CDC count, as a percent to the nearest whole number?',num:{ans:67,tol:1,unit:'%'},
   steps:['620,327 ÷ 930,160 ≈ 0.667.','About 67%.']},
  {id:'why',kind:'real',lvl:'bio',q:'Why is the CDC’s count lower?',choices:['It counts only one year','Some states, including California, do not report to the CDC','It rounds down'],correct:1,
   steps:['States report to the CDC voluntarily.','California, Maryland and New Hampshire have not reported since 2011.']},
  {id:'kind',kind:'real',lvl:'bio',q:'“14.4 per 1,000 women age 15 to 44” is a…',choices:['count','rate','ratio per 1,000 births'],correct:1,
   steps:['It divides by the women at risk: a rate.']},
  {id:'fall',kind:'test',lvl:'honors',q:'The rate was 29.3 in 1980 and 13.5 in 2017. By what percent did it fall, to the nearest whole percent?',num:{ans:54,tol:1,unit:'%'},
   steps:['(29.3 − 13.5) ÷ 29.3 × 100 ≈ 53.9%.','About 54%.']},
  {id:'method',kind:'ap',lvl:'ap',q:'A source changed its method between 2020 and 2023, and its number rose. What can you conclude?',choices:['The rise is entirely real','Part of the change could come from the new method; say so when you compare','The new number is wrong'],correct:1,
   steps:['A method change can shift a number by itself.','Compare with care, and note the change.']}
 ]
}
});
