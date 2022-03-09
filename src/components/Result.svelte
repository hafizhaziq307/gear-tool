<script>
  export let list;
  export let scores;
</script>

<div class="p-4">
  <p class="text-2xl font-bold">Result</p>
  <table class="min-w-full table-fixed divide-y divide-gray-200">
    <tbody class="divide-y  divide-gray-500 bg-gray-800">
      {#each list as element}
        <tr>
          <td class="whitespace-nowrap py-4 px-6 font-medium text-white"
            >{element.title}</td
          >
          <td
            class="whitespace-nowrap py-4 px-6 text-right font-medium text-white"
            >{element.value}/{element.maxRoll}</td
          >
        </tr>
      {/each}
      <tr>
        <td
          colspan="2"
          class="whitespace-nowrap py-4 px-6 text-center text-3xl font-medium text-white"
        >
          {scores}% [
          {#if scores <= 69}
            Trash Gear
          {:else if scores <= 74}
            Normal Gear
          {:else if scores <= 79}
            Good Gear
          {:else}
            Godly Gear
          {/if}
          ]
        </td>
      </tr>
    </tbody>
  </table>
</div>
