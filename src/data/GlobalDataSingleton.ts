interface ItemData {
  id: string;
  level: number;
}

interface GlobalDataType {
  coins: number;
  items: Record<string, ItemData>;
}

export class GlobalDataSingleton {
  private static _instance: GlobalDataSingleton;

  private data: GlobalDataType = {
    coins: 0,
    items: {
      sword: { id: "sword", level: 0 },
      shield: { id: "shield", level: 0 },
      boots: { id: "boots", level: 0 },
    },
  };

  private constructor() {
    this.load();
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new GlobalDataSingleton();
    }
    return this._instance;
  }

  get coins() {
    return this.data.coins;
  }

  set coins(value: number) {
    this.data.coins = value;
  }

  get items() {
    return this.data.items;
  }

  getItemLevel(id: string): number {
    return this.data.items[id]?.level ?? 0;
  }

  upgradeItem(id: string) {
    if (!this.data.items[id]) {
      this.data.items[id] = { id, level: 0 };
    }
    this.data.items[id].level++;
  }

  calculateStats() {
    const { sword, shield, boots } = this.data.items;

    const baseStats = {
      health: 100,
      damage: 10,
      speed: 5,
    };

    return {
      health: baseStats.health + (shield?.level ?? 0) * 20,
      damage: baseStats.damage + (sword?.level ?? 0) * 5,
      speed: baseStats.speed + (boots?.level ?? 0) * 0.5,
    };
  }

  save() {
    localStorage.setItem("gameData", JSON.stringify(this.data));
  }

  load() {
    const saved = localStorage.getItem("gameData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.data = {
          coins: parsed.coins ?? 0,
          items: parsed.items ?? {},
        };
      } catch (e) {
        console.warn("Error loading saved data:", e);
      }
    }
  }

  reset() {
    localStorage.removeItem("gameData");
    this.data = {
      coins: 0,
      items: {},
    };
  }
}
