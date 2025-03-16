<script lang="ts">
  import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Separator } from "$lib/components/ui/separator";
  import { useLocalStorage } from "$lib/local-storage";

  const channelID = useLocalStorage("channel-id");
  const enterKeyword = useLocalStorage("enter-keyword");
  const blacklistUsers = useLocalStorage("blacklist-users");
  const tags = [...Array(14)].map(() => String(Math.random() * 100));
</script>

<div class="min-h-screen min-w-max flex items-center justify-center">
  <div class="flex justify-around w-full">
    <div class="flex flex-col gap-4">
      <div class="flex w-full max-w-sm flex-col gap-1.5">
        <Label for="channel">Channel</Label>
        <Input type="channel" id="channel" placeholder="channel" bind:value={channelID.value} />
      </div>
      <div class="flex w-full max-w-sm flex-col gap-1.5">
        <Label for="keyword">Keyword</Label>
        <Input type="keyword" id="keyword" placeholder="keyword" bind:value={enterKeyword.value} />
      </div>
    </div>
    <div class="flex flex-col gap-4 w-1/3">
      <Button>Start Giveaway</Button>
      <ScrollArea class="h-72 w-48 rounded-md border" title="TAGS">
        <div class="p-4">
          <h4 class="mb-4 text-sm font-medium leading-none">Tags</h4>
          {#each tags as tag, i (i)}
            <div class="text-sm">
              {tag}
            </div>
            <Separator class="my-2" />
          {/each}
        </div>
      </ScrollArea>
    </div>
  </div>
</div>
