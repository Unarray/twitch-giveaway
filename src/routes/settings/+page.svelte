<script lang="ts">
  import { UsersTable } from "$lib/components/molecules/users-table";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import { Slider } from "$lib/components/ui/slider";
  import { Switch } from "$lib/components/ui/switch";
  import { useLocalStorage } from "$lib/local-storage";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const global = useLocalStorage("global");
  const giveaway = useLocalStorage("giveaway");
  const formattedTime = $derived((() => {
    const minutes = Math.floor(giveaway.value.enteringTime / 60);
    const seconds = giveaway.value.enteringTime - minutes * 60;

    return {
      minutes,
      seconds,
    };
  })());

  const blacklistedUsers = useLocalStorage("blacklist-users");
  const blacklistUsersWritable = writable(blacklistedUsers.value);

  onMount(() => {
    blacklistUsersWritable.set(blacklistedUsers.value);
    blacklistUsersWritable.subscribe((users) => {
      blacklistedUsers.value = users;
    });
  });
</script>

<div class="min-w-max flex items-start justify-center my-12">
  <div class="flex flex-col gap-6 w-full">
    <!-- GLOBAL -->
    <Card.Root class="w-full">
      <Card.Header>
        <Card.Title>Global</Card.Title>
      </Card.Header>
      <Card.Content class="grid grid-cols-2 gap-4 w-full">
        <div class="flex flex-col gap-1.5">
          <Label for="channel">Channel</Label>
          <Input type="text" id="channel" placeholder="channel" bind:value={() => global.value.channelID, (v) => { global.value = { ...global.value, channelID: v }; }} />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="keyword">Keyword</Label>
          <Input type="text" id="keyword" placeholder="keyword" bind:value={() => global.value.keyword, (v) => { global.value = { ...global.value, keyword: v }; }} />
        </div>
      </Card.Content>
    </Card.Root>

    <!-- GIVEAWAY -->
    <Card.Root class="w-full">
      <Card.Header>
        <Card.Title>Giveaway</Card.Title>
      </Card.Header>
      <Card.Content class="grid grid-cols-1 gap-6 w-full">
        <div id="timer-time" class="flex flex-col gap-2">
          <div class="flex gap-1.5 justify-between items-center">
            <Label for="timer-time">Entering time</Label>
            <span>{formattedTime.minutes} min {formattedTime.seconds} sec</span>
            <Input class="w-20" type="number" bind:value={() => giveaway.value.enteringTime, (v) => { giveaway.value = { ...giveaway.value, enteringTime: v }; }} />
          </div>
          <Slider bind:value={ () => [giveaway.value.enteringTime], (v) => { giveaway.value = { ...giveaway.value, enteringTime: v[0] }; } } max={60 * 10} step={1} />
        </div>
        <Separator />
        <div class="grid grid-flow-row grid-flow-col gap-4 w-full">
          <div class="flex items-center gap-2">
            <Switch id="auto-start-animation" bind:checked={() => giveaway.value.autoStart, (v) => { giveaway.value = { ...giveaway.value, autoStart: v }; }}/>
            <Label for="auto-start-animation">Auto start animation</Label>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <!-- BLACKLIST -->
    <Card.Root class="w-full">
      <Card.Header>
        <Card.Title>Blacklist</Card.Title>
      </Card.Header>
      <Card.Content class="grid grid-cols-1 gap-6 w-full">
        <UsersTable data={blacklistUsersWritable} />
      </Card.Content>
    </Card.Root>
  </div>
</div>
