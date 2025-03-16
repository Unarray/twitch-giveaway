<script lang="ts">
  import type { User } from "./type";
  import DataTableActions from "./actions.svelte";
  import DataTableCheckbox from "./checkbox.svelte";
  import * as Table from "$lib/components/ui/table";
  import {
    createTable,
    Render,
    Subscribe,
    createRender,
  } from "svelte-headless-table";
  import { addSelectedRows } from "svelte-headless-table/plugins";
  import { writable } from "svelte/store";

  const { data }: { data: User[] } = $props();
  const dataStore = writable(data);

  // Example function to delete a row
  const deleteRows = (ids: string[]): void => {
    dataStore.update((users) => users.filter((user) => ids.includes(user.id) === false));
  };

  const table = createTable(
    dataStore,
    {
      select: addSelectedRows(),
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
    }),
    table.column({
      accessor: "name",
      header: "Name",
    }),
    table.column({
      accessor: ({ id }) => id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value, removeID: (id) => deleteRows([id]) });
      },
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } = table.createViewModel(columns);
  const { selectedDataIds } = pluginStates.select;
</script>

<div class="rounded-md border">
  <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                <Table.Head {...attrs} >
                  <Render of={cell.render()} />
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
                  <Render of={cell.render()} />
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
<div class="text-muted-foreground flex-1 text-sm">
  {Object.keys($selectedDataIds).length} of {$rows.length} row{$rows.length > 1 ? "s" : ""} selected.
</div>
