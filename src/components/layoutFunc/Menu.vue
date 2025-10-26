<script setup lang="ts">
  import { defineProps } from 'vue';

  interface Props {
    kinds: string[]
    vers: string[]
  };

  const props = defineProps<Props>();
</script>

<template>
  <div class='menuContainer'>
    <button
      :class="{ 'is-active': isOpen, 'is-down': isDown, 'is-45deg': is45deg }"
      @click="toggleMenu"
      aria-label="メニューを開閉"
    >
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
    <nav
      :class="{'is-open': isOpen}"
    >
      <ul>
        <li>
          <a href="/">ホーム・部誌一覧</a>
          <ul>
            <li v-for="kind in props.kinds" :key="kind">
              <a :href="`/book/${kind}/`" >{{ kind }}</a>
            </li>
            <br/>
            <li v-for="ver in props.vers" :key="ver">
              <a :href="`/book/${ver}/`">{{ ver }}</a>
            </li>
            <br/>
            <li><a href="/search/">検索</a></li>
          </ul>
        </li>
        <li>
          アンケート
          <ul>
            <li><a href='/form/'>部誌のアンケート</a></li>
            <li><a href='/form/planetarium/'>プラネタリウムのアンケート</a></li>
          </ul>
        </li>
        <li>
          <a href="/admin/">管理ページ</a>
        </li>
      </ul>
    </nav>
    <div v-if="isOpen" class="overlay" @click="toggleMenu"></div>
  </div>
</template>

<script lang="ts">
  export default {
    name: "HamburgerMenu",
    data() {
      return {
        isOpen: false,
        isDown: false,
        is45deg: false,
      };
    },
    methods: {
      toggleMenu() {
        if (!this.isOpen) {
          this.isOpen = true;
          this.isDown = true;
          setTimeout(() => {
            this.is45deg = true;
          }, 300);
        } else {
          this.isOpen = false;
          this.is45deg = false;
          setTimeout(() => {
            this.isDown = false;
          },300);
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .menuContainer {
    position: relative;
    z-index: 1000;

    // メニューのほう
    nav {
      position: fixed;
      z-index: 1000;
      top: 0;
      right: 0;
      height: 100dvh;
      width: 400px;
      max-width: 100vw;
      padding-top: 20px;
      transform: translateX(115%);
      transition: all 0.44s ease-in-out;
      background-color: transparent;
      opacity: 0;

      &.is-open {
        transform: translateX(0);
        opacity: 1;
        backdrop-filter: linear-gradient(to right, blur(1px), blur(10px));
        background-color: rgb(0, 36, 66);
        background: linear-gradient(to right, transparent,rgba(0,36,66,0.6),rgba(0,36,66,0.7),rgba(0,36,66,0.8),rgba(0,36,66,0.85),rgba(0,36,66,0.9),rgba(0,36,66,0.95), rgb(0,36,66));
      }
    }

    // ボタンのほう
    button {
      width: 30px;
      height: 30px;
      background: none;
      border: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      cursor: pointer;
      z-index: 1001;
      position: relative;

      .bar {
        display: block;
        width: 100%;
        height: 2px;
        border-radius: 1px;
        background-color: var(--foreground);
        transition: all 0.4s ease;
      }
      &.is-active {
        .bar {
          &:nth-child(2) {
            background-color: transparent;
          }
        }
      }
      &.is-down {
        .bar {
          --goDown: 10px;
          --goUp: -10px;
          &:nth-child(1) {
            transform: translateY(var(--goDown));
          }
          &:nth-child(3) {
            transform: translateY(var(--goUp));
          }
        }
      }
      &.is-45deg {
        .bar {
          &:nth-child(1) {
            transform: translateY(var(--goDown)) rotate(45deg);
          }
          &:nth-child(3) {
            transform: translateY(var(--goUp)) rotate(-45deg);
          }
        }
      }
    }

    .overlay {
      position: fixed;
      z-index: 900;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100dvh;
      transition: all 0.44s ease;
    }
  }
</style>