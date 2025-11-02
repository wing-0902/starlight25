<script lang="js">
  import { ref, onValue } from "firebase/database";
  import { database } from "../firebase/client";

  let slots = {};

  let now = new Date();
  let hours = '';
  let minutes = '';
  let seconds = '';
  let currentTimeOnHhMm = '';
  let currentTimeOnHhMmSs = '';

  const slotsRef = ref(database, "reservations");
  
  onValue(slotsRef, (snapshot) => {
    slots = snapshot.val() || {}; 
  });

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

  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  let nextSlotTime;

  $: {
    const threshold = 12;
    const nowInMinutes = toMinutes(currentTimeOnHhMm);

    const candidates = Object.entries(slots)
      .filter(([time, data]) => {
        return (
          toMinutes(time) >= (nowInMinutes + 2) && (data.count ?? 0) <= threshold
        );
      })
      .map(([time]) => time)
      .sort((a, b) => toMinutes(a) - toMinutes(b));

    nextSlotTime = candidates[0] || null;
  }
</script>


<div class='root'>
  <p>
    <span class='プラネタ'>プラネタリウム</span>
    次の時間枠は<br/>
    <span class='時間'>{nextSlotTime ?? "空き枠なし"}</span>
  </p>
</div>

<style lang="scss">
  .root {
    z-index: 1000;
    p {
      font-family: ZenMaru;
      margin: 0;
      line-height: 110px;
      text-align: right;
      font-size: 60px;
      font-weight: bold;
      text-shadow: 1px 1px 5px black;
      .プラネタ {
        font-size: 50px;
      }
      .時間 {
        color: rgb(255, 230, 0);
        font-size: 160px;
      }
    }
  }
</style>