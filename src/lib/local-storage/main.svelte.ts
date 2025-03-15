import { onMount } from "svelte";
import { z } from "zod";

// Define the schema for each localStorage item
export const localStorageSchemas = {
  "channel-id": z.string().default(""),
  "enter-keyword": z.string().default("!giveaway"),
  "blacklist-users": z.array(z.string()).default([]),
} as const;

export const useLocalStorage = <K extends keyof typeof localStorageSchemas>(key: K, initialValue: z.input<typeof localStorageSchemas[K]> = undefined) => {
  let value = $state<z.output<typeof localStorageSchemas[K]>>(localStorageSchemas[key].parse(initialValue));

  onMount(() => {
    const currentValue = localStorage.getItem(key);
    if (currentValue) value = localStorageSchemas[key].parse(JSON.parse(currentValue));
  });

  const save = () => {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    else {
      localStorage.removeItem(key);
    }
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
