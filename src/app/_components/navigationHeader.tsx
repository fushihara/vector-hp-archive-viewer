import Link2 from "./link2";

export function NavigationHeader() {
  return (
    <nav className="container flex flex-wrap items-center justify-between mx-auto p-4">
      <Link2
        href={"/"}
        className="flex items-center space-x-3 rtl:space-x-reverse" title="トップページへ">
        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">vector個人HPスペース アーカイブ</span>
      </Link2>
      <div className="hidden w-full md:block md:w-auto" id="navbar-default">
        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
          <li>
            <Link2 href={"/all-page/"}>全サイト一覧</Link2>
          </li>
        </ul>
      </div>
    </nav>
  );
}