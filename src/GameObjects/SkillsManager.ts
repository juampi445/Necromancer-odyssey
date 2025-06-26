import * as Phaser from 'phaser';
import Skill from './Skill';
import { GameScene } from '@/scenes/GameScene';

interface SkillsManagerConfig {
    scene: GameScene;
    skills: Skill[];
}

export class SkillsManager extends Phaser.Events.EventEmitter {
    private scene: GameScene;
    private skills: Skill[];

    constructor(config: SkillsManagerConfig) {
        super();
        this.scene = config.scene;
        this.skills = config.skills;
        this.scene.events.on('level-up', this.onLevelUp, this);
    }

    private onLevelUp() {
        this.scene.scene.pause();

        this.scene.game.events.emit(
            'open-skill-modal',
            this.skills,
            this.scene.player.skills,
            (selectedSkillType: string, canUnlock: boolean, canUpgrade: boolean) => {
                this.selectSkill(selectedSkillType, canUnlock, canUpgrade);
            }
        );
    }

    selectSkill(skillType: string, canUnlock: boolean, canUpgrade: boolean) {
        console.log(`Selecting skill: ${skillType}, canUnlock: ${canUnlock}, canUpgrade: ${canUpgrade}`);
        if (!canUnlock && !canUpgrade) return;
        if (canUnlock) {
            const skill = this.skills.find(s => s.type === skillType);
            if (!skill) {
                console.error(`Skill of type ${skillType} not found.`);
                return;
            }
            skill.lvl = 1; // Set initial level to 1 when unlocking
            this.scene.player.skills.push(skill);
        } else {
            const playerSkill = this.scene.player.skills.find(s => s.type === skillType);
            if (!playerSkill) {
                console.error(`Player does not have skill of type ${skillType}.`);
                return;
            }
            if (playerSkill.lvl < playerSkill.maxLevel) {
                playerSkill.upgrade(); // Upgrade the skill
                playerSkill.lvl += 1; // Increment level if it can be upgraded
            } else {
                console.warn(`Skill ${skillType} is already at max level.`);
            }
        }
        // const playerSkill = this.scene.player.skills.find(s => s.type === skillType);
        this.scene.scene.resume();

        // if (!playerSkill) {
        //     this.scene.player.skills.push({ ...skill, lvl: 1 });
        // } else if (playerSkill.lvl < skill.maxLevel) {
        //     playerSkill.lvl += 1;
        // }

        // this.emit('skill-selected', skill);
    }

    getPlayerSkills(): Skill[] {
        return this.scene.player.skills;
    }

    destroy() {
        this.scene.events.off('level-up', this.onLevelUp, this);
        this.removeAllListeners();
    }
}
