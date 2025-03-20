<script lang="ts">
  import { useLocalStorage } from "$lib/local-storage";
  import { onMount } from "svelte";

  const [participants, setParticipants] = useLocalStorage("participants");

  onMount(async () => {
    const interval = (ms: number) => setTimeout(() => {
      const randomLength = Math.floor(Math.random() * 16) + 5;
      const randomBytes = new Uint8Array(randomLength);
      crypto.getRandomValues(randomBytes);

      const name = Array.from(randomBytes)
        .map((m) => (`0${m.toString(16)}`).slice(-2))
        .join("");

      setParticipants([
        ...participants(),
        {
          id: name.toLowerCase(),
          name: name.toUpperCase(),
        },
      ]);

      interval(1000 * (Math.random() * 5));
    }, ms);
    interval(1000 * (Math.random() * 5));
  });
</script>

<button on:click={() => { setParticipants([]); }}>CLEAR</button>
<div>
  {#each participants() as participant (participant.id)}
    <div>{participant.name}</div>
  {/each}
</div>
