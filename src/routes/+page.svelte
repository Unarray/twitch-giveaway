<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { useLocalStorage } from "$lib/local-storage";
  import { onMount } from "svelte";
  import { Client } from "tmi.js";

  const participants = $state<{ id: string; name: string }[]>([]);
  const global = useLocalStorage("global");
  const blacklistedUsers = useLocalStorage("blacklist-users");
  onMount(async () => {
    console.log(global.value.channelID);

    const client = new Client({
      channels: [global.value.channelID],
    });
    await client.connect();

    client.on("message", (_, user, message) => {
      if (user.username === undefined || user["display-name"] === undefined) {
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
    });
  });
</script>

<div class="min-h-screen min-w-max flex items-center justify-center grid grid-cols-3">
    <div class="col-span-1 flex flex-col">
      <Button >Start giveaway</Button>
      <ScrollArea class="h-96 w-full flex flex-col-reverse" >
        {#each participants.toReversed() as user (user.id)}
          <div>{user.name}</div>
        {/each}
      </ScrollArea>
      <Button>Start animation</Button>
    </div>
    <div class="col-span-2">

    </div>
</div>
