/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
electoral:[
 {k:'popular',s:'A candidate can win the presidency while getting fewer votes nationwide.',fact:true,why:'The winner needs 270 electoral votes, decided state by state. It happened in 1824, 1876, 1888, 2000 and 2016.'},
 {k:'equal',s:'Each state gets the same number of electoral votes.',fact:false,why:'A state gets one for each House seat plus two for its senators, so bigger states get more. Every state has at least 3, and DC has 3.'},
 {k:'all',s:'Every state gives all of its electoral votes to whoever wins that state.',fact:false,why:'48 states and DC do. Maine and Nebraska give two votes to the statewide winner and one to the winner of each congressional district.'}
]
});

/* Batch 2 (Nov 17, 2026): the rest of CivicsLab. Facts only, with the source idea in each "why";
   framing stays neutral (teach, don't preach). */
BioLab.addMyths({
budget:[
 {k:'aid',s:'Foreign aid is about a quarter of the federal budget.',fact:false,why:'Polls find people often guess around 25%. It is about 1% of federal spending.'},
 {k:'mand',s:'Most federal spending is set by existing law, not voted on each year.',fact:true,why:'Mandatory programs like Social Security and Medicare, plus interest, are about two thirds of spending.'},
 {k:'interest',s:'Interest on the national debt has grown into one of the largest federal costs.',fact:true,why:'In recent years it has been roughly as large as defense spending.'}
],
aidcuts:[
 {k:'share',s:'The U.S. gives more foreign aid in total dollars than any other country.',fact:true,why:'It is the largest donor in dollars, though several countries give more as a share of their economy.'},
 {k:'cheap',s:'Some health programs prevent a death for a few thousand dollars.',fact:true,why:'Charity evaluators estimate bed nets and malaria medicine save a life for roughly $3,000 to $5,500.'},
 {k:'one',s:'A change in aid affects only the country that receives it.',fact:false,why:'Diseases cross borders, so outbreaks in one place can spread to others.'}
],
apportion:[
 {k:'435',s:'The number of House seats has been fixed at 435 since 1913, except for a brief time.',fact:true,why:'Set by law in 1911 and 1929. It was 437 briefly after Alaska and Hawaii joined.'},
 {k:'census',s:'House seats are redistributed among the states after each census.',fact:true,why:'Every 10 years, so fast-growing states gain seats and others lose them.'},
 {k:'equal',s:'Every House member represents about the same number of people across states.',fact:false,why:'Each state gets at least one seat and seats are whole numbers, so district sizes differ from state to state.'}
],
districts:[
 {k:'shape',s:'Gerrymandering is drawing district lines to favor one party or group.',fact:true,why:'Packing one side into a few districts and spreading it thin elsewhere can change who wins.'},
 {k:'colo',s:'Colorado uses independent commissions to draw its districts.',fact:true,why:'Voters approved Amendments Y and Z in 2018.'},
 {k:'votes',s:'The party that gets more votes statewide always wins more seats.',fact:false,why:'How the lines are drawn can change that.'}
],
seatsvotes:[
 {k:'prop',s:'Winner-take-all districts give each party seats in exact proportion to its votes.',fact:false,why:'Small vote leads can turn into large seat leads. Proportional systems try to match them more closely.'},
 {k:'world',s:'Many democracies use proportional representation.',fact:true,why:'Countries like the Netherlands and New Zealand give parties seats roughly matching their vote share.'},
 {k:'wasted',s:'Votes beyond what a winner needs can be counted as “wasted” in some measures of fairness.',fact:true,why:'The efficiency gap compares wasted votes for each party.'}
],
pollmiss:[
 {k:'margin',s:'A poll’s margin of error covers every way it can be wrong.',fact:false,why:'It covers random sampling error only. Who answers and who actually votes can add bigger errors.'},
 {k:'size',s:'A well-drawn sample of about 1,000 people can estimate a national result within a few points.',fact:true,why:'If it is truly random. The margin of error depends on the sample size, not the population size.'},
 {k:'weight',s:'Pollsters adjust results so the sample matches the population.',fact:true,why:'That is weighting by things like age, education and region.'}
],
turnout:[
 {k:'us',s:'U.S. turnout is among the highest of wealthy democracies.',fact:false,why:'It is in the middle to lower range. Some countries, like Australia, require voting.'},
 {k:'2020',s:'Turnout in the 2020 presidential election was the highest in over 100 years.',fact:true,why:'About 66% of eligible voters cast ballots.'},
 {k:'mid',s:'Fewer people usually vote in midterm elections than in presidential years.',fact:true,why:'Midterm turnout is often 15 to 20 points lower.'}
],
turnoutgap:[
 {k:'age',s:'Younger voters usually turn out at lower rates than older voters.',fact:true,why:'In most U.S. elections, voters over 65 vote at much higher rates than those 18 to 29.'},
 {k:'register',s:'In Colorado you can register to vote on Election Day.',fact:true,why:'Colorado has same-day registration and mails a ballot to every active voter.'},
 {k:'same',s:'Every group of eligible voters turns out at about the same rate.',fact:false,why:'Turnout differs by age, education, income and other factors.'}
],
claims:[
 {k:'percent',s:'A 50% rise followed by a 50% fall leaves you where you started.',fact:false,why:'100 → 150 → 75. Percent changes are measured from different starting points.'},
 {k:'rate',s:'Comparing raw totals between places of very different sizes can mislead.',fact:true,why:'Per-person rates make fair comparisons.'},
 {k:'axis',s:'A graph whose axis doesn’t start at zero can make small changes look big.',fact:true,why:'Check the scale before trusting the picture.'}
],
whatmoved:[
 {k:'one',s:'When a number changes after a new policy, the policy must be the cause.',fact:false,why:'Other things change at the same time. Compare with places that didn’t adopt the policy.'},
 {k:'trend',s:'A number that was already falling before a change may keep falling for other reasons.',fact:true,why:'Look at the trend before the change, not just the before-and-after.'},
 {k:'comp',s:'Comparing a similar place that didn’t make the change helps show the effect.',fact:true,why:'That is the idea behind a difference-in-differences comparison.'}
],
crimecount:[
 {k:'all',s:'Police statistics count every crime that happens.',fact:false,why:'Many crimes are never reported. The National Crime Victimization Survey finds less than half of violent crimes are reported to police.'},
 {k:'survey',s:'The government also measures crime by surveying households.',fact:true,why:'The NCVS asks people about crimes whether or not they were reported.'},
 {k:'change',s:'A change in reporting can change crime numbers even if crime itself didn’t change.',fact:true,why:'Changes in how crimes are counted or reported move the totals.'}
],
deathpenalty:[
 {k:'states',s:'Some U.S. states have the death penalty and others have abolished it.',fact:true,why:'Colorado abolished it in 2020.'},
 {k:'exon',s:'Some people sentenced to death have later been exonerated.',fact:true,why:'The Death Penalty Information Center counts about 200 exonerations since 1973.'},
 {k:'cost',s:'Death penalty cases always cost less than life imprisonment.',fact:false,why:'Studies in several states found capital cases often cost more because of longer trials and appeals.'}
],
secondchances:[
 {k:'record',s:'A criminal record can make it harder to get a job or housing.',fact:true,why:'Many applications ask about convictions.'},
 {k:'seal',s:'Colorado law lets some people seal certain old records.',fact:true,why:'Colorado has expanded record sealing in recent years, including automatic sealing for some records.'},
 {k:'return',s:'Most people released from prison return within a year.',fact:false,why:'Recidivism builds over time; a federal study of 2012 releases found about 62% were rearrested within five years, fewer within one year.'}
],
redlining:[
 {k:'maps',s:'In the 1930s, a federal agency rated neighborhoods for lending risk, often by race.',fact:true,why:'The Home Owners’ Loan Corporation drew maps; areas marked red were labeled “hazardous.”'},
 {k:'gone',s:'Redlining has no effects today because it ended decades ago.',fact:false,why:'Studies link old redlined areas to lower home values and less wealth today.'},
 {k:'fha',s:'The Fair Housing Act of 1968 banned discrimination in housing.',fact:true,why:'It outlawed refusing to sell, rent or lend because of race and other characteristics.'}
],
greenwood:[
 {k:'1921',s:'In 1921, a white mob destroyed the Greenwood district of Tulsa, Oklahoma.',fact:true,why:'Historians estimate as many as 300 people were killed and about 35 blocks burned.'},
 {k:'small',s:'Greenwood was a small, poor neighborhood.',fact:false,why:'It was a prosperous Black business district, often called “Black Wall Street.”'},
 {k:'rebuilt',s:'Residents rebuilt much of Greenwood after the massacre.',fact:true,why:'They rebuilt without insurance payouts, which were largely denied.'}
],
inventors:[
 {k:'patent',s:'Enslaved people could not receive U.S. patents for their inventions.',fact:true,why:'Patent rules treated them as unable to hold patents, so their inventions went unrecorded or were claimed by others.'},
 {k:'morgan',s:'Garrett Morgan patented an early three-position traffic signal.',fact:true,why:'His 1923 patent added a warning position between stop and go.'},
 {k:'few',s:'There were almost no Black inventors before 1900.',fact:false,why:'Hundreds of patents were granted to Black inventors in the 1800s, like Elijah McCoy and Lewis Latimer.'}
],
slaveryfounding:[
 {k:'three',s:'The Constitution counted three of every five enslaved people when dividing House seats.',fact:true,why:'The three-fifths clause gave slaveholding states more seats and electoral votes.'},
 {k:'pres',s:'None of the first U.S. presidents enslaved people.',fact:false,why:'Several did, including Washington and Jefferson.'},
 {k:'census',s:'The 1790 census counted about 700,000 enslaved people.',fact:true,why:'About 18% of the total population.'}
],
taxhistory:[
 {k:'top',s:'The top federal income tax rate was once over 90%.',fact:true,why:'It was 91% to 94% from the 1940s to the early 1960s, but few people paid it because of deductions and loopholes.'},
 {k:'always',s:'There has always been a federal income tax.',fact:false,why:'The permanent income tax began after the 16th Amendment in 1913.'},
 {k:'rate',s:'A high top rate doesn’t mean high earners paid that rate on all their income.',fact:true,why:'It applied only to income above the top bracket line, after deductions.'}
],
tabor:[
 {k:'vote',s:'Colorado’s TABOR requires voter approval for tax increases.',fact:true,why:'The Taxpayer’s Bill of Rights was added to the state constitution in 1992.'},
 {k:'refund',s:'TABOR can require the state to refund revenue above a limit.',fact:true,why:'The limit grows with population and inflation; extra revenue goes back to taxpayers unless voters allow it to be kept.'},
 {k:'local',s:'TABOR applies only to the state, not to cities or school districts.',fact:false,why:'It covers local governments and districts too.'}
],
propertytax:[
 {k:'local',s:'Local property taxes are a major source of school funding in many states.',fact:true,why:'So districts with higher property values can raise more per student.'},
 {k:'equal',s:'Every school district in a state gets the same money per student.',fact:false,why:'Funding varies by local property values, state aid formulas and local votes.'},
 {k:'gallagher',s:'Colorado voters repealed the Gallagher Amendment in 2020.',fact:true,why:'It had set the ratio of residential to business property taxes.'}
],
twohomes:[
 {k:'mid',s:'The mortgage interest deduction mostly benefits higher-income households.',fact:true,why:'It helps only people who itemize, which is more common at higher incomes.'},
 {k:'rent',s:'Renters get the same federal tax break for rent that homeowners get for mortgage interest.',fact:false,why:'There is no federal deduction for rent.'},
 {k:'cost',s:'Housing tax breaks cost the federal government money.',fact:true,why:'Lost tax revenue is a cost, like spending.'}
],
pitcount:[
 {k:'one',s:'The Point-in-Time count counts people experiencing homelessness on one night in January.',fact:true,why:'HUD requires it every year so trends can be compared.'},
 {k:'all',s:'The Point-in-Time count finds everyone experiencing homelessness.',fact:false,why:'People staying with friends or hidden from view are often missed, so it undercounts.'},
 {k:'year',s:'More people experience homelessness over a year than on any single night.',fact:true,why:'People move in and out of homelessness over time.'}
],
hiddenends:[
 {k:'top',s:'Surveys often miss the very richest and the very poorest.',fact:true,why:'The richest rarely answer and the poorest are hard to reach, so the extremes are undercounted.'},
 {k:'mean',s:'The average income is a good picture of a typical person.',fact:false,why:'A few huge incomes pull the average up. The median is closer to typical.'},
 {k:'tax',s:'Tax records can measure top incomes better than surveys.',fact:true,why:'High earners must file, so the data reaches the top.'}
],
measurewealth:[
 {k:'income',s:'Income and wealth are the same thing.',fact:false,why:'Income is money coming in each year; wealth is what you own minus what you owe.'},
 {k:'gap',s:'Wealth is more unequal than income in the U.S.',fact:true,why:'The top 10% hold about two thirds of household wealth.'},
 {k:'home',s:'For many middle-class families, a home is their biggest asset.',fact:true,why:'Home equity is a large share of their wealth.'}
],
northsouth:[
 {k:'asia',s:'If the world were 100 people, about 59 would live in Asia.',fact:true,why:'Asia has about 4.8 billion of the world’s 8 billion people.'},
 {k:'us',s:'If the world were 100 people, about 15 would live in the U.S.',fact:false,why:'About 4.'},
 {k:'poor',s:'The share of people in extreme poverty has fallen sharply since 1990.',fact:true,why:'World Bank data show it dropped from about 38% to under 10%.'}
],
remittances:[
 {k:'big',s:'Money migrants send home is larger than all foreign aid combined.',fact:true,why:'Remittances to low- and middle-income countries are about $650 billion a year, several times official aid.'},
 {k:'fees',s:'Sending money internationally is always free.',fact:false,why:'Fees average around 6% worldwide, which is why lowering them is a global goal.'},
 {k:'gdp',s:'For some countries, remittances are over 20% of the economy.',fact:true,why:'For example Tonga, Nepal and some Central American countries.'}
],
immigecon:[
 {k:'jobs',s:'Economists generally find immigration has small effects on the average wages of U.S.-born workers.',fact:true,why:'A 2017 National Academies review found small effects overall, with more effect on some groups, like earlier immigrants.'},
 {k:'tax',s:'Undocumented immigrants pay no taxes.',fact:false,why:'Many pay sales, property and payroll taxes; estimates put the total in the tens of billions of dollars a year.'},
 {k:'age',s:'Immigrants are, on average, more likely to be working age than the U.S. population overall.',fact:true,why:'Most arrive as young adults.'}
],
milspend:[
 {k:'us',s:'The U.S. spends more on its military than any other country.',fact:true,why:'SIPRI estimates it is roughly as much as the next nine countries combined.'},
 {k:'share',s:'Military spending is most of the federal budget.',fact:false,why:'It is about 13% of federal spending.'},
 {k:'gdp',s:'Comparing military spending as a share of the economy can rank countries differently than total dollars.',fact:true,why:'Smaller countries can spend a bigger share of a smaller economy.'}
],
lifeworth:[
 {k:'vsl',s:'U.S. agencies put a dollar value on reducing risk of death when weighing rules.',fact:true,why:'The “value of a statistical life” is around $13 million in recent federal guidance.'},
 {k:'person',s:'The value of a statistical life is a price on a specific person’s life.',fact:false,why:'It reflects what people pay for small reductions in risk, added up across many people.'},
 {k:'compare',s:'Using one number for everyone is a choice, and some systems value lives differently.',fact:true,why:'Compensation funds, like after 9/11, paid different amounts based on lost income.'}
],
margin:[
 {k:'small',s:'Elections have been decided by a handful of votes.',fact:true,why:'Some local and state races have ended in ties broken by drawing lots.'},
 {k:'never',s:'One vote never makes a difference.',fact:false,why:'In close local races, single votes have decided outcomes.'},
 {k:'recount',s:'Colorado orders an automatic recount when the margin is very small.',fact:true,why:'For a race decided by 0.5% or less of the winner’s votes.'}
],
tipping:[
 {k:'tip',s:'A small change can cause a big shift once a system passes a tipping point.',fact:true,why:'Like a stack of blocks: stable until one more push tips it.'},
 {k:'smooth',s:'All changes happen gradually and in proportion.',fact:false,why:'Some systems jump suddenly, like neighborhoods that change quickly once a threshold is reached.'},
 {k:'back',s:'Going back below a tipping point doesn’t always undo the change.',fact:true,why:'That is called hysteresis.'}
],
mutuality:[
 {k:'king',s:'Martin Luther King Jr. wrote “Letter from Birmingham Jail” in 1963.',fact:true,why:'In it he wrote that we are caught in “an inescapable network of mutuality.”'},
 {k:'alone',s:'A choice that helps one person never affects anyone else.',fact:false,why:'Choices ripple through networks of people: vaccination, traffic, shared resources.'},
 {k:'network',s:'In a network, one well-connected person can affect many others.',fact:true,why:'That is why hubs matter for spreading information or disease.'}
],
foodmath:[
 {k:'waste',s:'About a third of food produced in the world is lost or wasted.',fact:true,why:'The UN Food and Agriculture Organization estimates roughly one third.'},
 {k:'law',s:'Donating food in good faith in the U.S. can get the donor sued easily.',fact:false,why:'The Bill Emerson Good Samaritan Food Donation Act protects donors acting in good faith.'},
 {k:'math',s:'Not all surplus food can reach people who need it.',fact:true,why:'Transport, storage and spoilage take a share before it arrives.'}
],
jubileedebt:[
 {k:'jubilee',s:'The Hebrew Bible describes a Jubilee year when debts were forgiven and land returned.',fact:true,why:'Leviticus 25 describes it every 50 years.'},
 {k:'2000',s:'The Jubilee 2000 campaign pushed to cancel debts of the poorest countries.',fact:true,why:'It helped lead to large debt relief programs in the 2000s.'},
 {k:'free',s:'Canceling a debt costs no one anything.',fact:false,why:'The lender gives up money it was owed, so someone bears the cost.'}
],
walkwithmoms:[
 {k:'support',s:'Some state and church programs offer support to pregnant women and new mothers facing poverty.',fact:true,why:'Examples include WIC, Medicaid coverage after birth, and parish-based programs like Walking with Moms in Need.'},
 {k:'wic',s:'WIC provides food and nutrition help for low-income pregnant women, infants and young children.',fact:true,why:'It is a federal program run by the states.'},
 {k:'pp',s:'Medicaid coverage after birth lasts only a few weeks in every state.',fact:false,why:'Most states, including Colorado, now extend it to 12 months after birth.'}
],
whosehands:[
 {k:'women',s:'Some studies find money given to mothers is more likely to be spent on children.',fact:true,why:'Research on cash transfers in several countries found this, though results vary.'},
 {k:'same',s:'Who in a household receives money never changes how it is spent.',fact:false,why:'Studies find it can change spending patterns.'},
 {k:'evidence',s:'Programs are often tested with randomized trials before scaling up.',fact:true,why:'Groups that get the money are compared with similar groups that don’t.'}
],
polygons:[
 {k:'angles',s:'The interior angles of any triangle add up to 180°.',fact:true,why:'For a polygon with n sides, the sum is (n − 2) × 180°.'},
 {k:'hex',s:'Each interior angle of a regular hexagon is 120°.',fact:true,why:'(6 − 2) × 180° = 720°, divided by 6.'},
 {k:'more',s:'Adding a side to a polygon adds 90° to the sum of its angles.',fact:false,why:'Each added side adds 180°.'}
]
});
