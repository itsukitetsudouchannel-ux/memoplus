# memo+ 🌱

語学学習向け暗記アプリ。単語帳をカメラで撮影してAIが自動でクイズを作成します。

## Vercelで公開する手順

### 方法①：GitHubを使う（推奨）

1. [github.com](https://github.com) でアカウント作成（無料）
2. 「New repository」でリポジトリを作成（名前: `memoplus`）
3. このフォルダの中身を全てアップロード（または `git push`）
4. [vercel.com](https://vercel.com) でアカウント作成（GitHubでログイン可）
5. 「Add New Project」→ GitHubのリポジトリを選択
6. 「Deploy」ボタンを押すだけ！

→ `https://memoplus.vercel.app` のようなURLで公開されます 🎉

### 方法②：Vercel CLIを使う（上級者向け）

```bash
npm install -g vercel
cd memoplus
vercel
```

## 技術スタック

- React 18
- Claude API（画像読み取り）
- Vercel（ホスティング）
