<script lang="ts">
  import { Breadcrumb } from "$lib/components/molecules/breadcrumb";
  const { children } = $props();
</script>

<div class="py-6">
  <Breadcrumb />
</div>

{@render children()}
