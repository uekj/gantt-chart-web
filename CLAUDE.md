# Gantt Chart App Development

## Project Overview

ガントチャート Web アプリの開発プロジェクト。

## Development Environment

- **Node.js**: Volta 管理（プロジェクトルートで自動切り替え）
- **パッケージ管理**: pnpm（npm ではなく pnpm を使用）
- **グローバルインストール**: Volta を使用（npm install -g ではなく volta install）
- **推奨バージョン**: Node.js 22.16.0, pnpm 10.12.1

### パッケージ管理ルール

- **ローカル依存関係**: `pnpm install`、`pnpm add`
- **一時実行**: `pnpm dlx` (npx の代替)
- **グローバルツール**: `volta install <package>` (npm install -g の代替)

## Quick Reference

- **仕様書**: `docs/specification.md`
- **技術スタック**: Next.js + Turso + Drizzle ORM
- **デプロイ**: Vercel

## Development Commands

```bash
# Frontend (Next.js) - pnpmを使用
pnpm dev
pnpm build
pnpm lint

# Database
pnpm db:setup      # スキーマ作成+初期データ投入
pnpm db:test       # 接続テスト
pnpm db:studio     # DB管理UI

# Testing
pnpm test:e2e      # E2Eテスト実行
pnpm test:e2e:ui   # テストUIで実行
pnpm test:e2e:debug # デバッグモードで実行
pnpm test          # ユニットテスト実行
pnpm test:ui       # テストUI起動

```

## Database

- **ローカル開発**: SQLite (file:./local.db)
- **本番環境**: Turso (SQLite 互換)
- **ORM**: Drizzle ORM
- **Schema**: `docs/specification.md`参照
- **初期化**: ローカル開発時は自動でスキーマ作成・サンプルデータ投入

## Key Features

1. ガントチャート表示・編集
2. ドラッグ&ドロップ操作
3. プロジェクト・タスク管理

## Constraints

- タスク最小期間: 1 日
- 過去日付設定: 不可
- タスク重複: 可
- プロジェクト開始日前タスク: 不可

## Development Guidelines

### 設計・実装方針

- **複雑性の回避**: 実装が複雑になる場合は外部仕様・設計レベルから見直しを提案
- **簡潔性重視**: 仕様をシンプルに保ち、メンテナブルなコードを目指す
- **段階的開発**: 基本機能から段階的に機能追加
- **開発全般**: Kent Beck の Tidy First Principle を実践する
- **バックエンド開発**: バックエンドの開発には t_wada の TDD を実践する

### ドキュメント管理ルール

- **設計議論の記録**: 設計・外部仕様の議論内容は`docs/`配下に専用ファイルを作成して記録
- **文脈の保持**: 次回起動時に文脈が理解できるよう決定事項・検討事項を明確に区別
- **実装ログの保持**: yyyy-mm-dd\_機能名.md という名前で実装ログをで保存する
- **進捗の可視化**: 現在の開発状況を適切なドキュメントファイルで管理

### ブランチ・PR 管理ルール

- **feature はローカルで管理**
  1. docs/feature-status.md として管理
- **1 Feature = 1 Branch**
- **ブランチ命名**: `feature/{short-description}` (例: `feature/e2e-testing`)
- **git commit は区切りのいいところで適宜行う**
- **作業フロー**:
  1. feature を選択・アサイン
  2. feature 専用ブランチを作成
  3. 実装・テスト・ドキュメント更新
  4. PR 作成
  5. レビュー
  6. マージ後、ブランチ削除
  7. 次の feature に移行
  8. 適宜 feature を取り込む
- **PR 要件**:
  - feature 名をタイトルに含める
  - 実装内容の簡潔な説明
  - テスト実行結果の確認
  - 関連ドキュメントの更新
