# Inventory

> 🟡 Chapter Five only (repair). Earlier chapters have no inventory screen; what you carry there is implicit (the spare
> flashlight from Chapter One; Alex's camera from Chapter Four, raised with V).

## Behavior ([dist/inventory.js](../../dist/inventory.js), `#inventory` in `dist/style.css`)

- **Open:** I, or Tab (Tab no longer moves browser focus), or the **BAG** button on touch screens. The walk is held while
  it is open. Close: I or Esc; the pause menu and the chapter end also close it.
- **Two short lists:** *With you* — things you can use (take out / put away): **Alex's camera**, **the flashlight**.
  *Found* — Alex's pictures (and how many you took today), the county map (in Sam's pocket), the register, the search map,
  the pantry, Alex's shirt (in Sam's bag), Jamie's sock.
- **Keys while open:** W/S or arrows to choose; F or Enter to take out / put away; a click chooses a row, a click on its
  action uses it.
- **Nothing to manage:** no slots, no weight, no crafting.

## Contract

The chapter supplies `items()` (what there is) and `use(id)` (what using it does); the panel only shows it. The list is
**derived from the chapter's state**, so Continue, checkpoints and DEV starts rebuild it without duplicates.

## Related

- [Flashlights](FLASHLIGHTS.md) — the flashlight's state model.
- [Cameras and photography](CAMERA_AND_PHOTOGRAPHY.md) — the camera.
- Chapter Four saves what you carry (the camera, whether the picture of the TV is on it, which pictures you found) in
  `localStorage['lastlight.chapter4']`; after a Continue past the video store the picture is rendered again.
