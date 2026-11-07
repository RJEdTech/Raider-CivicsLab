BioLab.addReview({
budget:{
 questions:[
  {id:'share',kind:'test',lvl:'bio',
   q:'International affairs (all foreign aid plus the State Department) was $48.0B out of $7,395.8B of FY2026 spending. What percent is that, to the nearest hundredth?',
   num:{ans:0.65,tol:0.01,unit:'%'},
   steps:['Share = line ÷ total × 100.','48.0 ÷ 7,395.8 = 0.00649.','× 100 ≈ 0.65%, or about 65 cents of every $100.'],
   lab:{set:{gq:'ia',show:true,ddf:0,dis:0,dinc:0},look:'Read <b>Real share of FY2026 spending for your guess</b>.'},verify:[['share',0.649,0.002]]},
  {id:'lunch',kind:'real',lvl:'bio',
   q:'The free school lunch reimbursement is $4.76 per lunch (school year 2026-27). About how many lunches does $1 billion pay for, in millions?',
   num:{ans:210,tol:1,unit:'million lunches'},
   steps:['Divide the money by the price of one lunch.','$1,000,000,000 ÷ $4.76 ≈ 210,084,034.','That is about 210 million lunches.']},
  {id:'move',kind:'real',lvl:'honors',
   q:'You move $25B from national defense to income security. What is the new deficit, in billions?',
   num:{ans:1992.5,tol:0.1,unit:'$B'},
   steps:['Spending falls $25B in defense and rises $25B in income security, so total spending stays $7,395.8B.','Revenue is unchanged at $5,403.3B, so the deficit stays $7,395.8B − $5,403.3B = $1,992.5B.','In human terms: $25B × 151.5 ≈ 3,788 F-35 jet-years moved to about $25B × 440,000 ≈ 11.0 million person-years of SNAP.'],
   lab:{set:{ddf:-25,dis:25,dinc:0,show:true},look:'Read <b>Deficit</b> and the two human-unit tiles.'},verify:[['deficit',1992.5,0.05],['dchange',0,0.01],['jets',-3788,1]]},
  {id:'combo',kind:'test',lvl:'honors',
   q:'A plan raises individual income tax revenue by $200B and cuts defense by $100B. What is the new deficit, in billions?',
   num:{ans:1692.5,tol:0.1,unit:'$B'},
   steps:['New revenue: $5,403.3B + $200B = $5,603.3B.','New spending: $7,395.8B − $100B = $7,295.8B.','Deficit: $7,295.8B − $5,603.3B = $1,692.5B, which is $300B less.'],
   lab:{set:{dinc:200,ddf:-100,dis:0,show:true},look:'Read <b>Deficit</b>.'},verify:[['deficit',1692.5,0.05]]},
  {id:'disc',kind:'real',lvl:'honors',
   q:'Congress votes each year on the discretionary part of spending, about 27% (FY2025, CBO). Using FY2026 spending of $7,395.8B, about how many billions is that?',
   choices:['About $200B','About $1,000B','About $2,000B','About $5,400B'],correct:2,
   steps:['0.27 × $7,395.8B ≈ $1,996.9B.','So about $2.0 trillion is set by yearly votes; the rest is mandatory spending and interest.']},
  {id:'interest',kind:'test',lvl:'ap',
   q:'Net interest was $1,051.8B on $32.43T of debt held by the public. Using that average rate, how much yearly interest does a $1,992.5B deficit add, in billions?',
   num:{ans:64.6,tol:0.2,unit:'$B'},
   steps:['Average rate = 1,051.8 ÷ 32,430 ≈ 0.03243.','Added yearly interest ≈ 0.03243 × 1,992.5 ≈ 64.6.','About $64.6B more each year, as long as the debt and rates stay put.'],
   lab:{set:{show:true,ddf:0,dis:0,dinc:0},look:'Read <b>Yearly interest added by this year’s borrowing</b>.'},verify:[['addint',64.62,0.1]]}
 ]
}
});
