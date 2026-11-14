import assert from 'node:assert/strict';
import contacts from './art-contacts.mjs';
export default async function(T){const {h,advance,THREE}=T;let count=0;const check=(name,v)=>{assert.ok(v,name);count++;};
 h.jump('c8-surface');advance(10);const town=h.chapter8.SC.STREET.town,D=town.district,structure=h.chapter8.ruin?.structure||h.chapter8.CTX.ruin.structure;
 check('Thirteen existing lots are destroyed on emergence',D.state.damaged.length===13);
 check('Every authored damage lot is distinct',new Set(D.records.map(r=>r.X.Q)).size===15);
 check('Named story houses stay accessible',D.records.every(r=>!r.X.Q.key));
 check('Merged building triangles are removed',structure.state.removedTriangles>100);
 town.fire('across');advance(8);check('Two additional buildings collapse',D.state.damaged.length===15);
 const ids=D.state.damaged.map(r=>r.id).sort();
 h.jump('a1-return');advance(3);check('September retains every damaged lot',JSON.stringify(D.state.damaged.map(r=>r.id).sort())===JSON.stringify(ids));
 h.jump('a1-weeks');advance(3);check('October clears only two shells',D.state.damaged.filter(r=>r.cleared).length===2);check('October retains structural triangle cuts',structure.state.removedTriangles>100);
 h.jump('a1-gym');advance(4);check('Leaving town restores the original geometry',structure.state.removedTriangles===0);const crowd=h.aftermath1.SC.SCH.crowd;
 check('Ninety-six additional evacuation figures',crowd.state.represented===96);check('Crowd uses eleven instanced batches',crowd.state.drawBatches===10); // head, hair, torso, limbs, hands, shoes, neck, nose, eyes
 const A=h.aftermath1.cast.jamieMom,F=h.aftermath1.FACES.get(A);F.set('sobbing',{hold:30});advance(5);h.scene.updateMatrixWorld(true);
 check('Crying expression reaches tears',F.crying>.6);check('All adult vertices are finite',Array.from(A.person.parts.head.geometry.attributes.position.array).every(Number.isFinite));
 F.detach();check('Expression overlay detaches',!F.enabled);F.attach();
 h.jump('c8-surface');advance(3);check('Replay restores thirteen initial damaged lots',D.state.damaged.length===13);check('Replay roof originals remain visible',D.records.filter(r=>r.wave!==undefined).every(r=>r.originals.every(v=>v.o.visible===v.visible)));
 console.log(JSON.stringify({recoveryStatePassed:count}));await contacts(T);
}
