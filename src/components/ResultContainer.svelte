<script>
  export let results;
  export let scores;
  export let tier;
</script>

<div class="p-4">
  <p class="text-2xl font-bold">Result</p>
  <table class="min-w-full table-fixed divide-y divide-gray-200">
    <tbody class="divide-y  divide-gray-500 bg-gray-800">
      {#each results as result}
        <tr>
          <td class="whitespace-nowrap py-4 px-6 font-medium text-white"
            >{result.title}</td
          >
          <td
            class="whitespace-nowrap py-4 px-6 text-right font-medium text-white"
            >{result.value}/{result.maxRoll}</td
          >
        </tr>
      {/each}
      <tr>
        <td
          colspan="2"
          class="whitespace-nowrap py-4 px-6 text-center text-3xl font-medium text-white"
        >
          {scores}% [{tier}]</td
        >
      </tr>
    </tbody>
  </table>
</div>
