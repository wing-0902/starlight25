<script lang="js">
  import { ref, onValue } from "firebase/database";
  import { database } from "../firebase/client";

  // 変数宣言: Svelteのリアクティブな変数として扱われます
  let slots = {};

  let now = new Date(); // nowはsetIntervalでのみ更新
  let hours = '';
  let minutes = '';
  let seconds = '';
  let currentTimeOnHhMm = '';
  let currentTimeOnHhMmSs = '';

  // DBから時間枠を購読
  const slotsRef = ref(database, "reservations");
  
  // onValueコールバック内でslotsが更新されても、Svelteは自動的にDOMの更新をスケジュールしません。
  // しかし、以下の$: slotsが変更されたことをSvelteが検知し、
  // 依存する$: nextSlotTimeの再計算やテンプレートの更新を間接的に促します。
  onValue(slotsRef, (snapshot) => {
    // オブジェクト全体を再代入することで、Svelteに変更を伝えます
    slots = snapshot.val() || {}; 
  });

  function padZero(num) {
    return String(num).padStart(2, "0");
  }

  // currentTimeOnHhMm と currentTimeOnHhMmSs を更新し、テンプレートの再描画をトリガーします
  function displayCurrentTime() {
    now = new Date(); // 変数を再代入することでSvelteが変更を検知
    hours = padZero(now.getHours());
    minutes = padZero(now.getMinutes());
    seconds = padZero(now.getSeconds());

    // 派生した変数も再代入
    currentTimeOnHhMm = `${hours}:${minutes}`;
    currentTimeOnHhMmSs = `${hours}:${minutes}:${seconds}`;
  }

  setInterval(displayCurrentTime, 1000);

  // HH:MM を数値（分単位）に変換
  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  // --- リアクティブな宣言で nextAvailableSlot の結果を計算する ---
  let nextSlotTime;
  
  // slots または currentTimeOnHhMm が変更されるたびに、このブロックが実行され、
  // nextSlotTime が更新され、依存するDOMも更新されます。
  $: {
    const threshold = 12;
    const nowInMinutes = toMinutes(currentTimeOnHhMm);

    const candidates = Object.entries(slots)
      .filter(([time, data]) => {
        return (
          // toMinutes(time) >= nowInMinutes: 現在時刻以降
          toMinutes(time) >= (nowInMinutes + 2) && (data.count ?? 0) <= threshold // 予約数がしきい値以下
        );
      })
      .map(([time]) => time)
      .sort((a, b) => toMinutes(a) - toMinutes(b));

    nextSlotTime = candidates[0] || null; // リアクティブな変数に結果を代入
  }
</script>


<div class='root'>
  <p>
    次の時間枠は<br/>
    <span class='時間'>{nextSlotTime ?? "null"}</span>
  </p>
</div>

<style lang="scss">
  .root {
    z-index: 1000;
    p {
      font-family: ZenMaru;
      font-size: 60px;
      font-weight: bold;
      text-shadow: 1px 1px 5px black;
      .時間 {
        color: rgb(255, 230, 0);
        font-size: 160px;
      }
    }
  }
</style>