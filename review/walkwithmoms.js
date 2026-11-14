BioLab.addReview({
walkwithmoms:{
 questions:[
  {id:'count',kind:'test',lvl:'bio',q:'49% of abortion patients were below the poverty line and 26% were low-income. Out of 2,000 patients, how many were poor or low-income?',num:{ans:1500,tol:0.5,unit:'patients'},
   steps:['49% + 26% = 75%.','0.75 × 2,000 = 1,500.'],lab:{set:{reveal:true},look:'Read <b>Poor or low-income, all together</b>.'}},
  {id:'reason',kind:'real',lvl:'bio',q:'In the Turnaway Study, what was the most common reason women gave for seeking an abortion?',choices:['Money (40%)','Health (12%)','Family pressure'],correct:0,
   steps:['Financial reasons: 40%.','Then timing 36%, partner 31%, other children 29%.']},
  {id:'ccc',kind:'real',lvl:'bio',q:'What does the Catechism (2270) teach about human life?',choices:['It must be respected and protected from the moment of conception','It begins at birth','It depends on the law'],correct:0,
   steps:['Catechism 2270.']},
  {id:'desert',kind:'test',lvl:'bio',q:'35% of about 3,145 counties are maternity care deserts. About how many counties is that, to the nearest ten?',num:{ans:1100,tol:10,unit:'counties'},
   steps:['0.35 × 3,145 ≈ 1,101.','About 1,100.']},
  {id:'bans',kind:'test',lvl:'honors',q:'Bans raised births about 2.3% in ban states, about 30,000 a year. If a state had 400,000 births a year, about how many more would 2.3% be?',num:{ans:9200,tol:1,unit:'births'},
   steps:['0.023 × 400,000 = 9,200.']},
  {id:'source',kind:'real',lvl:'honors',q:'Guttmacher supports abortion rights; the Charlotte Lozier Institute is pro-life. Both report that most patients are poor. What does that agreement suggest?',choices:['The finding is especially strong','Both must be wrong','Stance never matters'],correct:0,
   steps:['When sources with opposite stances agree, the finding is hard to dismiss.']},
  {id:'natexp',kind:'ap',lvl:'ap',q:'Spain’s child benefit began for babies born on or after July 1, 2007. What makes this a natural experiment?',choices:['Families just before and after the date were alike except for the payment','Spain chose the families at random by name','It lasted many years'],correct:0,
   steps:['A sharp cutoff date acts almost like a lottery.','A change right at the date points to the payment.']}
 ]
}
});
