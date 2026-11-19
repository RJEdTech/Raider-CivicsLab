BioLab.addReview({
builtthere:{
 questions:[
  {id:'share',kind:'real',lvl:'bio',q:'About what share of each stage of the world’s solar panel manufacturing happens in China?',choices:['About 20%','About 50%','Over 80%'],correct:2,
   steps:['Over 80% of every stage, from silicon to finished panels (IEA, 2022).','The first practical silicon solar cell was made at Bell Labs in New Jersey in 1954.'],lab:{set:{reveal:true},look:'Read the solar gauge.'}},
  {id:'ratio',kind:'test',lvl:'bio',q:'In 2025, $34.8 billion of U.S. clean-energy projects were abandoned and $12.3 billion announced. Dollars abandoned per dollar announced, to one decimal place?',num:{ans:2.8,tol:0.06,unit:'dollars'},
   steps:['34.8 ÷ 12.3 = 2.83.','About $2.8 abandoned for every $1 announced.']},
  {id:'step',kind:'real',lvl:'bio',q:'For LFP batteries, which step went worst in the U.S.?',choices:['The invention','Early funding','Buyers: few people were buying electric cars'],correct:2,
   steps:['UT Austin discovered LFP; A123 got a grant and private investment.','Weak demand, lost contracts and a recall led to bankruptcy in 2012.']},
  {id:'europe',kind:'test',lvl:'bio',q:'China invested over $50 billion in solar factories since 2011, about ten times Europe. About how many billions did Europe invest?',num:{ans:5,tol:0.2,unit:'billion dollars'},
   steps:['50 ÷ 10 = 5.','About $5 billion.']},
  {id:'loss',kind:'test',lvl:'honors',q:'A loan program lost $780 million out of $35 billion lent. What percent, to one decimal place?',num:{ans:2.2,tol:0.1,unit:'%'},
   steps:['0.78 ÷ 35 = 0.0223.','≈ 2.2%.']},
  {id:'source',kind:'real',lvl:'honors',q:'E2, which reports the 2025 cancellations, is a business group that advocates for clean energy. What should you do with its numbers?',choices:['Ignore them','Use them, naming the source and checking how it counts','Treat them as official government figures'],correct:1,
   steps:['Advocacy is a reason to check the method, not to throw the number out.','Compare with other trackers when you can.']},
  {id:'port',kind:'ap',lvl:'ap',q:'30 loans of $1 billion each; 3 fail completely; the other 27 repay with 3% interest. Net gain or loss, in billions?',num:{ans:-2.19,tol:0.02,unit:'billion dollars'},
   steps:['Interest: 27 × $1B × 0.03 = $0.81B.','Losses: 3 × $1B = $3B.','Net: 0.81 − 3 = −$2.19B. Small default rates matter a lot when interest is low.']}
 ]
}
});
