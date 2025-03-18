<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { useLocalStorage } from "$lib/local-storage";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Client } from "tmi.js";

  const participants = $state<{ id: string; name: string }[]>([]);
  let lastParticipants = $state<{ id: string; name: string }[]>([]);
  const global = useLocalStorage("global");
  const blacklistedUsers = useLocalStorage("blacklist-users");
  let nameFilter = $state("");
  const sortedFilteredData = $derived((() => {
    const sortedParticipant = participants.toSorted((a, b) => a.name.localeCompare(b.name));

    if (nameFilter.trim() === "") return sortedParticipant;

    return sortedParticipant.filter((value) => value.name.toLowerCase().includes(nameFilter.toLowerCase()));
  })());

  onMount(async () => {
    const client = new Client({
      channels: [global.value.channelID],
    });
    await client.connect();

    client.on("message", (_, user, message) => {
      if (user.username === undefined || user["display-name"] === undefined) {
        return;
      }

      if (user.username === global.value.channelID) {
        return;
      }

      if (message !== global.value.keyword) {
        return;
      }

      if (participants.values().find((v) => v.id === user.username) !== undefined) {
        return;
      }

      if (blacklistedUsers.value.find((v) => v.id === user.username) !== undefined) {
        return;
      }

      participants.push({
        id: user.username,
        name: user["display-name"],
      });
      lastParticipants.push({
        id: user.username,
        name: user["display-name"],
      });

      // Remove the participant after 10 seconds (10000 ms)
      setTimeout(() => {
        lastParticipants = lastParticipants.filter((p) => p.id !== user.username);
      }, 10000);
    });
  });
</script>

<div class="h-screen flex items-center justify-center">
  <div class="grid grid-cols-3 grid-rows-1 h-1/2 w-full gap-2">
    <div class="flex flex-col justify-between gap-4">
      <div class="flex justify-between items-center">
        <Button class="w-full">Start giveaway</Button>
      </div>
      <div class="grow flex flex-col gap-1 overflow-y-hidden">
        {#each lastParticipants.toReversed() as user (user.id)}
          <div transition:fade><Badge variant="secondary">{user.name}</Badge></div>
        {/each}
      </div>
      <div class="flex justify-between items-center">
        <Button class="w-full">Start animation</Button>
      </div>
    </div>
    <div class="col-span-2 flex flex-col justify-between gap-4">
      <div class="flex justify-between items-center gap-2">
        <Input
          class="w-full"
          placeholder="Filter names..."
          type="text"
          bind:value={nameFilter}
        />
        <Button variant="outline" disabled={nameFilter === ""} on:click={() => { nameFilter = ""; }} >
          <X class="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea class="grow">
        <div class="flex flex-wrap gap-1">
          {#each sortedFilteredData as { id, name } (id)}
            <Badge variant="outline">{name}</Badge>
          {/each}
        </div>
      </ScrollArea>
    </div>
  </div>
</div>
