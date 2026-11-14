BioLab.addReview({
whosehands:{
 questions:[
  {id:'ratio',kind:'test',lvl:'bio',q:'Per 100 taka lent: +18 taka of household spending for women, +11 for men. How many times as much is the women’s number, to one decimal place?',num:{ans:1.6,tol:0.05,unit:'times'},
   steps:['18 ÷ 11 = 1.636…','About 1.6 times.'],lab:{set:{reveal:true},look:'Read <b>Women ÷ men</b>.'}},
  {id:'scale',kind:'test',lvl:'bio',q:'At +18 per 100, how much does yearly spending rise when a woman borrows 2,500 taka?',num:{ans:450,tol:1,unit:'taka'},
   steps:['2,500 × 18 ÷ 100 = 450 taka.']},
  {id:'brazil',kind:'real',lvl:'bio',q:'In Brazil (1990), income in whose hands had a much bigger effect on child survival?',choices:['The father’s','The mother’s (about 20 times bigger)','No difference'],correct:1,
   steps:['Thomas (1990): almost 20 times bigger for income a mother received.']},
  {id:'other',kind:'real',lvl:'bio',q:'Families where mothers have more income may also differ in education or location. Why does that matter?',choices:['It does not','Those differences, not who holds the money, could explain part of the result','It makes the result bigger'],correct:1,
   steps:['Without a lottery, groups can differ in more than one way.']},
  {id:'design',kind:'real',lvl:'honors',q:'Which study design gives the strongest evidence about recipient gender?',choices:['A survey of families','A lottery deciding whether the wife or husband receives the money','A famous book'],correct:1,
   steps:['Randomizing makes the groups alike except for the recipient.','Kenya (2016) and Macedonia (2020) did this.']},
  {id:'food',kind:'test',lvl:'honors',q:'A family spends 3,000 a month. Paying the mother raises the food share by 4.5 percentage points. How much more goes to food?',num:{ans:135,tol:1,unit:''},
   steps:['0.045 × 3,000 = 135.']},
  {id:'pool',kind:'ap',lvl:'ap',q:'If a household fully pools its income, what should happen when a lottery gives the money to the wife instead of the husband?',choices:['Spending changes toward children','Nothing changes: who receives it does not matter','The household spends less'],correct:1,
   steps:['Pooling predicts no difference by recipient.','Kenya fit that prediction; Macedonia did not.']}
 ]
}
});
