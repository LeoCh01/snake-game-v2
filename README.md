# snake-game-v2

Snake game v1 but this time with new design using js and playable with wasd keys.

link to play here using glitch.com -> https://maple-cool-minute.glitch.me/

Board size and snake speed is now adjustable as ui.
For the bot, I implemented an eularian path algorithm. However, since its not that optimized, it is restricted only for 4x4 and 6x6 boards.
There are alot of eularian paths that could be generated, so I only let it generate the first 10 and pick the fastest path to the apple.

Also added a nice buffer click since its really buggy if you click too fast before it runs a frame.

![image](https://user-images.githubusercontent.com/83481110/208331661-97cb36b8-09d6-4294-adfb-38f7908f2e44.png)
