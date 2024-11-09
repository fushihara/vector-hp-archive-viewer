import { z } from "zod";
import { readFile } from "node:fs/promises"
import { chunk } from "./chunk";
import { SITE_PER_PAGE } from "./ppv";
const iaSaveUrl = z.object({
  "id": z.number(),
  "timestamp_str": z.string().regex(/^\d{14}$/),
  "original_url": z.string().url(),
  "host": z.string(),
  "path": z.string(),
  "author_id": z.string(),
  "mimetype": z.string(),
  "status_code": z.number().int().min(0),
  "data_length": z.number().int().min(0),
});
const zodType = z.object({
  allVaList: z.array(z.string()),
  titleMap: z.record(z.string(), z.array(z.string())),
  allIaSaveUrlList: z.array(iaSaveUrl)
});
let iaSaveUrlCache: Map<string, z.infer<typeof iaSaveUrl>[]> | null = null;
let localCache: {
  allJson: z.infer<typeof zodType>,
  iaSaveUrlCache: Map<string, z.infer<typeof iaSaveUrl>[]>,
} | null = null;
async function loadJsonData2() {
  if (localCache != null) {
    return localCache;
  }
  const obj = await readFile(process.env["JSON_FILE_PATH"]!, { encoding: "utf-8" })
    .then(JSON.parse)
    .then(rawObj => {
      return zodType.parse(rawObj);
    });
  //obj.allVaList.length = 303;
  if (process.env["JSON_LOAD_LIMIT_ITEM"]) {
    obj.allVaList.length = Number(process.env["JSON_LOAD_LIMIT_ITEM"]);
  }
  const newMap: NonNullable<typeof iaSaveUrlCache> = new Map();
  obj.allIaSaveUrlList.forEach(url => {
    const mapData = newMap.get(url.author_id);
    if (mapData) {
      mapData.push(url);
    } else {
      newMap.set(url.author_id, [url]);
    }
  });
  for (const [_, val] of newMap) {
    val.sort((a, b) => {
      if (a.path.toLowerCase() != b.path.toLowerCase()) {
        return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
      } else {
        return a.timestamp_str.localeCompare(b.timestamp_str);
      }
    })
  }
  localCache = {
    iaSaveUrlCache: newMap,
    allJson: obj,
  };
  return localCache!;
}
export async function getAllVaAndTitle() {
  const allVaNumber = await getAllVaNumber();
  const result: {
    vaNumber: number,
    lastTitle: string | null,
  }[] = [];
  for (const vaNumberStr of allVaNumber) {
    const vaIdNum = Number(vaNumberStr.match(/VA(\d{6})/)![1]);
    const title = await getTitle(vaNumberStr);
    result.push({ lastTitle: title, vaNumber: vaIdNum });
  }
  return result;
}
/**
 * ページの枚数を返す。アイテムが0件の時は0を返して、アイテムが1件以上は1を返す
 * @returns 
 */
export async function getAllPageCount() {
  const totalVaCount = await getAllVaNumber().then(data => data.length);
  const pageCount = Math.ceil(totalVaCount / SITE_PER_PAGE);
  return pageCount;
}
/**
 * @param vaIdStr VA012345 の様な文字列
 */
export async function getTitle(vaIdStr: string) {
  const allJsonData = await loadJsonData2();
  const title = allJsonData.allJson.titleMap[vaIdStr]?.[0] ?? null;
  return title;
}
/**
 * ["VA0123456"]の様なVAの番号の文字列を返す
 * @param pageFromZero 0始まりのページ番号
 */
export async function getVaNumberList(pageFromZero: number) {
  const allJsonData = await loadJsonData2();
  const chunkdData = chunk(allJsonData.allJson.allVaList, SITE_PER_PAGE)[pageFromZero];
  return chunkdData;
}
/**
 * 全てのVaの配列を返す
 * @returns 
 */
export async function getAllVaNumber() {
  const allJsonData = await loadJsonData2().then(all => {
    return all.allJson.allVaList;
  });
  return allJsonData;
}
/**
 * 
 * @param vaIdStr VA012345 の様な文字列
 */
export async function getIaUrlCache(vaIdStr: string) {
  const result = await loadJsonData2().then(allData => {
    return allData.iaSaveUrlCache;
  }).then(isSaveUrlCache => {
    const result = isSaveUrlCache.get(vaIdStr) ?? [];
    return result;
  })
  return result
}