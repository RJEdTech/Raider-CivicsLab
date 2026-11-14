BioLab.addReview({
twohomes:{
 questions:[
  {id:'gain',kind:'test',lvl:'bio',q:'A home worth $350,000 today cost $8,000 in 1948 (about $75,000 today). Wealth beyond inflation?',num:{ans:275000,tol:0,unit:'$'},steps:['350,000 − 75,000 = 275,000.'],lab:{set:{reveal:true},look:'Read <b>Wealth beyond inflation</b>.'}},
  {id:'mark',kind:'test',lvl:'bio',q:'Bought for $12,000, sold on contract for $22,000. Markup in dollars?',num:{ans:10000,tol:0,unit:'$'},steps:['22,000 − 12,000 = 10,000.']},
  {id:'equity',kind:'real',lvl:'bio',q:'What does a contract buyer own after 10 years of payments if they miss one?',choices:['The equity they paid in','Nothing: they can lose the home and all they paid','Half the house'],correct:1,steps:['A contract builds no equity until the last payment.']},
  {id:'pct',kind:'test',lvl:'honors',q:'$12,000 → $22,000. Percent markup, nearest whole percent?',num:{ans:83,tol:1,unit:'%'},steps:['10,000 ÷ 12,000 = 0.833.','≈ 83%.']},
  {id:'ferg',kind:'real',lvl:'honors',q:'Ferguson went from under 1% Black (1970) to 67% (2010). What does the tool say drove the change?',choices:['FHA-backed white suburbs, then white families selling and moving farther out','A new law','Random chance'],correct:0,steps:['Inner suburbs changed while outer suburbs stayed white.']},
  {id:'stock',kind:'ap',lvl:'ap',q:'Why can a 1948 subsidy still shape the 2022 wealth gap ($285,000 vs. $44,900)?',choices:['Wealth is a stock that compounds and is inherited','Incomes never change','Inflation erased it'],correct:0,steps:['Equity built in 1948 became college funds and down payments for the next generations.']}
 ]
}
});
