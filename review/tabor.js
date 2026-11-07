BioLab.addReview({
tabor:{
 questions:[
  {id:'cap',kind:'test',lvl:'bio',
   q:'The cap is $20,011.3M. Inflation is 3.0% and population grows 1.0%. What is next year’s cap, in millions?',
   num:{ans:20811.8,tol:0.2,unit:'$M'},
   steps:['The cap grows by inflation plus population growth: 3.0% + 1.0% = 4.0%.','$20,011.3M × 1.04 = $20,811.752M.','About $20,811.8M.'],
   lab:{set:{infl:3,pop:1,rg:5,rec:'3',rule:'refc',keep:false,show:true},look:'Read <b>Next year’s limit</b>.'},verify:[['cap1',20811.75,0.05]]},
  {id:'refund',kind:'real',lvl:'bio',
   q:'With inflation 2.5% and population growth 0.8%, revenue grows 6% from $19,835.4M. What is next year’s refund, in millions?',
   num:{ans:353.9,tol:0.2,unit:'$M'},
   steps:['Cap: $20,011.3M × 1.033 = $20,671.7M.','Revenue: $19,835.4M × 1.06 = $21,025.5M.','Refund: $21,025.5M − $20,671.7M ≈ $353.9M, paid the year after.'],
   lab:{set:{infl:2.5,pop:0.8,rg:6,rec:'3',rule:'refc',keep:false,show:true},look:'Read <b>Next year’s refund</b>.'},verify:[['ref1',353.85,0.1]]},
  {id:'oldrule',kind:'test',lvl:'honors',
   q:'Under the old rule, next year’s limit is built on this year’s revenue ($19,835.4M), because it was below the cap. With 3.3% growth and revenue up 5%, what is the refund, in millions?',
   num:{ans:337.2,tol:0.2,unit:'$M'},
   steps:['Old-rule limit: $19,835.4M × 1.033 = $20,490.0M.','Revenue: $19,835.4M × 1.05 = $20,827.2M.','Refund: $20,827.2M − $20,490.0M ≈ $337.2M, more than double the $155.5M under the Referendum C cap.'],
   lab:{set:{infl:2.5,pop:0.8,rg:5,rec:'3',rule:'orig',keep:false,show:true},look:'Read <b>Next year’s refund</b> with the old rule.'},verify:[['ref1',337.2,0.1]]},
  {id:'history',kind:'real',lvl:'honors',
   q:'Refunds owed were $3,757.4M (FY2021-22), $3,614.7M (FY2022-23), $1,665.1M (FY2023-24) and $306.1M (FY2024-25, preliminary). What is the four-year total, in millions?',
   num:{ans:9343.3,tol:0.1,unit:'$M'},
   steps:['Add the four years: 3,757.4 + 3,614.7 = 7,372.1.','7,372.1 + 1,665.1 = 9,037.2.','9,037.2 + 306.1 = $9,343.3M, about $9.3 billion.']},
  {id:'share',kind:'real',lvl:'honors',
   q:'The forecast refund obligation for FY2026-27 is $463.7M, and the General Fund is $17.44B. What percent of the General Fund is that?',
   choices:['About 0.27%','About 2.7%','About 27%'],correct:1,
   steps:['$17.44B = $17,440M.','463.7 ÷ 17,440 ≈ 0.0266.','About 2.7% of the General Fund.']},
  {id:'compound',kind:'test',lvl:'ap',
   q:'The cap grows 3.3% a year from $20,011.3M. What is it after 5 years, in millions?',
   num:{ans:23538.4,tol:0.5,unit:'$M'},
   steps:['cap_5 = cap_0 × (1 + 0.033)^5.','1.033^5 ≈ 1.17625.','$20,011.3M × 1.17625 ≈ $23,538.4M.'],
   lab:{set:{infl:2.5,pop:0.8,rg:5,rec:'3',rule:'refc',keep:false,show:true},look:'Read <b>Referendum C cap in FY2030-31</b>.'},verify:[['cap5',23538.4,0.1]]}
 ]
}
});
