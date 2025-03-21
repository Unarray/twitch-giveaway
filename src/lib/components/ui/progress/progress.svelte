<script lang="ts">
	import { cn } from "$lib/utils";
	import { Progress as ProgressPrimitive } from "bits-ui";

	// Extend the base props to include `barProps`
	type BaseProps = ProgressPrimitive.Props;
	type ProgressComponentProps = BaseProps & { barProps?: Record<string, any> };

	let className: ProgressComponentProps["class"];
	export let max: ProgressComponentProps["max"] = 100;
	export let value: ProgressComponentProps["value"];
	export let barProps: ProgressComponentProps["barProps"] = {};
	export { className as class };
</script>

<ProgressPrimitive.Root
	class={cn("bg-secondary relative h-4 w-full overflow-hidden rounded-full", className)}
	{...$$restProps}
>
	<div
		{...barProps}
		class={cn("bg-primary h-full w-full flex-1 transition-all", barProps.class)}
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%); ${barProps.style}`}
	></div>
</ProgressPrimitive.Root>
