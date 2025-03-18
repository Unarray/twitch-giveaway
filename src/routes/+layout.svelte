<script lang="ts">
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import House from "@lucide/svelte/icons/house";
  import Moon from "@lucide/svelte/icons/moon";
  import Settings from "@lucide/svelte/icons/settings";
  import Sun from "@lucide/svelte/icons/sun";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Toaster } from "$lib/components/ui/sonner";
  import { ModeWatcher } from "mode-watcher";
  import { toggleMode, mode } from "mode-watcher";
  import "../app.css";
  const { children } = $props();

  const isHomePage = $derived(page.url.pathname === "/");
</script>

<Toaster />
<ModeWatcher />

<div class="fixed top-0 right-0 m-2 flex items-center justify-end gap-2">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="outline" size="icon">
        <Ellipsis class="h-5 w-5" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Giveaway app</DropdownMenu.Label>
        <DropdownMenu.Separator />
        {#if isHomePage}
          <DropdownMenu.Item href="/settings" class="flex items-center justify-start gap-2">
              <Settings class="h-5 w-5" />
              <span>settings</span>
          </DropdownMenu.Item>
        {:else}
          <DropdownMenu.Item href="/" class="flex items-center justify-start gap-2">
            <House class="h-5 w-5" />
            <span>home</span>
          </DropdownMenu.Item>
        {/if}
        <DropdownMenu.Separator />

        <DropdownMenu.Item on:click={toggleMode} class="flex items-center justify-start gap-2">
          <Sun
            class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Moon
            class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span>{$mode}</span>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
<!--
  {#if isHomePage}
    <Button href="/settings" variant="outline" size="icon">
      <Settings
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  {:else}
    <Button href="/" variant="outline" size="icon">
      <House
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  {/if}

  <Button on:click={toggleMode} variant="outline" size="icon">
    <Sun
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </Button> -->
</div>

<main class="mx-auto w-10/12">
{@render children()}
</main>
