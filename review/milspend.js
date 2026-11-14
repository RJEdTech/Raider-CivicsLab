BioLab.addReview({
milspend:{
 questions:[
  {id:'share',kind:'test',lvl:'bio',q:'The U.S. spent $954 billion of the world’s $2,887 billion. What percent is that, to one decimal place?',num:{ans:33.0,tol:0.1,unit:'%'},
   steps:['954 ÷ 2,887 = 0.330.','× 100 = 33.0%.'],lab:{set:{reveal:true},look:'Read <b>U.S. share of the world</b>.'}},
  {id:'top3',kind:'test',lvl:'bio',q:'The U.S. ($954B), China ($336B) and Russia ($190B) together. What share of $2,887B, to the nearest whole percent?',num:{ans:51,tol:0.6,unit:'%'},
   steps:['954 + 336 + 190 = 1,480.','1,480 ÷ 2,887 × 100 ≈ 51%.']},
  {id:'burden',kind:'real',lvl:'bio',q:'Which country spent the biggest share of its economy on its military in 2025?',choices:['United States (3.1%)','Israel (7.8%)','China (about 1.7%)'],correct:1,
   steps:['Share of GDP is the military burden.','Israel 7.8%, Russia 7.5%, U.S. 3.1%.']},
  {id:'measure',kind:'real',lvl:'bio',q:'The U.S. spends the most dollars, yet Russia spends a bigger share of GDP. How can both be true?',choices:['They measure different things','One number is a typo','Russia spends more dollars'],correct:0,
   steps:['Total dollars depend on the size of the economy.','Share of GDP divides by the size of the economy.']},
  {id:'pp',kind:'test',lvl:'honors',q:'$954 billion spread over 342 million Americans. About how many dollars per person, to the nearest $10?',num:{ans:2790,tol:10,unit:'$'},
   steps:['954,000,000,000 ÷ 342,000,000 ≈ 2,789.','About $2,790 per person.']},
  {id:'world',kind:'test',lvl:'honors',q:'$2,887 billion over 8.2 billion people. About how many dollars per person, to the nearest dollar?',num:{ans:352,tol:2,unit:'$'},
   steps:['2,887 ÷ 8.2 ≈ 352.','About $352 per person on Earth.']},
  {id:'wavg',kind:'ap',lvl:'ap',q:'The U.S. was 37% of world spending in 2024 and fell 7.5%; everyone else (63%) rose 9.2%. What world growth rate does the weighted average give, to one decimal place?',num:{ans:3.0,tol:0.1,unit:'%'},
   steps:['0.37 × (−7.5) = −2.775.','0.63 × 9.2 = 5.796.','Sum ≈ +3.0%, close to SIPRI’s +2.9%.']}
 ]
}
});
