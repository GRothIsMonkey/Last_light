# Supernatural lore

> Everything supernatural in *Last Light* is **observed, never explained**. This page lists what has been *shown* and the
> *rules it has obeyed so far*. It contains no theory of what anything "really is" — that is ❓ UNKNOWN by design and
> belongs to the human developer.

## The phenomena

| Phenomenon | First seen | Shown | Never shown / never done | Label |
|---|---|---|---|---|
| **The bell** | Ch0 (Alex hears it), Ch1 | A bicycle bell, usually twice, where no rider is; in a culvert, a drain, outside Alex's window; the old bike's own bell does **not** ring | A ringer | ✅ |
| **The old bike** | Ch0 | Appears and disappears only when unobserved; wet in the drain; in Alex's photos | Moving on screen | ✅ |
| **AR / the fifth rider** | Ch0 | Initials in chalk, the oak, the old bike; a fifth chalk child added unobserved | Any explanation | ✅ |
| **The false Alex** | Ch3 | Alex's body, clothes and voice; waits until seen; walks away; leads them to the creature; stands in roads, gangways, under the marquee; repeats words, including words spoken where it was not | On screen with the creature; a distorted or monstrous face | ✅ |
| **The creature** | Ch3 | See [The smiling creature](../02_CHARACTERS/THE_SMILING_CREATURE.md) | Touching anyone; being named | ✅ |
| **The Presence** (dev name) | Ch4 | Takes lights in ordered cascades toward them; follows the trail they actually took; makes everything still; shows them live on screens; rings phones; figures in high windows that vanish when looked at | A body, a model, a name | ✅ |
| **The camp at night** | Ch5 | Lights in rooms with no power; carried lights that retrace the afternoon and copy the player; voices of Alex and of Sam's mother; a pull on whichever friend is left alone; a bell ringing itself; every light at once on, then off | — | 🟡 |
| **The double** | Ch5 | Jamie's body, cap and shirt, standing where Alex's shirt hung, looking at the real Jamie, then walking out toward the boys, smiling with Jamie's face | — | 🟡 |
| **The photograph** | Ch5 | A picture of the boys at the fire taken from the trees with Alex's camera, which never left the player's pocket | Who took it | 🟡 |

## Rules the phenomena have obeyed so far

These are **observations of the implemented game**, useful for consistency. They are not explanations.

1. **Unobserved change.** Objects appear, move or vanish only when nobody is looking (the old bike, the fifth rider, the
   false Alex leaving, the creature repositioning during the chase).
2. **Seen before it acts.** The false Alex and the creature wait until the player has actually looked at them before they
   move on (with generous time fallbacks).
3. **Copying.** The phenomena repeat what the boys have said and done: Alex's words on the hill, Sam's "Don't run", the
   afternoon's route, the flashlight blink, where they sat, Jamie's appearance.
4. **Lights are its medium.** Streetlights, shop lights, TV screens, a marquee, porch bulbs, camp lamps, carried
   flashlights. Lights go out in ordered lines toward the boys (Ch4) or all at once (Ch5).
5. **The creature fears it.** In Chapter Four the creature freezes, hides and flees as the lights die; in Chapter Five it
   runs from the carried lights. ("It was scared." "Of what?")
6. **Familiar voices.** Alex calling "Jamie?" (Ch3, Ch4 phone, Ch5); Sam's mother calling him in (Ch5).
7. **Separation.** It works on one friend at a time: "Jamie?" calls Jamie; the camp pulls whichever friend the player
   leaves; the double is Jamie.
8. **No physical harm so far.** Nothing has touched or injured anyone. (The human developer now wants real physical
   danger; how that fits these rules is undecided.)
9. **Late August, bicycles, children.** 1966 (Aug 23), 1991 (Aug 21, the tracks on Aug 24), 2011 (Aug 21–24).

## The name "the Presence"

"The Presence" is a **development name** used in code comments (`dist/presence.js`, `dist/chapter5-presence.js`) and
docs. The story never names it, and Chapter Four's tests check that no spoken line implies a hierarchy ("controls",
"servant", "in charge", "created"). Keep it unnamed on screen unless the human developer decides otherwise.

## Things that are deliberately unknown

What the Presence is · what the creature is and why it fears the Presence · whether the false Alex is the Presence, the
creature, or something else · where Alex is · whether the 1966 and 1991 children are connected · what AR is · who the
fifth rider is · who took the photograph. See [Unanswered questions](UNANSWERED_QUESTIONS.md).
