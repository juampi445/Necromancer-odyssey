export type PlayerType = {
  canMove: boolean;
}

export type EnemyType = {
    canMove: boolean;
}

export type AnimsType = {
    key: string;
    frames: Phaser.Types.Animations.AnimationFrame[];
    frameRate: number;
    repeat: number;
}