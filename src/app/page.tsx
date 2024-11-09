import Link2 from "./_components/link2";

export default async function Home() {
  return (
    <div className="container mx-auto font-mono">
      <h1><Link2 href="/all-page/">全サイト一覧はこちら</Link2></h1>
      <p>約6000サイトを確認しています。PC推奨</p>
      <h1>このサイトについて</h1>
      <p>2024/12/20に閉鎖される、1990年代からVectorが提供していたホームページサービス hp.vector のアーカイブへのリンク集です。このサイトに対象サイトのファイルは含まれていません。</p>
      <p>source: <a href="https://www.itmedia.co.jp/news/articles/2407/18/news117.html">itmedia</a> , <a href="https://internet.watch.impress.co.jp/docs/yajiuma/1609184.html">internet watch</a></p>
      <h1>データのスクレイピング元</h1>
      <ul>
        <li>
          <h2>vector公式の個人HP一覧ページ</h2>
          <p>http://www.vector.co.jp/vpack/author/listpage.html に存在したホームページの一覧URL。2024年時点では存在しないが、2016年頃までは存在していた。</p>
          <p>vector公式の一覧ページなので充分に信用できると思われる。</p>
        </li>
        <li>
          <h2>InternetArchiveからDLしたURLリスト</h2>
          <p>InternetArchiveから<code>hp.vector.co.jp/authors</code>の部分一致でアーカイブされているURL一覧を取得して、サイトの一覧を作成した</p>
          <p><code>curl "https://web.archive.org/cdx/search/cdx?url=http://hp.vector.co.jp/authors/&matchType=domain&output=json&filter=statuscode:200&collapse=urlkey" -o ".saved/hp.vector.json"</code> のコマンドから作成</p>
        </li>
        <li>
          <h2>個人HPを連番でアクセス</h2>
          <p><code>https://hp.vector.co.jp/authors/VA000000/</code> のURLの番号部分を充分に間隔を開けて連番でアクセスした。</p>
          <p>原理的には全てのサイトを補足出来るはずだが、連番部分が yohko などのアルファベットになっているHPが存在している可能性がある。実際、上記のvector公式の一覧ページに存在していた。どの様なユーザーがこのアドレスを取得出来たのかは不明</p>
        </li>
        <li>
          <h2>vector本家側のプロフィールページを連番でアクセス</h2>
          <p><code>https://www.vector.co.jp/vpack/browse/person/an000000.html</code> のURLの番号部分を充分に間隔を開けて連番でアクセスし、htmlから個人HPサイトのリンクを抽出。この個人HPへのリンクが強制的に表示されるものなのか否かは知らない。</p>
          <p>こちらのvector本家側は全て連番であると思われる。この項目に限らないが、退会したユーザーの情報がどうなるのかは確認していない。</p>
        </li>
      </ul>
      <p>これらを使いHPスペースのURLの一覧を作成した。</p>
      <h1>連番ではないアドレス</h1>
      <p>通常のvectorの個人HPスペースは <code>https://hp.vector.co.jp/authors/VA000000/</code> の形式で数字部分で区別されているが、数字部分が恐らく任意のアルファベットになっているケースが存在している</p>
      <ul>
        <li>
          <a href="https://hp.vector.co.jp/authors/yohko/">https://hp.vector.co.jp/authors/yohko/</a>
          <p><a href="https://hp.vector.co.jp/authors/VA010117/">/VA010117/</a> と同じ。</p>
        </li>
        <li>
          <a href="https://hp.vector.co.jp/authors/tfuruka1/">https://hp.vector.co.jp/authors/tfuruka1/</a>
          <p><a href="https://hp.vector.co.jp/authors/VA001687/">/VA001687/</a> と同じ。</p>
        </li>
        <li>
          <a href="https://hp.vector.co.jp/authors/shurei/">https://hp.vector.co.jp/authors/shurei/</a>
          <p><a href="https://hp.vector.co.jp/authors/VA004149/">/VA004149/</a> と同じ。</p>
        </li>
        <li>
          <a href="https://hp.vector.co.jp/authors/sengoku/">https://hp.vector.co.jp/authors/sengoku/</a>
          <p>詳細不明。<a href="https://web.archive.org/web/20041101000000*/http://hp.vector.co.jp/authors/sengoku/">InternetArchiveに保存はされている</a> が、全て中身は無い。</p>
        </li>
      </ul>
      <p>上記の通り、詳細不明の1件を除くと全て通常のVA～形式のURLが存在しているので、ページ一覧ではこれらは無視するとする。</p>
    </div>
  );
}
