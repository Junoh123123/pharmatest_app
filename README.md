# 薬学部試験対策クイズアプリ

## 概要

薬学部の試験で出題される各科目の**穴埋め（虫食い）問題**を効率的に学習できるインタラクティブな Web アプリケーションである。科目・章ごとに整理された問題を一問一答形式で練習し、**即時フィードバック**を受けられる。

## 要件定義

### 機能要件

1. **問題カテゴリ管理**

   * 科目・章ごとの問題セット。
   * 収録例：
     * 微生物学（7 章）
     * 分析化学（8 章）
   * 新しい科目は `content` ディレクトリにファイルを追加するだけで拡張可能。

2. **学習フロー**

   * 科目選択ホーム画面 → カテゴリ選択画面 → 問題表示（虫食い部分がテキストボックス） → 回答送信・即時判定 → 正解表示とフィードバック → 次の問題へ遷移 → 完了時に結果表示。

3. **問題機能**

   * 複数の虫食い箇所に対応。
   * 大文字小文字・空白に寛容な採点。
   * **部分点**（複数解答時）。
   * 学名・和名など**複数正解パターン**に対応。

### 非機能要件

1. **UI/UX 設計**

   * ミニマルで洗練されたデザイン。
   * 画面中央に大きく問題を配置。
   * レスポンシブ対応。
2. **パフォーマンス**

   * 静的サイト生成（SSG）を活用。
   * クライアントサイドで高速に問題遷移。

## 技術スタック

* **フレームワーク**: Next.js（App Router）
* **UI ライブラリ**: React
* **言語**: TypeScript
* **スタイリング**: Tailwind CSS
* **デプロイ**: Vercel / Heroku など

## プロジェクト構造

各科目の問題（`*.md`）と設定（`*.config.ts`）は **`content` ディレクトリで一元管理**する。

```text
examapp-main/
├─ content/                        # 問題データと設定
│  ├─ index.ts                     # すべての科目設定を集約
│  ├─ microbiology.config.ts       # 微生物学の設定
│  ├─ microbiology.md              # 微生物学の問題と解答
│  ├─ analytical-chemistry.config.ts  # 分析化学の設定
│  └─ analytical-chemistry.md      # 分析化学の問題と解答
│
├─ app/                            # Next.js App Router
│  ├─ page.tsx                     # ホーム（科目選択）
│  ├─ [subject]/
│  │  └─ page.tsx                  # 科目ページ
│  └─ [subject]/[category]/
│     └─ page.tsx                  # 問題演習ページ
│
├─ components/                     # React コンポーネント
│  ├─ QuestionCard.tsx
│  ├─ ResultDisplay.tsx
│  └─ ...
│
├─ lib/                            # アプリケーションロジック
│  ├─ examData.ts                  # Markdown パーサ
│  ├─ examLoader.ts                # データ読み込み
│  └─ scoring.ts                   # 採点ロジック
│
└─ types/                          # TypeScript 型定義
   └─ exam.ts
```

## データ設計

主なデータ構造（`types/exam.ts`）

```ts
export interface Subject {
  id: string;
  name: string;
  description: string;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  questions: Question[];
}

export interface Question {
  id: string;
  category: string;
  text: string; // 本文中の虫食い箇所は {{blank:id}} のように埋め込み
  blanks: Array<{
    id: string;
    answer: string; // "正解1|正解2" のように複数パターンを | 区切りで表現
    position: number; // テキスト内の位置（並び順管理）
  }>;
}
```

### 追加科目の作り方

1. `content/<new-subject>.md` を作成（問題本文と解答を記述）。
2. `content/<new-subject>.config.ts` を作成（科目メタデータを記述）。
3. `content/index.ts` に新科目を登録。

#### 設定ファイルの例（`content/microbiology.config.ts`）

```ts
import { Subject } from "@/types/exam";

export const microbiology: Subject = {
  id: "microbiology",
  name: "微生物学",
  description: "細菌・ウイルス・真菌・寄生虫などの基礎と応用。",
  categories: [
    {
      id: "ch1",
      name: "第1章 基礎",
      description: "基本事項",
      questionCount: 10,
      questions: [], // 実体は Markdown から読み込み
    },
    // ...
  ],
};
```

#### Markdown 問題ファイルの例（`content/microbiology.md`）

> 複数の空所を `{{blank:1}}` のように記述し、解答側で `id=1` に対応させる。

```md
# 第1章 基礎

## Q1
リケッチアは **{{blank:1}}** 寄生性の細菌であり、ヒトへの感染は **{{blank:2}}** を介する。

### ANSWERS
1: 偏性細胞内 | 真正細胞内
2: 節足動物 | ダニ | シラミ
```

> 実装側では `ANSWER` セクションをパースし、`|` 区切りで複数正解を許容する。

## 開発フェーズ

> このセクションはプロジェクト初期計画を示す。現状と異なる場合がある。

* **Phase 1: 基盤構築**

  * [x] データパーサ実装
  * [x] 基本コンポーネント作成
  * [x] ルーティング設定
* **Phase 2: 機能実装**

  * [x] 問題表示・回答機能
  * [x] 採点ロジック
  * [x] 進捗（プログレス）管理
* **Phase 3: UI/UX 改善**

  * [x] デザイン適用
  * [x] アニメーション・トランジション
  * [x] レスポンシブ対応
* **Phase 4: 最適化 & 拡張**

  * [ ] パフォーマンス調整
  * [ ] アクセシビリティ対応
  * [x] データ構造のリファクタリング（科目追加を容易に）

## 使用方法

### 依存パッケージのインストール

```bash
npm install
```

### 開発サーバの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## クレジット（Credits）

このアプリケーションの元となるアイデアとコードは **@hibiki1213** によって作成された。

* Original Repository: [https://github.com/hibiki1213/examapp](https://github.com/hibiki1213/examapp)

## ライセンス

[MIT License](LICENSE)
