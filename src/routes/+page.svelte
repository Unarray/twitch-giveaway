<script lang="ts">
  import ListX from "@lucide/svelte/icons/list-x";
  import Lock from "@lucide/svelte/icons/lock";
  import LockOpen from "@lucide/svelte/icons/lock-open";
  import Play from "@lucide/svelte/icons/play";
  import Trash_2 from "@lucide/svelte/icons/trash-2";
  import X from "@lucide/svelte/icons/x";
  import { Badge } from "$lib/components/ui/badge";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Separator } from "$lib/components/ui/separator";
  import { Slider } from "$lib/components/ui/slider";
  import { Switch } from "$lib/components/ui/switch";
  import { useLocalStorage } from "$lib/local-storage";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Client } from "tmi.js";

  // CONFIG
  const [global] = useLocalStorage("global");
  const [giveaway, setGiveaway] = useLocalStorage("giveaway");
  const [blacklistedUsers] = useLocalStorage("blacklist-users");
  const [participants, setParticipants] = useLocalStorage("participants");

  // APP
  const formattedTime = $derived.by(() => {
    const minutes = Math.floor(giveaway().enteringTime / 60);
    const seconds = giveaway().enteringTime - minutes * 60;

    return {
      minutes,
      seconds,
    };
  });

  let lastParticipants = $state<{ id: string; name: string }[]>([]);
  let nameFilter = $state("");
  const sortedFilteredData = $derived.by(() => {
    const sortedParticipant = participants().toSorted((a, b) => a.name.localeCompare(b.name));

    if (nameFilter.trim() === "") return sortedParticipant;

    return sortedParticipant.filter((value) => value.name.toLowerCase().includes(nameFilter.toLowerCase()));
  });
  let timerEnabled = $state(false);
  let isOpen = $state(false);
  let totalSeconds = $state(0);
  let remainingSeconds = $state(0);
  const percentDone = $derived.by(() => {
    if (isOpen === false) return 0;
    if (timerEnabled === false) return 100;

    return 100 - remainingSeconds * 100 / totalSeconds;
  });
  const getColorByPercent = (percent: number) => {
    const hue = ((1 - (percent / 100)) * 120).toString(10);
    return {
      forground: ["hsl(", hue, ",100%,50%)"].join(""),
      background: ["hsl(", hue, ",80%,20%)"].join(""),
    };
  };
  const progressBarColor = $derived.by(() => {
    if (isOpen === false) return getColorByPercent(100);

    if (timerEnabled === false) return getColorByPercent(0);

    return getColorByPercent(percentDone);
  });
  const onOpenGiveaway = () => {
    isOpen = true;

    console.log(timerEnabled);

    if (timerEnabled === false) return;

    totalSeconds = giveaway().enteringTime;
    remainingSeconds = giveaway().enteringTime;

    const interval = setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds > 0) return;

      clearInterval(interval);
      isOpen = false;
    }, 1000);
  };
  const onCloseGiveaway = () => {
    isOpen = false;
  };

  let selectedParticipant = $state<string[]>([]);
  const toggleSelection = (id: string) => {
    if (selectedParticipant.includes(id)) {
      selectedParticipant = selectedParticipant.filter((s) => s !== id);
    }
    else {
      selectedParticipant.push(id);
    }
  };

  onMount(async () => {
    const interval = (ms: number) => setTimeout(() => {
      const randomLength = Math.floor(Math.random() * 25) + 4;
      const randomBytes = new Uint8Array(randomLength);
      crypto.getRandomValues(randomBytes);

      const name = Array.from(randomBytes)
        .map((m) => (`0${m.toString(16)}`).slice(-2))
        .join("");

      if (isOpen === true) {
        setParticipants([
          ...participants(),
          {
            id: name.toLowerCase(),
            name: name.toUpperCase(),
          },
        ]);
        lastParticipants.push({
          id: name.toLowerCase(),
          name: name.toUpperCase(),
        });
      }

      // Remove the participant after 10 seconds (10000 ms)
      setTimeout(() => {
        lastParticipants = lastParticipants.filter((p) => p.id !== name.toLowerCase());
      }, 10000);

      interval(1000 * (Math.random() * 5));
    }, ms);
    interval(1000 * (Math.random() * 5));

    const client = new Client({
      channels: [global().channelID],
    });
    await client.connect();

    client.on("message", (_, { username: id, "display-name": name }, message) => {
      if (isOpen === false) return;

      if (id === undefined || name === undefined) return;
      if (id === global().channelID) return;

      if (message !== global().keyword) return;

      if (participants().find((v) => v.id === id) !== undefined) return;
      if (blacklistedUsers().find((v) => v.id === id) !== undefined) return;

      setParticipants([
        ...participants(),
        {
          id: id,
          name: name,
        },
      ]);
      lastParticipants.push({
        id: id,
        name: name,
      });

      // Remove the participant after 10 seconds (10000 ms)
      setTimeout(() => {
        lastParticipants = lastParticipants.filter((p) => p.id !== id);
      }, 10000);
    });
  });
</script>

<div class="h-screen flex items-center justify-center">
  <div class="grid grid-cols-3 grid-rows-1 h-1/2 w-full gap-2">
    <div class="flex flex-col justify-between gap-2">
      <Card.Root>
        <Card.Content class="flex flex-col justify-between gap-4">
          <div class="flex justify-between items-center">
            <Dialog.Root>
              <div class="w-full flex gap-2">
                <div class="flex flex-col grow">
                  <div
                    class="relative overflow-hidden rounded h-full flex justify-center items-center"
                    style={`background: ${progressBarColor.background};`}
                  >
                  <div
                    class="absolute h-full w-full transition-all"
                    style={`
                      transform: translateX(-${100 - percentDone}%);
                      background: ${progressBarColor.forground};
                    `}
                  ></div>
                    <Badge class="pointer-events-none z-10 text-sm flex gap-1">
                      {#if isOpen}
                        Giveaway open!
                        {#if timerEnabled}
                          <span class="justify-self-end"> ({remainingSeconds})</span>
                        {/if}
                      {:else}
                        Giveaway close
                      {/if}
                    </Badge>
                  </div>
                </div>
                {#if isOpen === false}
                  <Dialog.Trigger class={`${buttonVariants({ variant: "ghost", size: "icon" })} flex justify-center items-center`}>
                    <Lock />
                  </Dialog.Trigger>
                {:else}
                  <Button variant="outline" size="icon" on:click={onCloseGiveaway}>
                    <LockOpen />
                  </Button>
                {/if}
              </div>

              <!-- DIALOG CONTENT -->
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Open giveaway</Dialog.Title>
                </Dialog.Header>
                <Separator class="my-4" />
                <div class="flex gap-2 items-center">
                  <Switch id="timer-enabled" bind:checked={timerEnabled} />
                  <Label for="timer-enabled">Enable giveaway closing timer</Label>
                </div>
                {#if timerEnabled}
                  <div id="timer-time" class="flex flex-col gap-2">
                    <div class="flex gap-1.5 justify-between items-center">
                      <Label for="timer-time">Entering time</Label>
                      <span>{formattedTime.minutes} min {formattedTime.seconds} sec</span>
                      <Input class="w-20" type="number" bind:value={() => giveaway().enteringTime, (v) => { setGiveaway({ ...giveaway(), enteringTime: v }); }} />
                    </div>
                    <Slider bind:value={ () => [giveaway().enteringTime], (v) => { setGiveaway({ ...giveaway(), enteringTime: v[0] }); } } max={60 * 10} step={1} />
                  </div>
                {/if}
                <Dialog.Footer>
                  <Dialog.Close on:click={onOpenGiveaway} class={`w-full ${buttonVariants({ variant: "default" })}`}>
                    Start {timerEnabled ? "timer" : ""}
                  </Dialog.Close>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Root>
          </div>
          <div class="flex justify-between items-center">
            <Button disabled={isOpen === true || participants().length < 1} variant="outline" class="w-full flex justify-center items-center gap-2">
              <Play class="h-5 w-5" />
              <span>Start animation</span>
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
      <div class="grow overflow-hidden">
        <Card.Root class="h-full flex flex-col">
          <Card.Header>
            <Card.Title>Last participants</Card.Title>
          </Card.Header>
          <Card.Content class="h-full overflow-hidden">
            <div class="flex flex-col h-full gap-1 overflow-hidden mask-fade">
              {#each lastParticipants.toReversed() as user (user.id)}
                <div transition:fade>
                  <Badge variant="secondary" class="w-fit max-w-full block overflow-hidden truncate">{user.name}</Badge>
                </div>
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
    <div class="col-span-2 h-full flex flex-col">
      <Card.Root class="h-full flex flex-col">
        <Card.Header>
          <Card.Title>{participants().length} Participants</Card.Title>
        </Card.Header>
        <Card.Content class="h-full overflow-hidden">
          <div class="h-full flex flex-col gap-4">
            <div class="flex justify-between items-center gap-16">
              <div class="flex justify-between items-center w-2/4 gap-2">
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
              <div class="flex justify-center items-center">
                <Button class="flex justify-between items-center gap-2" variant="outline" disabled={participants().length < 1} on:click={() => {
                  setParticipants([]);
                  lastParticipants = [];
                  selectedParticipant = [];
                }} >
                  <Trash_2 class="h-4 w-4" />
                  <span>clear</span>
                </Button>
                <Button class="flex justify-between items-center gap-2" variant="outline" disabled={selectedParticipant.length < 1} on:click={() => {
                  setParticipants(participants().filter((v) => selectedParticipant.includes(v.id) === false));
                  selectedParticipant = [];
                }} >
                  <ListX class="h-4 w-4" />
                  <span>{selectedParticipant.length}</span>
                </Button>
              </div>
            </div>
            <div class="grow overflow-hidden mask-fade">
              <ScrollArea orientation="vertical" class="h-full">
                <div class="flex flex-wrap gap-1">
                  {#each sortedFilteredData as { id, name } (id)}
                    <button
                      transition:fade
                      class="cursor-pointer"
                      onclick={() => {
                        toggleSelection(id);
                      }}
                    >
                      <Badge variant={selectedParticipant.includes(id) ? "default" : "outline"} class="w-fit break-normal">{name}</Badge>
                    </button>
                  {/each}
                </div>
              </ScrollArea>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>

<style>
  .mask-fade {
    mask-image: linear-gradient(to top, transparent, white 25%);
  }
</style>
