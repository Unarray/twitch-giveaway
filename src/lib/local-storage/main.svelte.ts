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
  "participants": z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).default([]),
} as const;

export const useLocalStorage = <K extends keyof typeof localStorageSchemas>(key: K, initialValue: z.input<typeof localStorageSchemas[K]> = undefined) => {
  let value = $state<z.output<typeof localStorageSchemas[K]>>(localStorageSchemas[key].parse(initialValue));

  onMount(() => {
    const currentValue = localStorage.getItem(key);

    if (currentValue !== null) {
      value = localStorageSchemas[key].parse(JSON.parse(currentValue));
    }
    else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  return [
    () => {
      return value;
    },
    (v: z.input<typeof localStorageSchemas[K]>) => {
      value = localStorageSchemas[key].parse(v);
      localStorage.setItem(key, JSON.stringify(value));
    },
  ] as const;

  // return [
  //   () => value,
  //   (v: z.input<typeof localStorageSchemas[K]>) => {
  //     value = localStorageSchemas[key].parse(v);
  //     save();
  //   },
  // ] as const;
};
