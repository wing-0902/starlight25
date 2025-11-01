<script lang="js">
  import { ref, onValue, set, runTransaction } from "firebase/database";
  import { database } from "../../../firebase/client";

  let slots = {};

  // DBから時間枠を購読
  const slotsRef = ref(database, "reservations");
  onValue(slotsRef, (snapshot) => {
    slots = snapshot.val() || {};
  });

  let newTime = "08:00";

  let now = '';
  let hours = '';
  let minutes = '';
  let seconds = '';
  let currentTimeOnHhMm = '';
  let currentTimeOnHhMmSs = '';

  function padZero(num) {
    return String(num).padStart(2, "0");
  }

  function displayCurrentTime() {
    now = new Date();
    hours = padZero(now.getHours());
    minutes = padZero(now.getMinutes());
    seconds = padZero(now.getSeconds());

    currentTimeOnHhMm = `${hours}:${minutes}`;
    currentTimeOnHhMmSs = `${hours}:${minutes}:${seconds}`;
  }

  setInterval(displayCurrentTime, 1000);

  function addSlot() {
    if (!newTime) return;
    const slotRef = ref(database, `reservations/${newTime}`);
    set(slotRef, { count: 0 });
    newTime = '08:00';
  }

  function deleteSlot(time) {
    const continueChoice = confirm(`${time}の枠を削除しますか？`)
    if (continueChoice) {
      const slotRef = ref(database, `reservations/${time}`);
      set(slotRef, null);
    }
  }

  function updateCount(time, delta) {
    const countRef = ref(database, `reservations/${time}/count`);
    runTransaction(countRef, (current) => {
      return Math.max(0, (current || 0) + delta); // マイナス防止
    });
  }

  // HH:MM を数値（分単位）に変換
  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  // 「今の時間以降」「人数3以下」で最も早い時間を返す
  function nextAvailableSlot(threshold = 10) {
    const now = toMinutes(currentTimeOnHhMm);

    const candidates = Object.entries(slots)
      .filter(([time, data]) => {
        return (
          toMinutes(time) >= now && (data.count ?? 0) <= threshold
        );
      })
      .map(([time]) => time)
      .sort((a, b) => toMinutes(a) - toMinutes(b));

    return candidates[0] || null; // なければ null
  }
</script>

<div>
  <h4>空き枠のある時間帯</h4>
  <p>現在の時間：{currentTimeOnHhMmSs}</p>
  <p>次の空き時間：{nextAvailableSlot(10) ?? "該当なし"}</p>
  <h4>予約数一覧</h4>
  <table>
    <thead>
      <tr>
        <th>時間</th>
        <th colspan="3">予約数</th>
        <th>混雑状況</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.keys(slots).sort() as time}
        <tr>
          <td>{time}</td>
          <td>
            <button on:click={() => updateCount(time, -1)}>ー</button>
          </td>
          <td>{slots[time]?.count ?? 0}</td>
          <td>
            <button on:click={() => updateCount(time, +1)}>＋</button>
          </td>
          <td>
            {#if (slots[time]?.count >= 13)}
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="red"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            {:else if (slots[time]?.count >= 9)}
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="yellow"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="skyblue"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
            {/if}
          </td>
          <td>
            <button on:click={() => deleteSlot(time)}>削除</button>
          </td>
        </tr>
      {/each}
      <tr>
        <td colspan="5">
          <input
            type=time
            class='timeInput'
            step="300"
            bind:value={newTime}
          />
        </td>
        <td>
          <button on:click={addSlot}>追加</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<style lang="scss">
  .timeInput {
    font-size: 16px;
    font-family: ZenMaru;
  }
  button {
    font-size: 15px;
    font-family: ZenMaru;
  }
</style>