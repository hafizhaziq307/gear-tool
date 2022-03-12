<script>
  import Result from "./components/Result.svelte";
  import Select from "./components/Select.svelte";

  let scores = 0;
  let isCalculate = false;

  // input
  const substats = [
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
  ];

  // output
  let results = [
    {
      title: "",
      value: "",
      maxRoll: "",
    },
    {
      title: "",
      value: "",
      maxRoll: "",
    },
    {
      title: "",
      value: "",
      maxRoll: "",
    },
    {
      title: "",
      value: "",
      maxRoll: "",
    },
  ];

  function calculate() {
    if (isCalculate) scores = 0;

    isCalculate = true;

    for (const result of results) {
      // check the result category based on title property
      substats.forEach((substat) => {
        if (result.title == substat.title) {
          scores += Number(result.value) * substat.multiplier;

          // set max roll
          result.maxRoll = setMax(result.value, substat.maxRolls);
        }
      });
    }
    scores = ((scores / 72) * 100).toFixed(1);
  }

  function reset() {
    scores = 0;
    isCalculate = false;

    results = [
      {
        title: "",
        value: "",
        maxRoll: "",
      },
      {
        title: "",
        value: "",
        maxRoll: "",
      },
      {
        title: "",
        value: "",
        maxRoll: "",
      },
      {
        title: "",
        value: "",
        maxRoll: "",
      },
    ];
  }

  function setMax(value, rolls) {
    for (const roll of rolls) {
      if (value <= roll) return roll;
    }
  }
</script>

<!-- content box -->
<main
  class=" absolute top-1/2 left-1/2 w-[40rem] -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-md bg-gray-800 text-white"
>
  <!-- level & tier -->
  <div
    class="flex justify-between rounded-t-md bg-red-600 p-4 text-center text-3xl font-bold"
  >
    <div class="w-full select-none">Lvl 72 ~ 85</div>
    <div class="w-full select-none">Epic</div>
  </div>

  <!-- substats -->
  <div class="w-full space-y-6 p-4">
    {#each results as result}
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <Select list={substats} bind:value={result.title} />
        </div>

        <input
          type="text"
          bind:value={result.value}
          class="rounded-md bg-gray-800 p-2 ring-1 ring-gray-500 focus:bg-gray-700 focus:outline-none"
        />
      </div>
    {/each}
  </div>

  <!-- results -->
  {#if isCalculate}
    <Result list={results} {scores} />
  {/if}

  <!-- buttons -->
  <div class="flex">
    <button
      on:click={calculate}
      class="w-full rounded-bl-md bg-emerald-600 p-4 text-lg font-bold text-gray-200 hover:bg-emerald-700"
    >
      CALC
    </button>

    <button
      on:click={reset}
      class="w-full rounded-br-md bg-gray-600 p-4 text-lg font-bold text-gray-200 hover:bg-gray-700"
    >
      RESET
    </button>
  </div>
</main>
