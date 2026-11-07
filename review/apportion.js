BioLab.addReview({
apportion:{
 questions:[
  {id:'quota',kind:'real',lvl:'bio',
   q:'Three states share 10 seats. Cedar has 1,400,000 of the 10,000,000 people. What is Cedar’s quota, its exact fair share of seats?',
   num:{ans:1.4,tol:0.01,unit:'seats'},
   steps:['Fair share per seat: 10,000,000 ÷ 10 = 1,000,000 people.','Cedar’s quota: 1,400,000 ÷ 1,000,000 = 1.4 seats.','A quota is rarely a whole number, which is why a method is needed.'],
   lab:{set:{case:'toy',popC:1.4,reveal:true},look:'Read <b>Quota for the state in the red box</b>.'},verify:[['quota',1.4,0.001],['ideal',1000000,0.5]]},
  {id:'pv',kind:'test',lvl:'bio',
   q:'Cedar has 1,400,000 people and 1 seat. Find its priority value for a 2nd seat, 1,400,000 ÷ √(1 × 2), to the nearest whole number.',
   num:{ans:989949,tol:5,unit:''},
   steps:['n = 1, so n × (n + 1) = 1 × 2 = 2.','√2 ≈ 1.41421.','1,400,000 ÷ 1.41421 ≈ 989,949.'],
   lab:{set:{case:'toy',popC:1.4,reveal:true},act:'start',look:'Read <b>Its priority value for its next seat</b>.'},verify:[['next',989949.49,1]]},
  {id:'who',kind:'test',lvl:'bio',
   q:'For the next seat, the priority values are Alder 967,643, Birch 952,628 and Cedar 989,949. Who gets the seat?',
   choices:['Alder, because it is the biggest state','Cedar, because its priority value is the biggest','Birch, because it has the fewest seats per person'],correct:1,
   steps:['The rule is simple: the biggest priority value gets the next seat.','989,949 > 967,643 > 952,628, so Cedar gets it.','Population matters through the value: a big state’s value shrinks with every seat it already has.']},
  {id:'colorado',kind:'real',lvl:'honors',
   q:'In 2020, Colorado had 5,782,171 people and 7 seats after seat 425. Find its priority value for an 8th seat, to the nearest whole number.',
   num:{ans:772675,tol:5,unit:''},
   steps:['n = 7, so n × (n + 1) = 7 × 8 = 56.','√56 ≈ 7.48331.','5,782,171 ÷ 7.48331 ≈ 772,675. That value ranked seat 432 of 435, so Colorado got its 8th seat.'],
   lab:{set:{case:'us',reveal:true},act:'start',look:'Read <b>Its priority value for its next seat</b>, then step to seat 432.'},verify:[['next',772675.1,0.5],['seats',8,0]]},
  {id:'ny',kind:'real',lvl:'honors',
   q:'Seat 435 went to Minnesota at a priority value of 762,997.7. New York had 20,215,751 people and 26 seats. How many more people would New York have needed to match 762,997.7? Round up to a whole person.',
   num:{ans:89,tol:0,unit:'people'},
   steps:['New York’s value for a 27th seat is P ÷ √(26 × 27) = P ÷ √702.','To match, P must be 762,997.7 × √702 ≈ 762,997.7 × 26.4953 ≈ 20,215,839.8.','20,215,839.8 − 20,215,751 ≈ 88.8, so 89 more people. The Census Bureau reported the same 89.'],
   lab:{set:{case:'us',reveal:true},look:'Step to seats 435 and 436, and read <b>Priority value of the last seat handed out</b>.'},verify:[['last',762997.7,0.1]]},
  {id:'alabama',kind:'test',lvl:'ap',
   q:'Alder, Birch and Cedar have 5.3, 3.3 and 1.4 million people. Under Hamilton’s method, how many seats does Cedar get when the House has 11 seats?',
   num:{ans:1,tol:0,unit:'seats'},
   steps:['Quotas with 11 seats: 5.83, 3.63 and 1.54.','Round down: 5 + 3 + 1 = 9, so 2 seats are left over.','The biggest fractions are .83 (Alder) and .63 (Birch). Cedar’s .54 misses out: 6, 4, 1. With 10 seats Cedar had 2, so it lost a seat when the House grew: the Alabama paradox.'],
   lab:{set:{case:'toy',popC:1.4,house:11,reveal:true},look:'Read <b>Seats it would get under Hamilton’s method</b> and the <b>Alabama paradox check</b>.'},verify:[['ham',1,0],['seats',2,0]]},
  {id:'methods',kind:'real',lvl:'ap',
   q:'Computed from the 2020 Census numbers, Hamilton’s method would move 2 seats compared with Huntington–Hill. Which way?',
   choices:['From Montana and Rhode Island to New York and Ohio','From New York and Ohio to Montana and Rhode Island','From Colorado to Minnesota'],correct:0,
   steps:['Montana’s quota is 1.43 and Rhode Island’s is 1.44. Hamilton rounds them down to 1 and their small fractions get no leftover seat.','New York (26.56) and Ohio (15.51) have bigger fractions, so they win leftover seats.','Huntington–Hill gives the 2nd seat in Montana and Rhode Island priority. In this case it favors the two smaller states.']}
 ]
}
});
