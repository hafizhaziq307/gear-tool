<script>
  import Result from "./components/Result.svelte";
  import Select from "./components/Select.svelte";

  export let substats;

  let scores = 0;
  let isCalculate = false;

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
  class=" absolute top-1/2 left-1/2 w-[40rem] -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-md bg-gray-800 text-white">
  <!-- level & tier -->
  <div
    class="flex justify-between rounded-t-md bg-red-600 p-4 text-center text-3xl font-bold">
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
          class="rounded-md bg-gray-800 p-2 ring-1 ring-gray-500 focus:bg-gray-700 focus:outline-none" />
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
      class="w-full rounded-bl-md bg-emerald-600 p-4 text-lg font-bold text-gray-200 hover:bg-emerald-700">
      CALC
    </button>

    <button
      on:click={reset}
      class="w-full rounded-br-md bg-gray-600 p-4 text-lg font-bold text-gray-200 hover:bg-gray-700">
      RESET
    </button>
  </div>
</main>
