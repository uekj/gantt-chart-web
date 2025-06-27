# ガントチャートアプリ仕様書

## 概要

Web アプリケーションとしてガントチャートを作成・編集できるアプリケーション。

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js (App Router)
- **デプロイ**: Vercel
- **UI**: React

### バックエンド・データベース

- **データベース**: Turso (SQLite 互換)
- **ORM**: Drizzle ORM
- **API**: Next.js API Routes

### テスト

- **E2E**: Playwright

## 機能仕様

### 基本機能

1. **プロジェクト管理**

   - プロジェクトの追加・削除・編集
   - プロジェクト名の編集
   - プロジェクトの表示順序をドラッグ&ドロップで変更
   - プロジェクト開始日の設定

2. **タスク管理**
   - タスクの追加・削除・編集
   - タスク名の編集
   - タスクの表示順序をドラッグ&ドロップで変更

### ガントチャート表示

1. **時間軸**

   - 横軸：1 マス 1 日
   - 表示期間：3 ヶ月分
   - 横スクロール対応
   - 月・日付・曜日を表示
   - 休日と平日の色分け

2. **ズーム機能**
   - 日表示（1 マス 1 日）- 入力用
   - 週表示（1 マス 1 週）- 表示用
   - ボタンでズーム切り替え

### ドラッグ&ドロップ機能

1. **タスクバー操作**

   - バー全体のドラッグ：タスクの日程移動
   - バーの端のドラッグ：開始日/終了日の個別調整
   - リアルタイム更新

2. **順序変更**
   - プロジェクトの順序変更（プロジェクト名をドラッグ）
   - タスクの順序変更

### 制約事項

- **最小期間**: タスクは最短 1 日
- **重複**: 同一プロジェクト内でタスク重複許可
- **プロジェクト開始日**: タスクはプロジェクト開始日以降に設定

## データベース設計

### テーブル構成

#### projects テーブル

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### tasks テーブル

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### インデックス

```sql
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_projects_display_order ON projects(display_order);
CREATE INDEX idx_tasks_display_order ON tasks(project_id, display_order);
```

## UI/UX デザイン

### レイアウト

- 左側：プロジェクト・タスク一覧
- 右側：ガントチャート表示エリア
- 上部：ズーム切り替えボタン、その他操作ボタン

### 表示仕様

- 週をまたぐタスクは連続したバーで表示
- 休日・平日の色分け
- ドラッグ中はリアルタイムで日付更新
- レスポンシブデザイン対応

## 開発・運用

- **コスト重視**: 個人利用の無料枠を最大活用
- **開発体験重視**: TypeScript、Hot Reload、自動デプロイ
- **データ一貫性**: Turso 使用でローカル・本番環境の統一
