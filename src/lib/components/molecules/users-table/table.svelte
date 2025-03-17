<script lang="ts">
  import type { User } from "./type";
  import DataTableActions from "./actions.svelte";
  import DataTableCheckbox from "./checkbox.svelte";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash from "@lucide/svelte/icons/trash-2";
  import X from "@lucide/svelte/icons/x";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import * as Pagination from "$lib/components/ui/pagination";
  import * as Table from "$lib/components/ui/table";
  import {
    createTable,
    Render,
    Subscribe,
    createRender,
  } from "svelte-headless-table";
    import { addPagination, addSelectedRows, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
    import { toast } from "svelte-sonner";
    import { get, type Writable } from "svelte/store";

  const { data }: { data: Writable<User[]> } = $props();
  let itemCount = $state(get(data).length);

  data.subscribe((v) => {
    itemCount = v.length;
  });
  // Example function to delete a row
  const deleteRows = (ids: string[]): void => {
    data.update((users) => users.filter((user) => ids.includes(user.id) === false));
  };

  const itemPerPage = 5;
  const table = createTable(
    data,
    {
      select: addSelectedRows(),
      page: addPagination({ initialPageSize: itemPerPage }),
      sort: addSortBy(),
      filter: addTableFilter({
        fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase()),
      }),
    },
  );
  const columns = table.createColumns([
    table.column({
      accessor: "id",
      header: (_, { pluginStates }) => {
        const { allPageRowsSelected } = pluginStates.select;
        return createRender(DataTableCheckbox, {
          checked: allPageRowsSelected,
        });
      },
      cell: ({ row }, { pluginStates }) => {
        const { getRowState } = pluginStates.select;
        const { isSelected } = getRowState(row);

        return createRender(DataTableCheckbox, {
          checked: isSelected,
        });
      },
      plugins: {
        sort: {
          disable: true,
        },
        filter: {
          exclude: true,
        },
      },
    }),
    table.column({
      accessor: "name",
      header: "Name",
    }),
    table.column({
      id: "action",
      accessor: ({ id }) => id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value, removeID: (id) => deleteRows([id]) });
      },
      plugins: {
        sort: {
          disable: true,
        },
        filter: {
          exclude: true,
        },
      },
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } = table.createViewModel(columns, {
    rowDataId: (user) => user.id,
  });
  const { selectedDataIds } = pluginStates.select;
  const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
  const { filterValue } = pluginStates.filter;
  const selectedDataCount = $derived(Object.keys($selectedDataIds).length);

  let addBlacklistedMember = $state("");
  const handleAddBlacklistedMember = () => {
    const cleanedName = addBlacklistedMember.trim();
    const lowercasedName = cleanedName.toLowerCase();
    const values = get(data);

    if (values.find((v) => v.id === lowercasedName) !== undefined) {
      toast(`${cleanedName} Already blacklisted`);
      return;
    }

    data.set([...values, { id: lowercasedName, name: cleanedName }]);
  };
</script>

<!-- HEADER -->
<div class="flex justify-between items-center">
  <div class="flex items-center gap-2">
    <Input
      class="w-96"
      placeholder="Filter names..."
      type="text"
      bind:value={$filterValue}
    />
    <Button variant="outline" disabled={$filterValue === ""} on:click={() => { $filterValue = ""; }} >
      <X class="h-4 w-4" />
    </Button>
  </div>
  <div class="flex items-center justify-between gap-4">
    <Button
      class="flex justify-between items-center gap-2"
      variant="destructive"
      disabled={selectedDataCount < 1}
      on:click={() => {
        const ids = Object.keys($selectedDataIds);
        deleteRows(ids);
      }}
    >
      <Trash class="h-4 w-4" />
      <span>{selectedDataCount}</span>
    </Button>

    <Dialog.Root>
      <Dialog.Trigger>
        <Button
        class="flex justify-between items-center gap-2"
        on:click={() => {
          const ids = Object.keys($selectedDataIds);
          deleteRows(ids);
        }}
      >
      <Plus class="h-4 w-4" />
    </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header class="mb-4">
          <Dialog.Title>Add an user to the blacklisted users?</Dialog.Title>
        </Dialog.Header>
          <Input
            placeholder="Username"
            type="text"
            bind:value={addBlacklistedMember}
          />
          <Button disabled={addBlacklistedMember === ""} on:click={handleAddBlacklistedMember} >
            <Plus class="h-4 w-4" />
            <span>Add to blacklist</span>
          </Button>
      </Dialog.Content>
    </Dialog.Root>

  </div>
</div>

<!-- DATA TABLE -->
<div class="rounded-md border font-medium">
  <Table.Root {...$tableAttrs}>
    <Table.Header class="sticky top-0 ">
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                <Table.Head {...attrs}>
                  {#if cell.id === "action"}
                    <div class="text-right">
                      <Render of={cell.render()} />
                    </div>
                  {:else if cell.id === "name"}
                    <Button variant="ghost" on:click={props.sort.toggle} class="flex justify-between">
                      <Render of={cell.render()} />
                      {#if props.sort.order === "asc"}
                        <ArrowUp class="ml-2 h-4 w-4" />
                      {:else if props.sort.order === "desc"}
                        <ArrowDown class="ml-2 h-4 w-4" />
                      {:else}
                        <ArrowUpDown class="ml-2 h-4 w-4" />
                      {/if}
                    </Button>
                  {:else}
                    <Render of={cell.render()} />
                  {/if}
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && "selected"}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs}>
                  {#if cell.id === "action"}
                    <div class="text-right">
                      <Render of={cell.render()} />
                    </div>
                  {:else}
                    <Render of={cell.render()} />
                  {/if}
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}

    </Table.Body>
  </Table.Root>
</div>

<!-- FOOTER -->
<div class="flex justify-between items-center">
  <div class="text-muted-foreground flex-1 text-sm">
    {selectedDataCount} of {$rows.length} row{$rows.length > 1 ? "s" : ""} selected.
  </div>
  <div class="flex items-center justify-end space-x-4 py-4">
    <Pagination.Root count={itemCount} perPage={itemPerPage} let:pages>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton disabled={!$hasPreviousPage} on:click={() => ($pageIndex = $pageIndex - 1)} />
        </Pagination.Item>
        {#each pages as page (page.key)}
          {#if page.type === "ellipsis"}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item >
              <Pagination.Link {page} isActive={(page.value - 1) === $pageIndex} on:click={() => ($pageIndex = (page.value - 1))} >
                {page.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton disabled={!$hasNextPage} on:click={() => ($pageIndex = $pageIndex + 1)} />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  </div>
</div>
