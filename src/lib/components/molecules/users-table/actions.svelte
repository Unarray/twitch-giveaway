<script lang="ts">
  import ClipboardCopy from "@lucide/svelte/icons/clipboard-copy";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import Trash from "@lucide/svelte/icons/trash-2";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { toast } from "svelte-sonner";

  export let id: string;
  export let removeID: (id: string) => void;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id);
    toast(`"${id}" copied to clipboard!`);
  };

</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="ghost"
      builders={[builder]}
      size="icon"
      class="relative h-8 w-8 p-0"
    >
      <span class="sr-only">Open menu</span>
      <Ellipsis class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Item on:click={copyToClipboard}>
        <ClipboardCopy class="h-4 w-4 mr-1" />
          Copy user ID
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item on:click={() => removeID(id)}>
      <Trash class="h-4 w-4 mr-1" />
      <span>Remove user</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
