import { GlobalDataSingleton } from '../data/GlobalDataSingleton';

type ItemKey = 'sword' | 'shield' | 'boots';

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  private selectedKey: ItemKey | null = null;
  private descriptionText!: Phaser.GameObjects.Text;
  private statText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private buyButton!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private levelTextMap: Partial<Record<ItemKey, Phaser.GameObjects.Text>> = {};
  private selectorRect!: Phaser.GameObjects.Rectangle;

  create() {
    const { width, height } = this.scale;
    const data = GlobalDataSingleton.instance;

    this.add.tileSprite(width / 2, height / 2, width, height, 'modal-bg');
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1a2b, 0.75);

    this.add.text(width / 2, 80, 'Shop', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.coinsText = this.add.text(width - 30, 30, `Coins: ${data.coins}`, {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    const itemKeys: ItemKey[] = ['sword', 'shield', 'boots'];

    const displayNames: Record<ItemKey, string> = {
      sword: 'Damage',
      shield: 'Health',
      boots: 'Speed',
    };

    const descriptions: Record<ItemKey, string> = {
      sword: 'Increases your damage output.',
      shield: 'Increases your maximum health.',
      boots: 'Increases your movement speed.',
    };

    const spacing = 120;
    const startX = width / 2 - spacing;
    const iconY = 160;

    // Selector rectangle (hidden until selection)
    this.selectorRect = this.add.rectangle(0, 0, 72, 72)
      .setStrokeStyle(3, 0xffff00)
      .setVisible(false);

    itemKeys.forEach((key, i) => {
      const x = startX + i * spacing;

      const icon = this.add.image(x, iconY, key).setDisplaySize(64, 64).setInteractive();

      const levelText = this.add.text(x, iconY + 45, `Lv. ${data.items[key].level}/10`, {
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5);

      this.levelTextMap[key] = levelText;

      icon.on('pointerdown', () => {
        this.selectedKey = key;
        this.selectorRect.setPosition(icon.x, icon.y).setVisible(true);
        this.updateItemDescription(key, descriptions[key], displayNames[key]);
      });
    });

    this.descriptionText = this.add.text(width / 2, iconY + 100, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 300 },
    }).setOrigin(0.5);

    this.statText = this.add.text(width / 2, iconY + 140, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.costText = this.add.text(width / 2, iconY + 180, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.buyButton = this.add.text(width / 2, iconY + 240, 'Buy Upgrade', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
      fixedWidth: 220,
      align: 'center',
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        if (!this.selectedKey) return;

        const item = data.items[this.selectedKey];
        const level = item.level;

        if (level >= 10) return;

        const price = (level + 1) * 100;

        if (data.coins >= price) {
          data.coins -= price;
          data.upgradeItem(this.selectedKey);
          data.save();
          this.updateCoins();
          this.updateItemDescription(
            this.selectedKey,
            descriptions[this.selectedKey],
            displayNames[this.selectedKey]
          );
          // if (this.selectedKey === 'shield') this.game.events.emit('update-health', GlobalDataSingleton.instance.calculateStats().health);
          this.levelTextMap[this.selectedKey]?.setText(`Lv. ${item.level}/10`);
        } else {
          this.shake(this.buyButton);
        }
      });

    this.add.text(width / 2, height - 60, 'Go Back', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#6c757d',
      padding: { x: 20, y: 10 },
      fixedWidth: 200,
      align: 'center',
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('MainMenuScene');
      });
  }

  private updateCoins() {
    this.coinsText.setText(`Coins: ${GlobalDataSingleton.instance.coins}`);
  }

  private updateItemDescription(key: ItemKey, description: string, displayName: string) {
    const data = GlobalDataSingleton.instance;
    const level = data.items[key].level;

    const baseStats: Record<ItemKey, number> = {
      sword: data.items.sword.baseValue,
      shield: data.items.shield.baseValue,
      boots: data.items.boots.baseValue,
    };

    const increments: Record<ItemKey, number> = {
      sword: data.items.sword.increment,
      shield: data.items.shield.increment,
      boots: data.items.boots.increment,
    };

    const current = baseStats[key] + level * increments[key];
    const next = baseStats[key] + (level + 1) * increments[key];
    const price = (level + 1) * 100;

    this.descriptionText.setText(description);

    if (level >= 10) {
      this.statText.setText(`${displayName}: ${current} (Max Level)`);
      this.costText.setText('No more upgrades available');
      this.buyButton.setText('Maxed Out');
      this.buyButton.setInteractive(false);
      this.buyButton.setStyle({ backgroundColor: '#333333', color: '#777777' });
    } else {
      this.statText.setText(`${displayName}: ${current} → ${next}`);
      this.costText.setText(`Cost: ${price} coins`);
      this.buyButton.setText('Buy Upgrade');
      this.buyButton.setInteractive();
      this.buyButton.setStyle({
        backgroundColor: data.coins >= price ? '#28a745' : '#444444',
        color: '#ffffff',
      });
    }
  }

  private shake(target: Phaser.GameObjects.Text) {
    this.tweens.add({
      targets: target,
      x: target.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => (target.x -= 5),
    });
  }
}
