---
title: Gitをローカルで使ってみよう
order: 2
---

## Gitのインストール

Gitを使うにはまずGitをインストールする必要があります。

### Windowsの場合

WSLを使っている場合は、WSLのUbuntuにGitをインストールします。

WSLを使っていない場合は、[Git for Windows](https://gitforwindows.org/)をインストールします。

### Macの場合

Macには最初からGitがインストールされています。

## Gitの初期設定

Gitをインストールしたら、Gitの初期設定を行います。

### ユーザー名とメールアドレスの設定

Gitを使うときには、ユーザー名とメールアドレスを設定する必要があります。

Gitをインストールしたら、Git Bashを起動して、以下のコマンドを実行します。

```bash
git config --global user.name "ユーザー名"
git config --global user.email "メールアドレス"
```

ユーザー名とメールアドレスはGitHubなどの外部サービスと連携するときに使われます。

## リポジトリの作成
