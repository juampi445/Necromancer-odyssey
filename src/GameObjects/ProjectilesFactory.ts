import Enemy from "./Enemy";
import Projectile from "./Projectile";

export function createProjectile(key: string, scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, range?: number): Projectile {
    switch (key) {
        case 'comet':
            return new CometProjectile(scene, x, y, target, damage);
        case 'comet_2':
            return new Comet2Projectile(scene, x, y, target, damage);
        case 'venom':
            return new VenomProjectile(scene, x, y, target, damage, range);
        default:
            throw new Error(`Unknown projectile key: ${key}`);
    }
}

export class CometProjectile extends Projectile {
    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number) {
        super(scene, x, y, 'comet', target, damage, { start: 0, end: 13 });
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
    }
}

export class Comet2Projectile extends Projectile {
    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number) {
        super(scene, x, y, 'comet_2', target, damage, { start: 13, end: 25 });
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
    }
}

export class VenomProjectile extends Projectile {
    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, range?: number) {
        super(scene, x, y, 'venom_projectile', target, damage, { start: 41, end: 51 });
        this.areaOfEffectProps = { duration: 2000, range: range ?? 40 };
        this.effectFrequency = 1000; // Frequency of area effect application
        this.areaEffect = (target: Enemy) => {
            // console.log('Applying area effect to target:', target);
        if (target && !target.takingDamage) {
            // const originalVelocity = target.velocity;
            target.velocity = 20;
            scene?.time.delayedCall(this.areaOfEffectProps!.duration, () => target.velocity = 40, [], this);
        // }
        // if (target && this.canUse()) {
            // FALLA PORQUE NO EXISTE SCENE PORQUE DESTRUYO THIS
            this.lastUsed = scene?.time.now;
            target.takeDamage(this.damage, 600);
        }
    };
    }

    onHitTarget(enemy: Enemy, scene?: Phaser.Scene) {
        this.setScale(0);
        this.destroy();

        const range = this.areaOfEffectProps?.range ?? 40;
        const texture = scene?.textures.get('venom');
        const frame = texture!.getSourceImage();

        const diameter = range * 2;
        const scaleX = diameter / frame.width;
        const scaleY = diameter / frame.height;

        const venomAura = scene?.physics.add.sprite(enemy.x, enemy.y, 'venom')
            .setScale(scaleX, scaleY)
            .setAlpha(0.3)
            .setDepth(0)
            .setOrigin(0.5, 0.5);

        if (venomAura?.body) {
            const body = venomAura.body as Phaser.Physics.Arcade.Body;

            const physicsRadius = range / scaleX; // Convert range to texture pixels

            body.setCircle(physicsRadius);

            body.setOffset(
                venomAura.width / 2 - physicsRadius,
                venomAura.height / 2 - physicsRadius
            );

            body.setImmovable(true);
            body.setAllowGravity(false);
        }

        scene?.tweens.add({
            targets: venomAura,
            alpha: { from: 0.3, to: 0.5 },
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        // @ts-expect-error: areaEffect is not standard
        venomAura.areaEffect = this.areaEffect;
        // @ts-expect-error: areaOfEffect is custom
        scene?.areaOfEffect.add(venomAura);

        scene?.time.delayedCall(
            this.areaOfEffectProps?.duration ?? 1000,
            () => venomAura?.destroy(),
            [],
            this
        );

        this.setVisible(false);
    }


    canUse(): boolean {
        if (!this.areaOfEffectProps) return false;
        return this.scene?.time.now - this.lastUsed >= this.effectFrequency!;
    }

    // preUpdate(time: number, delta: number) {
    //     super.preUpdate(time, delta);
    // }
}
