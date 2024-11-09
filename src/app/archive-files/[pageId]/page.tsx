import dateformat from "dateformat";
import { getAllPageCount, getAllVaNumber, getIaUrlCache, getTitle, getVaNumberList } from "../../../loadJson";
import "./style.css";

type PageType = {
  searchParams: Promise<Record<string, any>>,
  params: Promise<{
    pageId: string,
  }>
}
export default async function Page(context: PageType) {
  const pageId = getPageIdNumber((await context.params).pageId);
  const allVaList = await getAllVaNumber();
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
      {elementList}
    </div>
  );
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
    let x: string = dateformat(new Date(data.IASavedTimeMs), "yyyy/mm/dd HH:MM:ss");;
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
