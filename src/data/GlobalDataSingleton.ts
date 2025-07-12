interface ItemData {
  id: string;
  level: number;
  baseValue: number;
  increment: number;
  statKey: string;
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
      sword: { id: "sword", level: 0, baseValue: 5, increment: 5, statKey: "damage" },
      shield: { id: "shield", level: 0, baseValue: 100, increment: 5, statKey: "health" },
      boots: { id: "boots", level: 0, baseValue: 100, increment: 5, statKey: "speed" },
    },
  };

  private baseStats = {
    health: 100,
    damage: 5,
    speed: 100,
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
      this.data.items[id] = { id, level: 0, baseValue: 0, increment: 0, statKey: "" };
    }
    this.data.items[id].level++;
  }

  calculateStats() {
    const { sword, shield, boots } = this.data.items;
    return {
      health: shield.baseValue + (shield?.level ?? 0) * shield.increment,
      damage: sword.baseValue + (sword?.level ?? 0) * sword.increment,
      speed: boots.baseValue + (boots?.level ?? 0) * boots.increment,
    };
  }

  returnData() {
    return this.data;
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
        this.ensureDefaultItems();
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
    this.ensureDefaultItems();
  }

  private ensureDefaultItems() {
    const defaults: Record<string, ItemData> = {
      sword: { id: "sword", level: 0, baseValue: 5, increment: 5, statKey: "damage" },
      shield: { id: "shield", level: 0, baseValue: 100, increment: 5, statKey: "health" },
      boots: { id: "boots", level: 0, baseValue: 100, increment: 5, statKey: "speed" },
    };

    for (const key in defaults) {
      if (!this.data.items[key]) {
        this.data.items[key] = defaults[key];
      }
    }
  }
}
