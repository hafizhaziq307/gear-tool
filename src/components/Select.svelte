<script>
  export let list;
  export let value;

  let open = false;
</script>

<div class="relative space-y-2">
  <div
    class="flex cursor-pointer items-center justify-between rounded p-2 ring-1 ring-gray-500"
    on:click={() => (open = !open)}
  >
    <p class="select-none">{value ? value : "choose substat"}</p>
    <svg
      class="h-6 w-6"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      /></svg
    >
  </div>

  {#if open}
    <div class="absolute z-40 w-full rounded bg-gray-700 ring-1 ring-gray-500">
      {#each list as element}
        <div
          on:click={() => {
            value = element.title;
            open = false;
          }}
          class="cursor-pointer select-none p-2 hover:bg-emerald-600"
        >
          {element.title}
        </div>
      {/each}
    </div>
  {/if}
</div>
