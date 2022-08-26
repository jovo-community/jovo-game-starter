import { Jovo } from '@jovotech/framework';
import { Game } from '../Game';

export const gameInitHook = (jovo: Jovo): void => {
  jovo.$game = new Game(jovo);
};
