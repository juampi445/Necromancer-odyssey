import * as Phaser from 'phaser';
import Player from './Player'; // Importamos el jugador
import Enemy from './Enemy';
import { createProjectile } from './ProjectilesFactory';

class Skill extends Phaser.Physics.Arcade.Sprite {
    scene: Phaser.Scene;
    player: Player;
    cooldown: number; // Tiempo de enfriamiento entre usos de la habilidad
    lastUsed: number; // Última vez que se usó la habilidad
    range: number = 300; // Rango de la habilidad
    projectileKey: string = 'comet'; // Clave del proyectil
    damage: number = 10; // Daño del proyectil
    quantity: number = 1; // Cantidad de proyectiles a disparar
    type: string = 'skill'; // Tipo de habilidad, por defecto 'skill'
    areaOfEffect: boolean = false; // Indica si la habilidad es de área de efecto
    lvl: number = 0;
    maxLevel: number = 5; // Nivel máximo de la habilidad
    setRange?: (range: number) => void; // Método opcional para establecer el rango
    aoeRange: number = 40; // Rango del área de efecto, por defecto 40
    
    constructor(scene: Phaser.Scene, player: Player, cooldown: number = 2000, range: number = 300, textureKey: string = '') {
        console.log(textureKey)
        super(scene, 0, 0, textureKey); // Call super with default values or appropriate texture key
        this.scene = scene;
        this.player = player;
        this.cooldown = cooldown;
        this.range = range;
        this.lastUsed = 0;

        scene.add.existing(this);

        // Habilitar las físicas para el jugador
        scene.physics.add.existing(this);
    }

    // Método para verificar si la habilidad puede usarse
    canUse(): boolean {
        return this.scene.time.now - this.lastUsed > this.cooldown;
    }

    getEnemiesInRange(): Enemy[] {
        const enemies: Enemy[] = [];
        // @ts-expect-error: enemiesGroup is not typed but is expected to exist in the scene
        this.scene.enemiesGroup?.children.iterate((enemy: Enemy) => {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= this.range) {
                if (!enemy.dead) enemies.push(enemy);
            }
        });
        return enemies;
    }

    getClosestEnemy(): Enemy | null {
        const enemiesInRange = this.getEnemiesInRange();
        if (enemiesInRange.length === 0) {
            return null;
        }
        return enemiesInRange.reduce((closest: Enemy, enemy: Enemy) => {
            const distanceToCurrentEnemy = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            const distanceToClosestEnemy = Phaser.Math.Distance.Between(this.player.x, this.player.y, closest.x, closest.y);
            return distanceToCurrentEnemy < distanceToClosestEnemy ? enemy : closest;
        });
    }

    useSkill(target: Enemy) {
        if (this.canUse()) {
            this.lastUsed = this.scene.time.now;
            const shoot = (count = 0) => {
                const projectile = createProjectile(this.projectileKey, this.scene, this.player.x, this.player.y, target, this.damage, this.aoeRange);
                if (!this.player.projectiles) {
                    this.player.projectiles = this.scene.add.group();
                }
                this.player.projectiles.add(projectile);
                if (count + 1 < this.quantity) {
                    this.scene.time.delayedCall(100, () => shoot(count + 1));
                }
            };
            shoot();
            // const projectile = createProjectile(this.projectileKey, this.scene, this.player.x, this.player.y, target, this.damage, this.aoeRange);

            // if (!this.player.projectiles) {
            //     this.player.projectiles = this.scene.add.group();
            // }
            // this.player.projectiles.add(projectile);
        }
    }

    useAreaSkill() {
        if (this.canUse()) {
            this.lastUsed = this.scene.time.now;
            const enemiesInRange = this.getEnemiesInRange();
            if (enemiesInRange.length > 0) {
                enemiesInRange.forEach(enemy => {
                    enemy.takeDamage(this.damage);
                });
            }
        }
    }

    upgrade() {
        this.damage += 10;
        if (this.setRange) {
            this.range += 20;
            this.setRange(this.range);
        } else this.cooldown -= 100;
        this.quantity += 2;
    }

    update() {
        if (this.texture.key === 'aura') {
            this.setPosition(this.player.x, this.player.y);
        }
        if (this.canUse() && this.player.isAttacking) {
            if (!this.scene) {
                console.error('La escena no está disponible para el jugador');
                return;
              }
            if (this.player.dead) return; // No atacar si el jugador está muerto
            if (this.areaOfEffect) {
                this.useAreaSkill();
            } else {
                const closestEnemy = this.getClosestEnemy();
                if (closestEnemy) {
                    this.useSkill(closestEnemy);
                }
            }
        }
    }
}

export default Skill;
