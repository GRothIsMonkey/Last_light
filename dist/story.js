export const LENGTH=1120;
export const center=d=>Math.sin(d*.006)*15+Math.sin(d*.014)*3;
export const slope=d=>Math.cos(d*.006)*.09+Math.cos(d*.014)*.042;
export const chapters=[{at:0,title:'THE LONG WAY HOME'},{at:300,title:'SEE YOU TOMORROW'},{at:590,title:'WHEN THE STREETLIGHTS COME ON'},{at:870,title:'THE WAY YOU REMEMBER IT'}];
export const memories=[
{at:8,who:'JAMIE',text:'“Race you to the end of the street.”'},
{at:90,who:'',text:'The air smells like cut grass and somebody’s barbecue.'},
{at:180,who:'SAM',text:'“We should do this every night.”'},
{at:270,who:'ALEX',text:'“Even when school starts?”'},
{at:315,who:'JAMIE',text:'“That’s my mom. I gotta go. Tomorrow, okay?”'},
{at:405,who:'',text:'You don’t remember what you said back.'},
{at:495,who:'SAM',text:'“Remember when this hill used to feel huge?”'},
{at:610,who:'SAM',text:'“Save me a spot tomorrow.”'},
{at:695,who:'',text:'Somewhere, a screen door closes. The cicadas fill the space.'},
{at:785,who:'ALEX',text:'“You’ll still live here next summer, right?”'},
{at:865,who:'ALEX',text:'“See you.”'},
{at:930,who:'',text:'There was no big goodbye. Just one more ordinary evening.'},
{at:995,who:'',text:'You moved away in October. You meant to keep in touch.'},
{at:1060,who:'',text:'For a moment, you can almost hear their bikes again.'}
];
// The end of the street. Kept short on purpose.
export const finale={call:'Far down the street, someone is calling you in.',hintWalk:'Your bike is where you left it.',hintBike:'Whenever you’re ready.'};
export function chapterAt(d){let n=0;for(let i=0;i<chapters.length;i++)if(d>=chapters[i].at)n=i;return n;}
// A few memory lines, in the voice of the one looking back. Each appears once, softly,
// only when nobody is talking, and only at these moments. Kept few on purpose.
// at/until: a window of distance along the street; after: a moment in the evening.
export const reflections=[
 {id:'together',at:132,until:168,text:'I thought we’d always ride this street.'},
 {id:'tomorrow',after:'first-home',delay:2.5,until:478,text:'Back then, going home only meant until tomorrow.'},
 {id:'lights',at:571,until:598,text:'We used to stay out until the streetlights came on.'},
 {id:'quiet',at:734,until:770,text:'I don’t remember when the neighborhood got this quiet.'},
 {id:'last',after:'leaving',delay:.6,text:'Nobody ever said which summer would be the last.'},
];
