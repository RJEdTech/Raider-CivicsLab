BioLab.addPractical({
pollmiss:{
 hook:'Your service club is planning a volunteer drive in your city of 200,000 adults. You text a survey to random phone numbers. About 6 in 100 people answer, and of the 400 who do, 46% say they volunteered in the past year. A benchmark survey that almost everyone answers puts the city at 28%. Your survey is 18 points too high. Will collecting 4,000 responses fix it?',
 answer:'No. The miss comes from who answers: here volunteers answer twice as often as everyone else. With 4,000 responses, surveys like yours still land around 46.2%, about 18 points too high, with less bounce: the margin of error shrinks from about ±4.9 to about ±1.5 points. That miss is about 36,000 people counted as volunteers who are not. Weighting by education helps a little (to about 42.9%), because it fixes the degree mix, but it cannot fix a bias it does not measure.',
 uses:[
  'Election polls: AAPOR’s task force found that in the 2020 U.S. presidential election, the average error on the margin was 4.5 points for national polls in the final two weeks, the highest in 40 years, and the errors ran mostly in one direction. More polls, or bigger ones, would not have fixed an error they all shared.',
  'Every survey a school, parish or city runs: Pew Research Center’s typical telephone response rate fell from 36% in 1997 to 9% in 2012 and 6% in 2018. In 2012, its surveys found 55% of people saying they had volunteered, against 27% in the Census Bureau’s survey: people who volunteer are also more willing to answer surveys.',
  'Forecasts of rain, games and elections are probabilities. They are judged by calibration (of everything forecast at 70%, about 70% should happen) and by scores like the Brier score, first proposed in 1950 for weather forecasts. A 70% favorite losing is not, by itself, a wrong forecast.'
 ],
 takeaway:'A bigger sample shrinks the bounce, not the bias. Weighting fixes only what it measures, and averaging polls cannot remove an error they all share.'
}
});
