BioLab.addReview({
secondchances:{
 questions:[
  {id:'scale',kind:'test',lvl:'bio',q:'About 408,300 people were released in 2012; 62% were arrested within 3 years. About how many, to the nearest thousand?',num:{ans:253000,tol:500,unit:'people'},
   steps:['0.62 × 408,300 = 253,146.','≈ 253,000.'],lab:{set:{reveal:true},look:'Read <b>Arrested within 3 years</b>.'}},
  {id:'diff',kind:'test',lvl:'bio',q:'71% were arrested within 5 years but 46% returned to prison. How many of every 100 were arrested but not reimprisoned?',num:{ans:25,tol:0,unit:'people'},
   steps:['71 − 46 = 25.']},
  {id:'when',kind:'real',lvl:'bio',q:'When is the risk of re-arrest highest?',choices:['The first year after release','Year 5','It is the same every year'],correct:0,
   steps:['37% were arrested in year 1; 26% in year 5.']},
  {id:'ccc',kind:'real',lvl:'bio',q:'What does the Catechism (2266) say punishment should do, as far as possible?',choices:['Contribute to the correction of the offender','Only make the offender suffer','Nothing beyond protecting the public'],correct:0,
   steps:['Catechism 2266: protect the common good and, as far as possible, help correct the offender.']},
  {id:'co',kind:'test',lvl:'honors',q:'Colorado’s 3-year return rate fell from 51.8% to 30.6%. What is the percent decrease, to the nearest whole percent?',num:{ans:41,tol:0.6,unit:'%'},
   steps:['(51.8 − 30.6) ÷ 51.8 = 0.409.','≈ 41%.']},
  {id:'lottery',kind:'real',lvl:'honors',q:'Why is the Milwaukee study stronger evidence than “people with jobs return at 16%”?',choices:['A lottery made the groups alike except for the program','It was bigger','It was in Wisconsin'],correct:0,
   steps:['Random assignment rules out other differences between the groups.']},
  {id:'save',kind:'test',lvl:'ap',q:'A program for 200 people cuts returns from 30% to 20%. At $56,766 a year each, about how much is saved per year, to the nearest thousand dollars?',num:{ans:1135000,tol:1000,unit:'$'},
   steps:['200 × 0.10 = 20 fewer people.','20 × $56,766 = $1,135,320.']}
 ]
}
});
