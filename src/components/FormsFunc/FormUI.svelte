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

  onMount(() => {
    if ((sessionStorage.getItem('form_status') ?? '') !== '') {
      sessionStorage.clear();
    }

    comment = sessionStorage.getItem('comment_form') ?? '';
    rate = Number(sessionStorage.getItem('rate_form')) || 0;
    length = sessionStorage.getItem('length_form') ?? '';
    
    // JSON.parseのエラー防止（空文字列やnullの場合を考慮）
    const storedRead = sessionStorage.getItem('alreadyRead_form');
    alreadyRead = storedRead ? JSON.parse(storedRead) : [];

    // 3. 復元が終わってから保存を許可する
    setTimeout(() => {
      hydrated = true;
    }, 100);
  });

  $: if (hydrated) {
    sessionStorage.setItem('comment_form', comment || '');
    sessionStorage.setItem('rate_form', (rate || 0).toString());
    sessionStorage.setItem('length_form', length || '');
    sessionStorage.setItem('alreadyRead_form', JSON.stringify(alreadyRead));
  }

  export let aboutThis: string;
 
  if (aboutThis === 'book') {
    about = '部誌';
    other = 'プラネタリウム';
    説明文 = '天文部の部誌「The Scientific Seiko」';
  } else if (aboutThis === 'planetarium') {
    about = 'プラネタリウム';
    other = '部誌';
    説明文 = '天文部のプラネタリウム';
  }

  async function handleSubmit(event: Event) {
    event?.preventDefault();

    // フォームの要素を取得し、FormDataオブジェクトを生成
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    let hasError = false;

    const aboutValue = aboutThis;

    if (!aboutValue) {
      alert('アンケートの種類が指定されていません。');
      hasError = true;
    }

    // rate (1~5の評価)
    const rateValue = formData.get('rate');
    if (!rateValue || parseInt(rateValue as string, 10) < 1 || parseInt(rateValue as string, 10) > 5) {
      alert('評価は必須項目です。1から5の星を選択してください。');
      hasError = true;
    }

    // aboutThisが 'book' の場合のチェックボックス
    if (aboutThis === 'book') {
      const alreadyReadCheckboxes = formData.getAll('alreadyRead');
      if (alreadyReadCheckboxes.length === 0) {
        alert('お読みになった部誌を一つ以上選択してください。');
        hasError = true;
      }
    }

    // aboutThisが 'planetarium' の場合のセレクトボックス
    if (aboutThis === 'planetarium') {
      const lengthValue = formData.get('length');
      if (!lengthValue || lengthValue === '') {
        alert('プラネタリウムの時間は必須項目です。選択してください。');
        hasError = true;
      }
    }

    // エラーがあれば送信を中止
    if (hasError) {
      return;
    }
    // aboutの値をFormDataに追加 (サーバー側で必要)
    formData.append('about', aboutThis);

    try {
      // fetch APIを使ってサーバーにPOSTリクエストを送信
      const response = await fetch('/api/form', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        hydrated = false;
        const currentStatus = `${aboutThis}_sending`
        sessionStorage.setItem('form_status', currentStatus);
        window.location.href='/form/thanks/';
      } else {
        alert(`送信失敗: ${result.error}`);
      }
    } catch (e) {
      alert('通信エラーが発生しました。');
      console.error('Error:', e);
    }
  }
</script>

<div>
  <p class='linkToOther'>
    {other}のアンケートは
    {#if (about === '部誌')}
      <a href='/form/planetarium/'>こちら</a>
    {:else if (about === 'プラネタリウム')}
      <a href='/form/'>こちら</a>
    {:else}
      <a href='/error/'>エラー</a>
    {/if}
  </p>
  <h2>{about}についてのアンケート</h2>
  <p>{説明文}について，ご意見をお聞かせください．</p>
  <p>「<RequiredMark />」がついている項目は回答必須，その他の項目は任意です．</p>

  <form on:submit={handleSubmit}>
    <fieldset>
      <legend>{about}について</legend>
      {#if (aboutThis === 'book')}
        <p><RequiredMark />以下の中から，お読みになった，または現在お読みになっている部誌を全て選んでください．</p>
        <input type="checkbox" id="ver1" name="alreadyRead" value="本篇・上巻" bind:group={alreadyRead}>
        <label for="ver1">本篇・上巻</label><br>
        <input type="checkbox" id="ver2" name="alreadyRead" value="本編・下巻" bind:group={alreadyRead}>
        <label for="ver2">本篇・下巻</label><br>
        <input type="checkbox" id="ver3" name="alreadyRead" value="活動報告" bind:group={alreadyRead}>
        <label for="ver3">活動報告</label><br><br>
      {:else if (aboutThis === 'planetarium')}
        <label for='length'><RequiredMark />プラネタリウムの時間（約10分）はいかがでしたか？</label><br>
        <select id='name' bind:value={length} name='length'>
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
        <input bind:group={rate} type='radio' name='rate' value={1} />
        <Star currentRate={rate} rateStar={1} />
      </label>
      <label>
        <input bind:group={rate} type='radio' name='rate' value={2} />
        <Star currentRate={rate} rateStar={2} />
      </label>
      <label>
        <input bind:group={rate} type='radio' name='rate' value={3} />
        <Star currentRate={rate} rateStar={3} />
      </label>
      <label>
        <input bind:group={rate} type='radio' name='rate' value={4} />
        <Star currentRate={rate} rateStar={4} />
      </label>
      <label>
        <input bind:group={rate} type='radio' name='rate' value={5} />
        <Star currentRate={rate} rateStar={5} />
      </label>
    </fieldset>
    <fieldset>
      <legend>コメント</legend>
      <label for='comment'>ご意見・コメントなどをお書きください．</label><br>
      <textarea placeholder='ここにコメントを入力' id='comment' name='comment' bind:value={comment}></textarea>
    </fieldset>
    <Turnstile siteKey='0x4AAAAAABycHtFvIrRAAG4r'/>
    <div class='submitButtonBoxForLayout'>
      <button class='submitButton' type='submit'>
        送信
      </button>
    </div>
  </form>
  <p>管理ページは<a href='/admin'>こちら</a></p>
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
