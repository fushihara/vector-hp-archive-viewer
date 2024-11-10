import dateformat from "dateformat";
import { getAllPageCount, getAllVaNumber, getIaUrlCache, getTitle, getVaNumberList } from "../../../loadJson";
import "./style.css";
import Link2 from "../../_components/link2";

type PageType = {
  searchParams: Promise<Record<string, any>>,
  params: Promise<{
    pageId: string,
  }>
}
export default async function Page(context: PageType) {
  const pageId = getPageIdNumber((await context.params).pageId);
  const allVaList = await getAllVaNumber();
  const allPageCount = await getAllPageCount();
  const chunkdData = await getVaNumberList(pageId - 1);
  const elementList: JSX.Element[] = [];
  for (const vaIdStr of chunkdData) {
    const vaElementList: JSX.Element[] = [];
    const index = allVaList.indexOf(vaIdStr) + 1;
    const vaIdNum = Number(vaIdStr.match(/VA(\d{6})/)![1]);
    const iasSavedUrlListId = await getIaUrlCache(vaIdStr);
    const title = await getTitle(vaIdStr);
    const fullUrl = `https://hp.vector.co.jp/authors/${vaIdStr}/`;
    vaElementList.push(
      <h1 className="flex gap-4 items-baseline sticky top-[0px] bg-[canvas] z-[1]" key={`h1-${vaIdStr}`}>
        <a href={fullUrl}>VA.{vaIdNum}</a>
        <span className="text-sm font-normal">{index}/{allVaList.length}</span>
        <span className="text-sm font-normal">{title}</span>
      </h1>
    )
    if (iasSavedUrlListId.length == 0) {
      vaElementList.push(<>登録されているURLがありません</>)
    } else {
      const datas: IASavedUrlTableProp["datas"] = [];
      for (const iaSavedUrl of iasSavedUrlListId) {
        let displayUrl = iaSavedUrl.path;
        if (!displayUrl.startsWith(`/authors/${vaIdStr}/`)) {
          throw new Error(displayUrl);
        }
        displayUrl = displayUrl.substring(`/authors/${vaIdStr}`.length);
        const iASavedTimeMs = (() => {
          const m = iaSavedUrl.timestamp_str.match(/^(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})(?<min>\d{2})(?<sec>\d{2})/)!;
          const year = Number(m.groups!["year"]);
          const month = Number(m.groups!["month"]);
          const day = Math.max(Number(m.groups!["day"]), 1); // day は 0日という場合があったので、その時は1日にする
          const hour = Number(m.groups!["hour"]);
          const min = Number(m.groups!["min"]);
          const sec = Number(m.groups!["sec"]);
          const d = new Date(`${year}-${month}-${day} ${hour}:${min}:${sec}`);
          return d.getTime();
        })();
        // 20240718114436
        datas.push({
          statusCode: iaSavedUrl.status_code,
          fileSizeByte: iaSavedUrl.data_length,
          mimeType: iaSavedUrl.mimetype,
          IAFullUrl: `https://web.archive.org/web/${iaSavedUrl.timestamp_str}/${iaSavedUrl.original_url}`,
          IADisplayUrl: displayUrl,
          IASavedTimeMs: iASavedTimeMs,
        })
      }
      vaElementList.push(<IASavedUrlTable datas={datas} key={`hia1-${vaIdStr}`}></IASavedUrlTable>);
    }
    elementList.push(<div key={vaIdStr} className="p-1" id={`VA${String(vaIdNum).padStart(6, "0")}`}>{vaElementList}</div>)
  }
  return (
    <div className="container mx-auto font-mono">
      <h1>InternetArchiveに保存されている各サイトのファイル一覧</h1>
      <PagenationElement now={pageId} max={allPageCount} between={4} basePath="/archive-files"></PagenationElement>
      {elementList}
      <PagenationElement now={pageId} max={allPageCount} between={4} basePath="/archive-files"></PagenationElement>
    </div>
  );
}
export async function generateMetadata(context: PageType) {
  const p = (await context.params).pageId.match(/^page-(?<pageId>\d+)$/)?.groups?.["pageId"] ?? "";
  return {
    title: `Vectorアーカイブ ${p}ページ目`,
  }
}
export async function generateStaticParams() {
  return Array.from({ length: await getAllPageCount() }).map((data, index) => {
    return { pageId: `page-${index + 1}` };
  });
}
function getPageIdNumber(pageIdStr: string) {
  const m = pageIdStr.match(/page-(\d+)/)!;
  const id = Number(m[1]);
  return id;
}
type IASavedUrlTableProp = {
  datas: {
    statusCode: number,
    fileSizeByte: number,
    mimeType: string,
    IAFullUrl: string,
    IADisplayUrl: string,
    IASavedTimeMs: number,
  }[],
};
function IASavedUrlTable(prop: IASavedUrlTableProp) {
  const trElementList: JSX.Element[] = [];
  const numFormat = new Intl.NumberFormat('en-US');
  if (prop.datas.length == 0) {
    throw new Error();
  }
  const maxFileSize = prop.datas.map(d => d.fileSizeByte).reduce((a, b) => Math.max(a, b), 0);
  prop.datas.forEach(data => {
    const sizeBackgroundWidth = (data.fileSizeByte / maxFileSize) * 100;
    trElementList.push(
      <tr className="transition duration-300 ease-in-out hover:bg-gray-100" key={`${data.IAFullUrl}`}>
        <td className="border border-black px-1 py-0 text-right">{data.statusCode}</td>
        <td className="border border-black px-1 py-0 text-right relative">
          <div className="absolute h-full top-0 bg-green-200 right-0" style={{ "width": `${sizeBackgroundWidth}%` }}></div>
          <div className="relative">{numFormat.format(data.fileSizeByte)} byte</div>
        </td>
        <td className="border border-black px-1 py-0 text-left"><a href={data.IAFullUrl}>{data.IADisplayUrl}</a></td>
        <td className="border border-black px-1 py-0 text-left">{data.mimeType}</td>
        <td className="border border-black px-1 py-0 text-left">{dateformat(new Date(data.IASavedTimeMs), "yyyy/MM/dd HH:mm:ss")}</td>
      </tr>
    );
  });
  return (
    <table className="border-collapse bg-white text-sm font-light text-gray-900 ">
      <thead className="text-md sticky top-[47px] z-[1] top-0 bg-gray-100 font-medium">
        <tr>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-right" title="ステータスコード">St</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-right relative" title="ファイルサイズ">Size</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left">URL</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left">MimeType</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left" title="InternetArchiveに保存された日時">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {trElementList}
      </tbody>
    </table>
  );
}
function PagenationElement(prop: PagenationProp & { basePath: string }) {
  const elementList: JSX.Element[] = [];
  const baseClassVal = `flex border-black border border-solid block p-2`;
  const getUrl = (pageNum: number | null) => {
    return `${prop.basePath}/page-${pageNum}/`;
  };
  for (const e of createPagenation(prop)) {
    if (e.type == "back") {
      if (e.link != null) {
        elementList.push(<Link2 href={getUrl(e.link)} key={e.key} className={`${baseClassVal}`}>＜</Link2>);
      } else {
        elementList.push(<span key={e.key} className={`${baseClassVal}`}>＜</span>);
      }
    } else if (e.type == "next") {
      if (e.link != null) {
        elementList.push(<Link2 href={getUrl(e.link)} key={e.key} className={`${baseClassVal}`}>＞</Link2>);
      } else {
        elementList.push(<span key={e.key} className={`${baseClassVal}`}>＞</span>);
      }
    } else if (e.type == "num") {
      if (e.link != null) {
        elementList.push(<Link2 href={getUrl(e.link)} key={e.key} className={`${baseClassVal}`}>{e.num}</Link2>);
      } else {
        elementList.push(<span key={e.key} className={`${baseClassVal} bg-[cyan]`}>{e.num}</span>);
      }
    } else if (e.type == "sp") {
      elementList.push(<span key={e.key} className={`${baseClassVal}`}>...</span>);
    }
  }
  return (
    <div className={`flex gap-1 justify-center`}>
      {elementList}
    </div>
  );
}
type PagenationProp = {
  now: number,
  max: number,
  between: number,
}
function createPagenation(prop: PagenationProp) {
  if (prop.between < 0) {
    throw new Error(`betweenは0以上にして下さい`);
  }
  if (prop.max < 0) {
    throw new Error(`maxは0以上にして下さい`);
  }
  if (prop.now < 0) {
    throw new Error(`nowは0以上にして下さい`);
  }
  if (prop.max < prop.now) {
    throw new Error(`nowの値はmaxと同じか、より小さな値にして下さい. now:${prop.now} , max:${prop.max}`);
  }
  if (prop.max == 0) {
    return [];
  }
  const MIN = 1;
  // 左・中・右の3ブロックの変数を作成
  const blockLeft = MIN;
  let blockMiddle = [
    ...Array.from({ length: prop.between }).map((_, index) => {
      const i = prop.now - prop.between + index;
      return i;
    }),
    prop.now,
    ...Array.from({ length: prop.between }).map((_, index) => {
      const i = prop.now + index + 1;
      return i;
    }),
  ];
  blockMiddle = blockMiddle.filter(i => {
    if (i <= blockLeft) {
      return false;
    }
    if (prop.max <= i) {
      return false;
    }
    return true;
  });
  const blockRight = prop.max;
  type A = { type: "back", key: string, link: number | null };
  type B = { type: "next", key: string, link: number | null };
  type C = { type: "sp", key: string, };
  type D = { type: "num", key: string, link: number | null, num: number }
  // 結合を作成
  const pageIdList: (A | B | C | D)[] = [];
  {
    // 左戻る矢印
    if (prop.now == MIN) {
      pageIdList.push({ type: "back", key: "back", link: null });
    } else {
      pageIdList.push({ type: "back", key: "back", link: prop.now - 1 });
    }
    // 最初のページ
    pageIdList.push({ type: "num", key: `p-${blockLeft}`, link: blockLeft, num: blockLeft });
    let lastPageId = blockLeft;
    // 左と中の間の…を入れるかどうか
    if (0 < blockMiddle.length && lastPageId + 1 != blockMiddle[0]) {
      pageIdList.push({ type: "sp", key: "sp-left" });
    }
    blockMiddle.forEach(m => {
      pageIdList.push({ type: "num", key: `p-${m}`, link: m, num: m });
      lastPageId = m;
    });
    if (0 < blockMiddle.length && lastPageId + 1 != blockRight) {
      // 最後のページ
      pageIdList.push({ type: "sp", key: "sp-right" });
    }
    if (lastPageId != blockRight) {
      pageIdList.push({ type: "num", key: `p-${blockRight}`, link: blockRight, num: blockRight });
      lastPageId = blockRight;
    }
    // 右矢印
    if (prop.now == prop.max) {
      pageIdList.push({ type: "next", key: "next", link: null });
    } else {
      pageIdList.push({ type: "next", key: "next", link: prop.now + 1 });
    }
    pageIdList.forEach(p => {
      if ("link" in p && p.link == prop.now) {
        p.link = null;
      }
    })
  }
  return pageIdList
}
