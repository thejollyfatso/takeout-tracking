import { getOrInitMeta, saveMeta } from './index';

export async function addCuisine(cuisine: string): Promise<void> {
  const meta = await getOrInitMeta();
  if (!meta.cuisineList.includes(cuisine)) {
    meta.cuisineList = [...meta.cuisineList, cuisine].sort();
    await saveMeta(meta);
  }
}

export async function deleteCuisine(cuisine: string): Promise<void> {
  const meta = await getOrInitMeta();
  meta.cuisineList = meta.cuisineList.filter(c => c !== cuisine);
  await saveMeta(meta);
}

export async function addTag(tag: string): Promise<void> {
  const meta = await getOrInitMeta();
  if (!meta.tagList.includes(tag)) {
    meta.tagList = [...meta.tagList, tag].sort();
    await saveMeta(meta);
  }
}

export async function renameTag(oldTag: string, newTag: string): Promise<string[]> {
  const meta = await getOrInitMeta();
  meta.tagList = meta.tagList.map(t => t === oldTag ? newTag : t).sort();
  await saveMeta(meta);
  return meta.tagList;
}

export async function deleteTag(tag: string): Promise<void> {
  const meta = await getOrInitMeta();
  meta.tagList = meta.tagList.filter(t => t !== tag);
  await saveMeta(meta);
}
