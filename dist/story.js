export const LENGTH=1120;
export const center=d=>Math.sin(d*.006)*15+Math.sin(d*.014)*3;
export const slope=d=>Math.cos(d*.006)*.09+Math.cos(d*.014)*.042;
export const chapters=[{at:0,title:'THE LONG WAY HOME'},{at:556,title:'SEE YOU TOMORROW'},{at:690,title:'WHEN THE STREETLIGHTS COME ON'},{at:880,title:'THE WAY YOU REMEMBER IT'}];
// Friends' lines and the narrator's, by distance along the street. Alex heads home first, down
// Briarwood Lane; Jamie's mom calls him in later, and Sam goes last. time: seconds on screen.
export const memories=[
{at:8,who:'JAMIE',text:'“Race you to the end of the street.”'},
{at:90,who:'',text:'The air smells like cut grass and somebody’s barbecue.'},
{at:180,who:'SAM',text:'“We should do this every night.”'},
{at:270,who:'ALEX',text:'“Even when school starts?”'},
{at:376,who:'ALEX',text:'“Did you guys hear that?”',time:3.4},
{at:392,who:'JAMIE',text:'“Hear what?”',time:2.6},
{at:405,who:'ALEX',text:'“Never mind.”',time:3.2},
{at:452,who:'ALEX',text:'“You’ll still live here next summer, right?”'},
{at:495,who:'SAM',text:'“Remember when this hill used to feel huge?”'},
{at:556,who:'ALEX',text:'“Alright, I’m this way. See you tomorrow.”',time:5.5},
{at:622,who:'',text:'You don’t remember what you said back.'},
{at:696,who:'JAMIE',text:'“That’s my mom. I gotta go. Tomorrow, okay?”'},
{at:752,who:'',text:'Somewhere, a screen door closes. The cicadas fill the space.'},
{at:900,who:'SAM',text:'“Save me a spot tomorrow.”'},
{at:1012,who:'',text:'There was no big goodbye. Just one more ordinary evening.'},
{at:1054,who:'',text:'You moved away in October. You meant to keep in touch.'},
{at:1094,who:'',text:'For a moment, you can almost hear their bikes again.'}
];
// The end of the street. Kept short on purpose.
export const finale={call:'Someone is calling you home.',hintWalk:'Your bike is where you left it.',hintBike:'Whenever you’re ready.'};
export function chapterAt(d){let n=0;for(let i=0;i<chapters.length;i++)if(d>=chapters[i].at)n=i;return n;}
// A few memory lines, in the voice of the one looking back. Each appears once, softly,
// only when nobody is talking, and only at these moments. Kept few on purpose.
// at/until: a window of distance along the street; after: a moment in the evening.
export const reflections=[
 {id:'together',at:132,until:168,text:'We knew which driveways had the smoothest pavement.'},
 {id:'lights',at:578,until:612,text:'We used to stay out until the streetlights came on.'},
 {id:'tomorrow',after:'first-home',delay:2.5,until:690,text:'Back then, going home only meant until tomorrow.'},
 {id:'quiet',at:800,until:850,text:'I don’t remember when the neighborhood got this quiet.'},
 // Getting back on the bike for the ride home, and riding out of the cul-de-sac.
 {id:'last',after:'leaving',delay:.6,text:'We left our bikes wherever we stopped.'},
 {id:'everyone',after:'leaving',delay:9,text:'I thought I remembered everyone.'},
];
