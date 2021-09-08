// 地図オブジェクトの初期設定
let map = {};

// ページ読み込み完了後地図の初期化と表示
window.addEventListener('load', () => {
  const center = new navitime.geo.LatLng('35.667395', '139.714896');
  map = new navitime.geo.Map("map",center, 10);
});

// 変数を設定
const baseUrl = 'https://api-service.instruction.cld.dev.navitime.co.jp/beginner/v1';
const $spotContainer = $('.spot-container');
const $searchWord = $('#search-word');
const $searchButton = $('#spot-search-button');
//const ROUTE_SHAPE_URL = 'https://api-service.instruction.cld.dev.navitime.co.jp/beginner/v1/shape_transit?start=35.658584,139.745457&goal=35.667395,139.714896&start_time=2020-09-04T09:00:00&options=transport_shape';
const spot = []; 
const coord = [];

// APIリクエスト成功時に実行される関数
function successHandler(response) {
    // Responseオブジェクトからデータ（この場合、JSON）を取得
    console.log(response);
    const json = response.data;

    // 最初から指定した個数分(seachNumber)のデータを取得
    const searchNumber = 10;
    for(let i=0; i<searchNumber; i++) {
      spot.push(json.items[i]);
      coord.push(spot[i].coord);
      // imgURL.push(spot[i].details.images.path);

      $spotContainer
        .append(`<img src=${spot[i].details[0].images[0].path} alt="None" width="250" height="150" border="0">`)
        .append(`<p id="spot${[i]}" class="spot">${spot[i].name}</p>`)
        .append(`<p id="address${[i]}" class="address">${spot[i].address_name}</p>`)
        .append(`<button id="route-search-button${[i]}" class="route-search-button">ここからNAVITIMEへ</button`)

      //地図上の各スポット情報に対してPINアイコンを付与
      const position = new navitime.geo.LatLng(coord[i].lat,coord[i].lon);
      const pin = new navitime.geo.overlay.Pin({
          map: map,             // 描画対象の地図オブジェクト
          icon: "assets/img/a-2.png",      // 表示したい画像
          position: position,      // 表示する地点
          draggable: false       // ドラッグ可能にするか(デフォルトはfalse)
      });

      //スポット名をクリックしたときのイベントを追加
      const spotName = document.getElementById(`spot${[i]}`);

      spotName.addEventListener('click', () => {
        const contents = [spot[i].name, spot[i].address_name,` Tel : ${spot[i].phone}`]   //TODO contentの見た目を改善
        const infoWindow = new navitime.geo.overlay.InfoWindow({
          map: map,             // 描画対象の地図オブジェクト
          position: position,      // 吹き出しを表示する座標
          content: contents //spot[i].name,   吹き出しの表示内容
        });

        //地図の中心をクリックした場所に移動
        const center = new navitime.geo.LatLng(coord[i].lat, coord[i].lon);
        map = new navitime.geo.Map("map",center, 10);
      });

      //root-search-bottonをクリックしたときのハンドラー
      const research = document.getElementById(`route-search-button${[i]}`);
      research.addEventListener('click', () => {
        //TODO URLをパーツ化する
        axios.get(`https://api-service.instruction.cld.dev.navitime.co.jp/beginner/v1/shape_transit?start=${coord[i].lat},${coord[i].lon}&goal=35.667395,139.714896&start_time=2020-09-04T09:00:00&options=transport_shape`)
          //AP Iリクエスト成功時に実行される
          .then(routeShapeSuccessHandler)
          //.then(routeInfoSuccessHandler)
          // APIリクエスト失敗時に実行される
          .catch(function (error) {
            console.log('status code', error.status);
          });
      });

      /*経路情報
      function routeInfoSuccessHandler(response) {
          console.log(response);
      }
      */

      //ナビタイムへのルートを描画する関数
      function routeShapeSuccessHandler(response) {
        // TODO すでにあるルート描画をリセットする
        // console.log(response);
        // GeoJSON形式のオブジェクトをデータから取得
        const geojson = response.data;
        const options = {
            map: map,
            unit: 'degree',
            allRoute: true,
            arrow: true,
            originalColor: true
        };

        // ルート線オブジェクトを生成
        map.renderer = new navitime.geo.route.Renderer(geojson, options);
        map.renderer.draw(); // ルートを地図上に描画する
      }

    }
}

// 検索
$searchButton.on('click', function () {
    const word = $searchWord.val();
    $spotContainer.empty();
    $searchWord.val('');

    axios.get(`${baseUrl}/spot?word=${word}&options=detail`)
        //AP Iリクエスト成功時に実行される
        .then(successHandler)
        // APIリクエスト失敗時に実行される
        .catch(function (error) {
            console.log(response)
            console.log(error);
    });
});

