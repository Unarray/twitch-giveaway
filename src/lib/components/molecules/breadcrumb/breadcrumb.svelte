<script lang="ts">
  import { page } from "$app/state";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";

  const crumbs = $derived((() => {
    const segments = page.url.pathname.split("/").filter(Boolean);
    let accumulatedPath = "";
    return segments.map((segment) => {
      accumulatedPath += `/${segment}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: accumulatedPath,
      };
    });
  })());
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    <!-- Root breadcrumb, can be modified if you need dynamic behavior here too -->
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    {#each crumbs as crumb (crumb)}
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href={crumb.href}>
          {crumb.title}
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
