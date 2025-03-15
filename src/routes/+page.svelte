<script>
  import { useLocalStorage } from "$lib/local-storage";

  const channelID = useLocalStorage("channel-id");
  const enterKeyword = useLocalStorage("enter-keyword");
  const blacklistUsers = useLocalStorage("blacklist-users");
</script>
