// What the Chapters screen says about each part of the summer. Titles are the game's own (its chapter cards and
// end cards); Chapters One to Three have none, so they show only their date and the place they begin (their first
// checkpoint's label). Each line describes how a chapter opens and nothing after it. A chapter's entry is shown
// only once the player has reached it (progress.js); until then it reads "Not yet remembered."
//
// stamp: the date as Alex's camera would print it in the corner of a picture (MM DD 'YY).
// art:   a painted stand-in for the chapter's picture (CSS), used when no captured still is available.
export const CHAPTER_INFO=[
 {n:0,num:'P',name:'Prologue',title:'The Long Way Home',date:'Sunday, August 21, 2011 · 7:42 PM',place:'Oak Hollow Drive',stamp:"08 21 '11",
  text:'Four friends, four bikes, and one more lap around the block before anyone has to go home.',
  art:'radial-gradient(ellipse at 66% 64%,rgba(255,214,150,.9) 0,rgba(255,170,110,.45) 9%,transparent 30%),linear-gradient(180deg,#3e3f63 0%,#87728d 34%,#e3a07f 58%,#f0b57c 63%,#3a3b2c 64%,#20221a 100%)'},
 {n:1,num:'I',name:'Chapter One',title:'',date:'Sunday, August 21, 2011 · That night',place:'Briarwood Lane',stamp:"08 21 '11",
  text:'Riding home alone, a siren. A police car turns onto Briarwood Lane behind you, and the evening becomes the night Alex did not come home.',
  art:'radial-gradient(circle at 30% 70%,rgba(255,60,50,.55),transparent 18%),radial-gradient(circle at 38% 70%,rgba(70,110,255,.5),transparent 17%),radial-gradient(ellipse at 74% 40%,rgba(255,200,130,.35),transparent 22%),linear-gradient(180deg,#0e1424 0%,#1c2a44 52%,#121725 62%,#07090f 100%)'},
 {n:2,num:'II',name:'Chapter Two',title:'',date:'August 21 – 22, 2011 · Night, then morning',place:'Behind the creek',stamp:"08 22 '11",
  text:'The creek that night, the gap in the back fence and the drainage easement behind the yards. In the morning, the same street in plain daylight.',
  art:'linear-gradient(90deg,rgba(9,12,20,.92) 0 47%,transparent 53%),radial-gradient(ellipse at 22% 60%,rgba(255,236,190,.35),transparent 20%),linear-gradient(180deg,#9fc1df 0%,#d6e3ea 48%,#8aa36e 60%,#5e7044 100%)'},
 {n:3,num:'III',name:'Chapter Three',title:'',date:'Monday, August 22, 2011',place:'Where he turned, later',stamp:"08 22 '11",
  text:'If Alex heard it before he left, maybe it was not the first time. His mother, his room, his recordings, and the old pond road.',
  art:'radial-gradient(ellipse at 58% 56%,rgba(255,236,190,.42),transparent 16%),linear-gradient(115deg,transparent 46%,rgba(255,236,190,.10) 50%,transparent 58%),linear-gradient(180deg,#05070b 0%,#0e1513 44%,#18241b 60%,#06080a 100%)'},
 {n:4,num:'IV',name:'Chapter Four',title:'Main Street',date:'Tuesday, August 23, 2011',place:'The next afternoon',stamp:"08 23 '11",
  text:'Alex’s camera, the old bike in the background of his pictures, and the ride downtown along the old connector road.',
  art:'radial-gradient(circle at 20% 38%,rgba(255,170,80,.6),transparent 9%),radial-gradient(circle at 46% 34%,rgba(255,170,80,.5),transparent 8%),radial-gradient(circle at 72% 30%,rgba(255,170,80,.4),transparent 7%),linear-gradient(180deg,#2a2440 0%,#6b4a5a 40%,#b07052 56%,#2d2422 60%,#141012 100%)'},
 {n:5,num:'V',name:'Chapter Five',title:'The Place in the Picture',date:'Wednesday, August 24, 2011',place:'The Old Reservoir Road',stamp:"08 24 '11",
  text:'Packing in Sam’s garage, then north out of town to Pine Ridge Park on the reservoir, looking for the place in Alex’s picture.',
  art:'linear-gradient(180deg,transparent 0 52%,rgba(20,32,30,.9) 53%,transparent 60%),linear-gradient(180deg,#8fb3c8 0%,#c7d6d4 44%,#5d7f86 54%,#2f4a55 76%,#1a2a30 100%)'},
 {n:6,num:'VI',name:'Chapter Six',title:'Someone Was Here',date:'Thursday, August 25, 2011',place:'The morning after',stamp:"08 25 '11",
  text:'The morning after Pine Ridge. Sam calls, and Oak Hollow looks exactly the way it always has.',
  art:'linear-gradient(180deg,rgba(255,255,255,.06) 0,transparent 30%),linear-gradient(180deg,#5e666d 0%,#8d9599 40%,#6f7466 58%,#3e4237 64%,#25271f 100%)'},
 {n:7,num:'VII',name:'Chapter Seven',title:'The Street That Wasn’t There',date:'Friday, August 26, 2011',place:'The house without Sam',stamp:"08 26 '11",
  text:'Sam’s house the morning after, Officer Reyes and an old plan of the town, and a street past the oak that was vacated in 1974.',
  art:'linear-gradient(90deg,transparent 0 60%,rgba(40,70,48,.85) 60% 66%,transparent 66%),linear-gradient(180deg,#b9bdb7 0%,#9ea39b 44%,#6c715f 58%,#43473a 66%,#2a2c25 100%)'},
 {n:8,num:'VIII',name:'Chapter Eight',title:'The Night Oak Hollow Fell',date:'August 26 – 27, 2011 · Friday night',place:'Four bikes',stamp:"08 26 '11",
  text:'Friday night: four bikes under the streetlight, a junction that is not on any map, and the works under the court.',
  art:'radial-gradient(ellipse at 50% 30%,rgba(255,200,130,.55),transparent 16%),linear-gradient(180deg,#07080c 0%,#151826 50%,#262433 62%,#0b0b10 100%)'},
 {n:9,num:'AI',name:'Aftermath I',title:'What Was Left',date:'August 27 – October, 2011',place:'The school',stamp:"08 27 '11",
  text:'The morning after, at the school. The families, a record of what happened, and the weeks that followed, until October.',
  art:'linear-gradient(180deg,#c9ccc7 0%,#dfe0da 42%,#a5a89b 58%,#77796d 66%,#4f5148 100%)'},
 {n:10,num:'AII',name:'Aftermath II',title:'Ten Years Later',date:'Friday, August 27, 2021',place:'Oak Hollow Drive',stamp:"08 27 '21",
  text:'Ten years later, you drive back to Oak Hollow. Sam said he would be at the curb. The old one.',
  art:'radial-gradient(ellipse at 70% 58%,rgba(255,210,150,.6),transparent 22%),linear-gradient(180deg,#6f86a8 0%,#b8b4b6 40%,#d9b38f 55%,#5b6d48 60%,#2f3a2a 100%)'},
 {n:11,num:'·',name:'One More Lap',title:'',date:'The summer street',place:'The long way home',stamp:"08 21 '11",
  text:'One more lap down Oak Hollow Drive, in the golden light, the way it always was.',
  art:'radial-gradient(ellipse at 62% 62%,rgba(255,214,150,.85) 0,rgba(255,170,110,.4) 10%,transparent 30%),linear-gradient(180deg,#3e3f63 0%,#87728d 34%,#e3a07f 58%,#f0b57c 63%,#3a3b2c 64%,#20221a 100%)'}];

// What the title says, for each evening it can remember (progress.js decides which).
export const TITLE_TEXT={
 summer:{eyebrow:'OAK HOLLOW <i></i> SUMMER, 2011',tagline:'It’s getting late.<br>But nobody wants to go home yet.'},
 search:{eyebrow:'OAK HOLLOW <i></i> AUGUST, 2011',tagline:'The streetlights are on.<br>Not everyone made it home.'},
 after:{eyebrow:'OAK HOLLOW <i></i> 2011',tagline:'You moved away in October.<br>You meant to keep in touch.'}};
