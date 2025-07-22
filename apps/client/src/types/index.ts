export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const OPPONENT_DISCONNECTED = 'opponent_disconnected';
export const GAME_OVER = 'game_over';
export const JOIN_GAME = 'join_game';
export const JOIN_ROOM = 'join_room';

export const GAME_JOINED = 'game_joined';
export const GAME_ALERT = 'game_alert';
export const GAME_ADDED = 'game_added';
export const USER_TIMEOUT = 'user_timeout';
export const GAME_TIME = 'game_time';
export const GAME_ENDED = 'game_ended';
export const EXIT_GAME = 'exit_game';

export type Result = 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';


export interface Metadata {
  blackPlayer: Player;
  whitePlayer: Player;
}


export interface GameResult {
  result: Result;
  by: string;
}

export interface Player {
  id: string;
  name: string;
  isGuest?: boolean;
}

export interface GameMove {
  from: string;
  to: string;
  san?: string;
  before?: string;
  after?: string;
  moveNumber?: number;
  timeTaken?: number;
}

export interface GameState {
  gameId: string | null;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  moves: GameMove[];
  currentTurn: 'w' | 'b';
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIME_UP' | 'PLAYER_EXIT';
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | null;
  player1TimeConsumed: number;
  player2TimeConsumed: number;
}
