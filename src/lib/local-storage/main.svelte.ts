import { onMount } from "svelte";
import { z } from "zod";

// Define the schema for each localStorage item
export const localStorageSchemas = {
  "global": z.object({
    channelID: z.string().default(""),
    keyword: z.string().default("!giveaway"),
  }).default({}),
  "giveaway": z.object({
    enteringTime: z.number().default(60 * 2),
    autoStart: z.boolean().default(false),
  }).default({}),
  "blacklist-users": z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).default([]),
} as const;

export const useLocalStorage = <K extends keyof typeof localStorageSchemas>(key: K, initialValue: z.input<typeof localStorageSchemas[K]> = undefined) => {
  let value = $state<z.output<typeof localStorageSchemas[K]>>(localStorageSchemas[key].parse(initialValue));

  onMount(() => {
    const currentValue = localStorage.getItem(key);
    if (currentValue) value = localStorageSchemas[key].parse(JSON.parse(currentValue));
  });

  const save = () => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return {
    get value(): z.output<typeof localStorageSchemas[K]> {
      return value;
    },
    set value(v: z.input<typeof localStorageSchemas[K]>) {
      value = localStorageSchemas[key].parse(v);
      save();
    },
  };
};
