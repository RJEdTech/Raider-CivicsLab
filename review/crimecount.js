BioLab.addReview({
crimecount:{
 questions:[
  {id:'share',kind:'test',lvl:'bio',q:'The 2024 victim survey found 23.3 violent victimizations per 1,000 people and 11.2 per 1,000 reported to police. What percent were reported, to one decimal place?',num:{ans:48.1,tol:0.2,unit:'%'},
   steps:['11.2 ÷ 23.3 = 0.481.','× 100 = 48.1%: about half.'],lab:{set:{reveal:true},look:'Read <b>Share reported to police</b>.'}},
  {id:'total',kind:'test',lvl:'bio',q:'Police record 690 aggravated assaults. 69% of aggravated assaults are reported. About how many happened?',num:{ans:1000,tol:10,unit:'assaults'},
   steps:['Total = reported ÷ share reported.','690 ÷ 0.69 = 1,000.']},
  {id:'rise',kind:'real',lvl:'bio',q:'Your town’s police report more burglaries this year after a campaign urging people to report crime. What is the best conclusion?',choices:['Burglaries surely rose','The rise could come from more reporting, more burglaries, or both','Burglaries fell'],correct:1,
   steps:['A police count = crimes × share reported.','A reporting campaign raises the share reported, so the count can rise even if crime did not.']},
  {id:'murder',kind:'real',lvl:'bio',q:'Which crime’s trend is most reliable in police records?',choices:['Simple assault','Murder','Theft'],correct:1,
   steps:['Nearly every killing is found and recorded.','So almost no murders are in the dark figure.']},
  {id:'convert',kind:'test',lvl:'honors',q:'23.3 violent victimizations per 1,000 people is how many per 100,000?',num:{ans:2330,tol:1,unit:'per 100,000'},
   steps:['Per 100,000 = per 1,000 × 100.','23.3 × 100 = 2,330.']},
  {id:'compare',kind:'test',lvl:'honors',q:'Why is the FBI’s 359.1 per 100,000 so much lower than the survey’s 2,330?',choices:['The FBI is wrong','They count different crimes and people, and the FBI counts only crimes reported to police','The survey rounds up'],correct:1,
   steps:['The survey includes simple assault and asks people 12 and older.','The FBI counts reported crimes, includes murder, and leaves out simple assault.']},
  {id:'redesign',kind:'ap',lvl:'ap',q:'The redesigned survey gave 28.7 per 1,000 and the old one 23.3 in the same year. By what percent is the new estimate higher, to one decimal place?',num:{ans:23.2,tol:0.2,unit:'%'},
   steps:['28.7 ÷ 23.3 = 1.232.','(1.232 − 1) × 100 ≈ 23.2%.']}
 ]
}
});
