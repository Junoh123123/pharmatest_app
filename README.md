# 薬学部試験対策クイズアプリ

## 概要

薬学部の試験で出題される各科目の穴埋め問題を効率的に学習できるインタラクティブなWebアプリケーション。科目・章ごとに整理された問題を一問一答形式で練習し、即座にフィードバックを受けることができます。

## 要件定義

### 機能要件

#### 1. 問題カテゴリ管理
- **科目・章ごとの問題セット**:
  - 微生物学 第1章 細菌の構造と機能 (Bacterial Structure and Function) - 9問
  - 微生物学 第2章 細菌の一般性状 (General Properties of Bacteria) - 18問  
  - 微生物学 第3章 グラム陽性球菌およびグラム陰性球菌 (Gram-positive and Gram-negative Cocci) - 18問
  - 微生物学 第4回 グラム陽性桿菌 (Gram-positive Bacilli) - 37問
  - 微生物学 第5回 グラム陰性桿菌 (Gram-negative Bacilli) - 24問
  - 微生物学 第6回 特殊細菌 (Special Bacteria) - 26問
  - 微生物学 第7回 マイコプラズマ・リケッチア・クラミジア (Mycoplasma, Rickettsia, Chlamydia) - 14問

#### 2. 学習フロー
- カテゴリ選択画面
- 問題表示（虫食い部分がテキストボックス）
- 回答送信・即座の正誤判定
- 正解表示とフィードバック
- 次の問題への遷移
- 完了時の結果表示

#### 3. 問題機能
- 複数の虫食い箇所を持つ問題への対応
- 大文字小文字・空白の寛容な採点
- 部分点システム（複数解答時）
- 学名・和名など複数の正解パターンに対応

### 非機能要件

#### 1. UI/UX設計
- **Apple Human Interface Guidelines準拠**
- ミニマルで洗練されたデザイン
- 画面中央に大きく問題を表示
- サイドバー・ヘッダーなし
- レスポンシブ対応

#### 2. パフォーマンス
- 静的サイト生成（SSG）活用
- クライアントサイドでの高速な問題遷移
- 軽量なバンドルサイズ

## 技術スタック

### フロントエンド
- **Next.js 15.4.4** - React フレームワーク
- **React 19.1.0** - UI ライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - スタイリング

### 開発ツール
- **ESLint** - コード品質
- **Node.js** - 開発環境
- **Heroku** - ホスティング・デプロイ

## プロジェクト構造

```
examapp-main/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホーム - カテゴリ選択
│   ├── [category]/        # 動的ルーティング
│   │   └── page.tsx       # カテゴリ別問題画面
│   ├── layout.tsx         # レイアウト
│   └── globals.css        # グローバルスタイル
├── components/            # 再利用可能コンポーネント
│   ├── CategoryCard.tsx   # カテゴリ選択カード
│   ├── QuestionCard.tsx   # 問題表示カード
│   ├── AnswerInput.tsx    # 回答入力フィールド
│   └── ResultDisplay.tsx  # 結果表示
├── lib/                   # ユーティリティ・データ
│   ├── examData.ts        # 問題データ型定義
│   ├── parseExam.ts       # exam.md パーサー
│   └── scoring.ts         # 採点ロジック
├── types/                 # TypeScript型定義
│   └── exam.ts            # 問題・回答型
└── data/                  # 静的データ
    └── questions.json     # パース済み問題データ
```

## データ設計

### 問題データ構造
```typescript
interface Question {
  id: string
  category: string
  text: string
  blanks: Array<{
    id: string
    answer: string
    position: number
  }>
}

interface Category {
  id: string
  name: string
  description: string
  questionCount: number
}
```

## 開発フェーズ

### Phase 1: 基盤構築
- [ ] データパーサーの実装
- [ ] 基本コンポーネントの作成
- [ ] ルーティング設定

### Phase 2: 機能実装
- [ ] 問題表示・回答機能
- [ ] 採点ロジック
- [ ] プログレス管理

### Phase 3: UI/UX改善
- [ ] Apple HIG準拠のデザイン適用
- [ ] アニメーション・トランジション
- [ ] レスポンシブ対応

### Phase 4: 最適化
- [ ] パフォーマンス調整
- [ ] アクセシビリティ対応
- [ ] エラーハンドリング

## 使用方法

1. **開発環境の起動**
   ```bash
   npm run dev
   ```

2. **アプリの使用**
   - カテゴリを選択
   - 問題文の空欄に回答を入力
   - 回答を送信して正誤を確認
   - 全問題完了後に結果を表示

   ---

## クレジット (Credits)

このアプリケーションの元となるアイデアとコードは [@hibiki1213](https://github.com/hibiki1213) によって作成されました。

* **Original Repository**: [https://github.com/hibiki1213/examapp]

## ライセンス

MIT License
