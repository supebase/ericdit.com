export const useAssets = (image: string) => {
  const { $directus } = useNuxtApp();

  return `${$directus.url}assets/${image}`;
};
