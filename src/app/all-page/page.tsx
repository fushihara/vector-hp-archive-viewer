import { getAllVaAndTitle } from "../../loadJson";
import { SITE_PER_PAGE } from "../../ppv";
import { Metadata } from "next";
import Link2 from "../_components/link2";

export default async function Page() {
  const obj2 = await getAllVaAndTitle()
  return (
    <div className="container mx-auto font-mono">
      <IASavedUrlTable datas={obj2}></IASavedUrlTable>
    </div>
  );
}
export const metadata: Metadata = {
  title: "Vectorアーカイブ 全サイト一覧",
};

type IASavedUrlTableProp = {
  datas: {
    vaNumber: number,
    lastTitle: string | null,
  }[],
};
function IASavedUrlTable(prop: IASavedUrlTableProp) {
  const trElementList: JSX.Element[] = [];
  const numFormat = new Intl.NumberFormat('en-US');
  if (prop.datas.length == 0) {
    throw new Error();
  }
  prop.datas.forEach(data => {
    const indexRaw = prop.datas.indexOf(data);
    const indexStr = `${indexRaw + 1}/${prop.datas.length}`;
    const vaStr = String(data.vaNumber).padStart(6, "0");
    const originalUrl = `https://hp.vector.co.jp/authors/VA${vaStr}/`;
    const iaSearchResultUrl = `https://web.archive.org/web/*/${originalUrl}`;
    const vectorProfileUrl = `https://www.vector.co.jp/vpack/browse/person/an${vaStr}.html`;
    let titleElement = <span className="text-gray-400">タイトル不明</span>;
    if (data.lastTitle != null) {
      titleElement = <>{data.lastTitle}</>
    }
    const indexLink = <Link2 href={`/archive-files/page-${Math.floor(indexRaw / SITE_PER_PAGE) + 1}/#VA${vaStr}`}>{indexStr}</Link2>
    trElementList.push(
      <tr className="transition duration-300 ease-in-out hover:bg-gray-100" key={`${data.vaNumber}`}>
        <td className="border border-black px-1 py-0 text-right">{indexLink}</td>
        <td className="border border-black px-1 py-0 text-right">{data.vaNumber}</td>
        <td className="border border-black px-1 py-0 text-left">{titleElement}</td>
        <td className="border border-black px-1 py-0 text-left" title="オリジナルのURL"><a href={originalUrl}>{originalUrl}</a></td>
        <td className="border border-black px-1 py-0 text-left" title="vector本家の作者のプロフィールページ"><a href={vectorProfileUrl}>www.vector.co.jp</a></td>
        <td className="border border-black px-1 py-0 text-left"><a href={iaSearchResultUrl}>archive.org</a></td>
      </tr>
    );
  });
  return (<div className="p-2">
    一瞬でもなんらかのソースに引っかかったURLを全て記載しています。
    <table className="border-collapse bg-white text-sm font-light text-gray-900 ">
      <thead className="text-md sticky top-0 bg-gray-100 font-medium">
        <tr>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-right" title="全サイトの通し番号">No</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-right" title="URLの一部のVA～ の部分の数字">VA</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left">サイト名</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left">オリジナルURL</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left">作者ページ</th>
          <th scope="col" className="whitespace-nowrap border border-black px-1 text-left">IAのURL</th>
        </tr>
      </thead>
      <tbody>
        {trElementList}
      </tbody>
    </table>
  </div>
  );
}
