BioLab.addPractical({
apportion:{
 hook:'The U.S. House has 435 seats, and after every census they are divided among the states by population. But you cannot give a state 1.4 seats. Start small: three made-up states share 10 seats, and Cedar has 1.4 million of the 10 million people. How many seats should Cedar get?',
 answer:'2 seats. Rounding the quotas 5.3, 3.3 and 1.4 gives only 9 seats, so one is left over. The method Congress uses gives it to the biggest priority value: Cedar’s 2nd seat, 1,400,000 ÷ √2 = 989,949, beats Alder’s 6th (967,643) and Birch’s 4th (952,628). In 2020 the same math gave Colorado its 8th seat, seat 432 of 435, and the last seat went to Minnesota instead of New York by 89 people.',
 uses:[
  'Colorado gained its 8th House seat in the 2020 apportionment. A state’s electoral votes equal its House seats plus its 2 senators, so Colorado also went from 9 electoral votes to 10.',
  'The last seat in 2020 came down to 89 people: the Census Bureau reported that New York, with more than 20 million people, would have needed 89 more to keep a 27th seat. Every person a household reports on the census form counts.',
  'A student senate that gives each grade seats by enrollment has the same problem: the rounded shares rarely add up to the number of seats. The method you choose decides who gets the leftover seat, so agree on it before anyone sees the numbers.'
 ],
 takeaway:'Rounded shares rarely add up to the total. The Huntington–Hill method hands out seats one at a time, each to the biggest priority value, population ÷ √(n × (n + 1)).'
}
});
