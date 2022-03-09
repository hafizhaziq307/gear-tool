<script>
  import Background from "./components/Background.svelte";
  import ResultContainer from "./components/ResultContainer.svelte";

  let scores = 0;
  let isCalculate = false;

  let tier;

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
    setTier(scores);
  }

  function reset() {
    scores = 0;
    isCalculate = false;
    tier = "";

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
      if (value <= roll) {
        return roll;
      }
    }
    return NaN;
  }

  function setTier(scores) {
    if (scores <= 69) {
      tier = "Trash Gear";
    } else if (scores <= 74) {
      tier = "Normal Gear";
    } else if (scores <= 79) {
      tier = "Good Gear";
    } else {
      tier = "Godly Gear";
    }
  }
</script>

<Background />

<!-- content box -->
<div
  class=" absolute top-1/2 left-1/2 w-[40rem] -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-md bg-gray-800 text-white"
>
  <!-- level & tier -->
  <div
    class="flex justify-between rounded-t-md bg-red-600 p-4 text-center text-3xl font-bold"
  >
    <div class="w-full">Lvl 72 ~ 85</div>
    <div class="w-full">Epic</div>
  </div>

  <!-- substats -->
  <div class="w-full space-y-6 p-4">
    {#each results as result}
      <div class="flex space-x-6">
        <select
          bind:value={result.title}
          on:change={() => (result.value = "")}
          class=" w-3/4 cursor-pointer rounded-md bg-gray-700 p-2 ring-1 ring-gray-500"
        >
          <option value="">choose substat</option>
          {#each substats as substat}
            <option value={substat.title}>
              {substat.title}
            </option>
          {/each}
        </select>
        <input
          type="text"
          bind:value={result.value}
          class="w-1/4 rounded-md bg-gray-700 p-2 ring-1 ring-gray-500"
        />
      </div>
    {/each}
  </div>

  <!-- results -->
  {#if isCalculate}
    <ResultContainer {results} {scores} {tier} />
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
</div>
