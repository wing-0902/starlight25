<script lang="ts">
  import RequiredMark from './RequiredMark.svelte';
  import Star from './Star.svelte';
  import { Turnstile } from 'svelte-turnstile';
  import { onMount } from 'svelte';

  let about: string = '';
  let 説明文: string = '';
  let other: string = '';

  // フォーム内で扱う変数
  let comment: string;
  let rate: number;
  let length: string;
  let alreadyRead: string[] = [];
  
  // 同期
  let hydrated = false;

  let aboutThis: string = '';

  onMount(() => {
    if ((sessionStorage.getItem('form_status') ?? '') === 'book_sending') {
      aboutThis = 'book';
    } else if ((sessionStorage.getItem('form_status') ?? '') === 'planetarium_sending') {
      aboutThis = 'planetarium';
    } else {
      sessionStorage.removeItem('form_status');
      window.location.href='/form/';
    }

    comment = sessionStorage.getItem('comment_form') ?? '';
    rate = Number(sessionStorage.getItem('rate_form'));
    length = sessionStorage.getItem('length_form') ?? '';
    alreadyRead = JSON.parse(sessionStorage.getItem('alreadyRead_form') ?? '');

    sessionStorage.clear();
    hydrated = true;
  })

  $: if (hydrated) {
    sessionStorage.setItem('comment_form', comment);
    sessionStorage.setItem('rate_form', rate.toString());
    sessionStorage.setItem('length_form', length);
    sessionStorage.setItem('alreadyRead_form', JSON.stringify(alreadyRead));
  }

  if (aboutThis === 'book') {
    about = '部誌';
    other = 'プラネタリウム';
    説明文 = '天文部の部誌「The Scientific Seiko」';
  } else if (aboutThis === 'planetarium') {
    about = 'プラネタリウム';
    other = '部誌';
    説明文 = '天文部のプラネタリウム';
  }
</script>

<div>
  <h2>アンケートにご協力いただき，ありがとうございました</h2>
  <p>以下の内容で承っております．ご確認ください．</p>

  <div class='form'>
    <fieldset>
      <legend>{about}について</legend>
      {#if (aboutThis === 'book')}
        <p><RequiredMark />以下の中から，お読みになった，または現在お読みになっている部誌を全て選んでください．</p>
        <input disabled type="checkbox" id="ver1" name="alreadyRead" value="本篇・上巻" bind:group={alreadyRead}>
        <label for="ver1">本篇・上巻</label><br>
        <input disabled type="checkbox" id="ver2" name="alreadyRead" value="本編・下巻" bind:group={alreadyRead}>
        <label for="ver2">本篇・下巻</label><br>
        <input disabled type="checkbox" id="ver3" name="alreadyRead" value="活動報告" bind:group={alreadyRead}>
        <label for="ver3">活動報告</label><br><br>
      {:else if (aboutThis === 'planetarium')}
        <label for='length'><RequiredMark />プラネタリウムの時間（約10分）はいかがでしたか？</label><br>
        <select style="pointer-events: none; touch-action: none;" tabindex="-1" id='name' value={length} name='length'>
          <option value=''>選択してください</option>
          <option value='too-short'>短すぎる</option>
          <option value='short'>少し短い</option>
          <option value='good'>ちょうど良い</option>
          <option value='long'>少し長い</option>
          <option value='too-long'>長すぎる</option>
        </select>
      {:else}
        <a href='/error'>エラー</a>
      {/if}
      <p><RequiredMark />{about}の内容はいかがでしたか？</p>
      <label>
        <input readonly type='radio' name='rate' value={1} />
        <Star currentRate={rate} rateStar={1} />
      </label>
      <label>
        <input readonly type='radio' name='rate' value={2} />
        <Star currentRate={rate} rateStar={2} />
      </label>
      <label>
        <input readonly type='radio' name='rate' value={3} />
        <Star currentRate={rate} rateStar={3} />
      </label>
      <label>
        <input readonly type='radio' name='rate' value={4} />
        <Star currentRate={rate} rateStar={4} />
      </label>
      <label>
        <input readonly type='radio' name='rate' value={5} />
        <Star currentRate={rate} rateStar={5} />
      </label>
    </fieldset>
    <fieldset>
      <legend>コメント</legend>
      <label for='comment'>ご意見・コメントなどをお書きください．</label><br>
      <textarea readonly placeholder='ここにコメントを入力' id='comment' name='comment' value={comment}></textarea>
    </fieldset>
  </div>
</div>

<style lang='scss'>
  input {
    margin-bottom: 1em;
  }

  input, textarea {
    background: transparent;
    color: var(--foreground);
    border-radius: 13px;
    border: 1px solid var(--foreground);
    resize: none;
  }

  .text, .emailarea {
    width: 100%;
    box-sizing: border-box;
    max-width: 340px;
    height: 3em;
    font-size: 1em;
  }

  .emailarea {
    font-family: FiraCode;
  }

  .text, textarea {
    font-size: 1em;
    font-family: ZenMaru;
  }
  
  fieldset {
    padding: 4px 11px;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    height: 7em;
  }

  input[type="radio"] {
    display: none;
  }

  legend {
    font-family: Sawarabi;
  }

  .submitButton {
    font-family: ZenMaru;
    text-align: center;
    
    width: 77px;
    font-size: 0.88em;
  }

  .submitButtonBoxForLayout {
    width: 100%;
    display: flex;
    
    align-items: center;

  }
</style>