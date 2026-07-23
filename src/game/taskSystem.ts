import type { GameTask } from '../types/game';

export const INITIAL_TASKS: GameTask[] = [
  {
    id: 'task_1',
    title: 'Gathering Light',
    description: 'Collect 10 glowing fireflies across the forest',
    currentCount: 0,
    targetCount: 10,
    completed: false,
  },
  {
    id: 'task_2',
    title: 'Words of Comfort',
    description: 'Discover 3 micro-letters left by past travelers',
    currentCount: 0,
    targetCount: 3,
    completed: false,
  },
  {
    id: 'task_3',
    title: 'Melody in the Rain',
    description: 'Find 1 hidden cassette tape in quiet corners',
    currentCount: 0,
    targetCount: 1,
    completed: false,
  },
  {
    id: 'task_4',
    title: 'A Warm Cup',
    description: 'Collect 5 coffee beans near the Coffee Corner',
    currentCount: 0,
    targetCount: 5,
    completed: false,
  },
  {
    id: 'task_5',
    title: 'Whispers to the Wind',
    description: 'Write a secret reflection at the Whisper Tree',
    currentCount: 0,
    targetCount: 1,
    completed: false,
  },
  {
    id: 'task_6',
    title: 'The Final Journey',
    description: 'Reach the Train Station & sit by the campfire',
    currentCount: 0,
    targetCount: 1,
    completed: false,
  },
];
