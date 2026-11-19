BioLab.addReview({
vaccinepays:{
 questions:[
  {id:'per',kind:'test',lvl:'bio',q:'Routine vaccines saved society about $2.7 trillion across about 117 million children. About how many dollars per child, to the nearest thousand?',num:{ans:23000,tol:500,unit:'dollars'},
   steps:['2,700,000,000,000 ÷ 117,000,000 = 2,700,000 ÷ 117.','≈ $23,000 per child.'],lab:{set:{reveal:true},look:'Read <b>Societal savings per child</b>.'}},
  {id:'line',kind:'real',lvl:'bio',q:'About what share of people must be immune to keep measles from spreading?',choices:['About 50%','About 75%','About 95%'],correct:2,
   steps:['Measles is extremely contagious.','About 95% coverage keeps one case from starting an outbreak.']},
  {id:'gap',kind:'test',lvl:'bio',q:'U.S. kindergarten MMR coverage was 92.5%. How many points below 95% is that?',num:{ans:2.5,tol:0.05,unit:'points'},
   steps:['95 − 92.5 = 2.5 points.','About 286,000 kindergartners lacked documented MMR.']},
  {id:'grow',kind:'test',lvl:'bio',q:'Measles cases: 285 in 2024 and over 5,400 in 2026. About how many times bigger, to the nearest whole number?',num:{ans:19,tol:0.5,unit:'times'},
   steps:['5,400 ÷ 285 ≈ 18.9.','About 19 times.']},
  {id:'r0',kind:'test',lvl:'honors',q:'If R₀ = 12, what share must be immune to stop spread? Percent, one decimal place.',num:{ans:91.7,tol:0.1,unit:'%'},
   steps:['1 − 1/12 = 0.9167.','91.7%.']},
  {id:'cst',kind:'real',lvl:'honors',q:'What does Catholic social teaching give in a vaccine debate?',choices:['The exact school rule to pass','Principles that form consciences (life and dignity, the vulnerable first, solidarity, freedom); experts and citizens work out the policy','Nothing; it stays out of public life'],correct:1,
   steps:['The principles are the true north.','Turning them into policy takes doctors, scientists, citizens and lawmakers.']},
  {id:'pays',kind:'real',lvl:'bio',q:'The CDC says routine vaccines saved $2.7 trillion. What does that number count?',choices:['What each child’s life is worth','Medical bills, lost work and lost earnings that were avoided','Only what the vaccines cost'],correct:1,
   steps:['“Savings” counts money: bills and earnings.','It does not measure a person’s worth, which the Church roots in being made in God’s image.']},
  {id:'ext',kind:'ap',lvl:'ap',q:'Why do economists call vaccination a positive externality?',choices:['Vaccines are made outside the U.S.','Part of the benefit goes to people other than the person vaccinated','Vaccines cost less than treatment'],correct:1,
   steps:['Each vaccinated person lowers everyone else’s risk.','A buyer counts only their own benefit, so markets alone buy too little.']}
 ]
}
});
