BioLab.addReview({
whatmoved:{
 questions:[
  {id:'r2pre',kind:'test',lvl:'bio',
   q:'For 2001–2019, food insecurity in households with children and the unemployment rate have r ≈ 0.876. What percent of the variation does unemployment explain? Round to the nearest whole percent.',
   num:{ans:77,tol:1,unit:'%'},
   steps:['Square r: 0.876² ≈ 0.767.','As a percent: about 77%.','So for two decades, jobs explain most of the year-to-year changes in hunger in families with kids.'],
   lab:{set:{expl:'unemp',years:'pre'},act:'reveal',look:'Read <b>Correlation r</b> and <b>Share of the ups and downs explained</b>.'},verify:[['r2',76.75,0.5],['r',0.876,0.005]]},
  {id:'r2all',kind:'test',lvl:'bio',
   q:'Fit all 24 years, 2001–2024. Which explains the most of the food insecurity line?',
   choices:['Unemployment that year','A steady trend over time','A recession that year','They tie'],correct:0,
   steps:['Unemployment: r² ≈ 36%.','A steady trend: r² ≈ 5%. A recession that year: r² ≈ 1%.','Unemployment still wins, but the pandemic years pull it down from 77%.'],
   lab:{set:{expl:'unemp',years:'all'},act:'reveal',look:'Read <b>Best single explanation</b>.'},verify:[['r2',36.28,0.5]]},
  {id:'gap21',kind:'real',lvl:'honors',
   q:'The 2001–2019 fit is about 10.72 + 1.139 × unemployment. Unemployment in 2021 was 5.4%, and food insecurity was 12.5%. How far below the prediction was 2021? Round to one decimal.',
   num:{ans:4.4,tol:0.1,unit:'points'},
   steps:['Prediction: 10.72 + 1.139 × 5.4 ≈ 16.87%.','Actual: 12.5%.','12.5 − 16.87 ≈ −4.4. About 4.4 points below, the year the expanded credit and SNAP increases were paid.'],
   lab:{set:{expl:'unemp',years:'all',fit:true},act:'reveal',look:'Read <b>2021: actual minus unemployment-only prediction</b>.'},verify:[['gap21',-4.37,0.05]]},
  {id:'swing',kind:'test',lvl:'ap',
   q:'Using the same fit, how many points did food insecurity move from 2021 to 2022 beyond what the change in unemployment (5.4% to 3.6%) predicts?',
   num:{ans:6.9,tol:0.1,unit:'points'},
   steps:['Predicted change: 1.139 × (3.6 − 5.4) ≈ −2.05 points.','Actual change: 17.3 − 12.5 = +4.8 points.','4.8 − (−2.05) ≈ 6.85, about 6.9 points that falling unemployment cannot explain.'],
   lab:{set:{expl:'unemp',fit:true},act:'reveal',look:'Read <b>2021 to 2022 change unemployment cannot explain</b> (Deep dive).'},verify:[['swing',6.85,0.05]]},
  {id:'president',kind:'real',lvl:'bio',
   q:'A post says: “Hunger dropped in 2021, so the president in 2021 deserves the credit.” Which question best tests that?',
   choices:['Which party was the president in?','Which specific policies started or stopped in 2021 and 2022, and what else changed then?','Was the president popular?','Did the post get many likes?'],correct:1,
   steps:['A president is one of many forces: Congress writes the laws, the Federal Reserve sets interest rates, and effects lag.','Specific policies, like the expanded Child Tax Credit paid in 2021 and expired after it, can be dated and tested.','That is why this tool hides presidents and parties and shows laws instead.']},
  {id:'recess0708',kind:'real',lvl:'bio',
   q:'Food insecurity in households with children jumped from 15.8% in 2007 to 21.0% in 2008. Read the shaded bands: what else happened then?',
   choices:['A recession began in December 2007 and unemployment rose','Nothing: the jump was random noise','Food insecurity was measured for the first time','A new law cut food aid'],correct:0,
   steps:['The shaded band from December 2007 to June 2009 is the Great Recession.','Unemployment rose from 4.6% in 2007 to 5.8% in 2008 and 9.3% in 2009.','The food line rose with it: 21.0% in 2008 and 21.3% in 2009.'],
   lab:{set:{expl:'unemp',years:'all',events:true},act:'reveal',look:'Find 2008 on the chart and the shaded recession band.'}}
 ]
}
});
