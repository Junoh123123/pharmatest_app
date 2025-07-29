# 薬学部試験対策クイズアプリ

## 概要

薬学部の試験で出題される各科目の**穴埋め（虫食い）問題**と**OX問題**を効率的に学習できるインタラクティブな Web アプリケーションである。科目・章ごとに整理された問題を一問一答形式で練習し、**即時フィードバック**を受けられる。

## 要件定義

### 機能要件

1. **問題カテゴリ管理**

   * 科目・章ごとの問題セット。
   * 収録例：
     * 微生物学（11 章）
     * 分析化学（8 章）
     * 生命倫理（1 章）- OX問題対応
   * 新しい科目は `content` ディレクトリにファイルを追加するだけで拡張可能。

2. **学習フロー**

   * 科目選択ホーム画面 → カテゴリ選択画面 → 問題表示（虫食い部分がテキストボックス / OX選択ボタン） → 回答送信・即時判定 → 正解表示とフィードバック → 次の問題へ遷移 → 完了時に結果表示。

3. **問題機能**

   * **穴埋め問題**: 複数の虫食い箇所に対応。
   * **OX問題**: ○×選択式の問題に対応。
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

* **フレームワーク**: Next.js 15.4.4（App Router）
* **UI ライブラリ**: React 19
* **言語**: TypeScript
* **スタイリング**: Tailwind CSS
* **デプロイ**: Heroku
* **問題タイプ**: 穴埋め問題、OX問題対応
* **レスポンシブ**: モバイル・タブレット・デスクトップ対応

## プロジェクト構造

各科目の問題（`*.md`）と設定（`*.config.ts`）は **`content` ディレクトリで一元管理**する。

```text
examapp-main/
├─ content/                        # 問題データと設定
│  ├─ index.ts                     # すべての科目設定を集約
│  ├─ microbiology.config.ts       # 微生物学の設定
│  ├─ microbiology.md              # 微生物学の問題と解答
│  ├─ analytical-chemistry.config.ts  # 分析化学の設定
│  ├─ analytical-chemistry.md      # 分析化学の問題と解答
│  ├─ bioethics.config.ts          # 生命倫理の設定
│  └─ bioethics.md                 # 生命倫理の問題と解答（OX問題）
│
├─ app/                            # Next.js App Router
│  ├─ page.tsx                     # ホーム（科目選択）
│  ├─ [subject]/
│  │  └─ page.tsx                  # 科目ページ
│  ├─ [subject]/[category]/
│  │  └─ page.tsx                  # 問題演習ページ
│  └─ api/
│     └─ categories/[id]/
│        └─ route.ts               # カテゴリデータAPI
│
├─ components/                     # React コンポーネント
│  ├─ CategoryCard.tsx
│  ├─ FinalResults.tsx
│  ├─ QuestionCard.tsx             # 穴埋め・OX問題対応
│  └─ ResultDisplay.tsx
│
├─ lib/                            # アプリケーションロジック
│  ├─ examData.ts                  # Markdown パーサ（穴埋め・OX対応）
│  ├─ examLoader.ts                # データ読み込み
│  └─ scoring.ts                   # 採点ロジック
│
└─ types/                          # TypeScript 型定義
   └─ exam.ts
```

## データ設計

主なデータ構造（`types/exam.ts`）

```ts
// 問題の基本型
interface QuestionBase {
  id: string;
  category: string;
  text: string; 
}

// 穴埋め問題
export interface FillInTheBlankQuestion extends QuestionBase {
  type: 'fill-in-the-blank';
  blanks: BlankField[];
}

// OX問題
export interface OXQuestion extends QuestionBase {
  type: 'ox';
  answer: 'O' | 'X' | 'T' | 'F';
}

// 問題の統合型
export type Question = FillInTheBlankQuestion | OXQuestion;

export interface BlankField {
  id: string;
  answer: string; // "正解1|正解2" のように複数パターンを | 区切りで表現
  position: number;
  placeholder?: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  questionCount: number;
  questions: Question[];
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

#### Markdown 問題ファイルの例

**穴埋め問題（`content/microbiology.md`）**

> 複数の空所を `**___**` のように記述し、解答側で順番に対応させる。

```md
#### 微生物学 第1章 細菌の構造と機能

1. リケッチアは **___** 寄生性の細菌であり、ヒトへの感染は **___** を介する。

### 回答集

#### 微生物学 第1章 細菌の構造と機能

1. **偏性細胞内|真正細胞内**、**節足動物|ダニ|シラミ**
```

**OX問題（`content/bioethics.md`）**

```md
# 生命倫理OX問題

## Q1
TYPE: ox
人の生命の誕生は、胎児の心拍動が出現した時点であると各国の法律で定められている。
### ANSWER
F
---
## Q2
TYPE: ox
厚生労働省は、人工妊娠中絶が許されるのは妊娠満22週未満までとしている。
### ANSWER
T
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

### オンライン利用

デプロイされたアプリをすぐに利用できます：
**🚀 [https://arcane-lowlands-33271-c50f66ea1a67.herokuapp.com/](https://arcane-lowlands-33271-c50f66ea1a67.herokuapp.com/)**

### ローカル開発

#### 依存パッケージのインストール

```bash
npm install
```

#### 開発サーバの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## クレジット（Credits）

このアプリケーションの元となるアイデアとコードは **@hibiki1213** によって作成された。

* Original Repository: [https://github.com/hibiki1213/examapp](https://github.com/hibiki1213/examapp)

## デプロイ情報

このアプリは Heroku にデプロイされており、以下の特徴があります：

- **Live App**: [https://arcane-lowlands-33271-c50f66ea1a67.herokuapp.com/](https://arcane-lowlands-33271-c50f66ea1a67.herokuapp.com/)
- **Platform**: Heroku
- **Runtime**: Node.js
- **Framework**: Next.js 15.4.4
- **自動デプロイ**: Git push による自動デプロイ
- **プロダクション最適化**: Next.js ビルド最適化適用
- **モバイル対応**: レスポンシブデザインで全デバイス対応
- **リアルタイムアクセス**: いつでもオンラインで利用可能

## ライセンス

[MIT License](LICENSE)
