# rock-paper-scissors
## Live Site
- https://yingalice.github.io/rock-paper-scissors

## Description
- Play rock paper scissors against the computer
- Implemented keyboard controls, audio, animations and more
- Created for this JavaScript project ([Part 1](https://www.theodinproject.com/lessons/foundations-rock-paper-scissors) and [Part 2](https://www.theodinproject.com/lessons/foundations-revisiting-rock-paper-scissors)) in The Odin Project curriculum

## Goals
- Get familiar with DOM manipulation (ie. add/remove elements, classes, styles) and event listeners (ie. respond to button clicks)

## What I learned
- Animations
  - Restart animations midplay with the help of requestAnimationFrame() (removing and re-adding class is not enough)
- Keyboard controls
  - Prevent spamming and playing multiple rounds, by ignoring subsequent keypresses until flag is cleared
- Audio
  - Use Web Audio API by creating an AudioContext and buffer to eliminate lag
- Toggles
  - Toggles are checkboxes styled with CSS ::before and ::after
- Table
  - Use HTMLTableElement API to dynamically build table
  - Rounded table borders require matching styling on its outer \<th\> and \<td\> corners
- Hover
  - Hover is generally applicable to mouse, but not touch (triggers on tap) and keyboard (N/A, simulate by adding a class)
    - Use timeout to add slight delay, so hover styles have time to play upon touch taps and key presses
- iOS mobile issue: double tap required to click on some elements with hover (see [this](https://stackoverflow.com/questions/32371431/hover-on-ios-mobile-devices-turns-into-double-touch-instead-of-hover))
  - Solution: only apply hover to nontouch devices, by targeting with @media (pointer: fine)

## Image/Audio Credits
- [See list](./credits.md)

## Screenshots
- Start screen  
![start screen](./img/screenshots/1-welcome.png)
- Choose weapon screen  
![choose weapon screen](./img/screenshots/2-choose-weapon.png)
- Round result screen  
![round result screen](./img/screenshots/3-round-result.png)
- Game result screen  
![game result screen](./img/screenshots/4-game-result.png)