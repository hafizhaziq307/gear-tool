import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    substats: [
      {
        title: "Atk/Def/Hp/Eff/EffRes",
        multiplier: 1,
        maxRolls: [8, 16, 24, 32, 40, 48],
      },
      {
        title: "Speed",
        multiplier: 2,
        maxRolls: [4, 8, 12, 16, 20, 24],
      },
      {
        title: "Crit Dmg",
        multiplier: 1.14,
        maxRolls: [7, 14, 21, 28, 35, 42],
      },
      {
        title: "Crit Chance",
        multiplier: 1.6,
        maxRolls: [5, 10, 15, 20, 25, 30],
      },
      {
        title: "Atk (flat)",
        multiplier: 0,
        maxRolls: [47, 94, 141, 188, 235, 282],
      },
      {
        title: "Def (flat)",
        multiplier: 0,
        maxRolls: [34, 68, 102, 136, 170, 204],
      },
      {
        title: "Hp (flat)",
        multiplier: 0,
        maxRolls: [212, 424, 636, 848, 1060, 1272],
      },
    ],
  },
});

export default app;
