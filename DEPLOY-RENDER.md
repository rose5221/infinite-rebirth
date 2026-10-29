# 部署到 Render（3 分钟）

## 方法一：连 Git 仓库（推荐，之后改代码自动更新）

1. 把 `infinite-rebirth/` 整个目录推到你的 GitHub 仓库。
2. Render 控制台 → **New +** → **Blueprint** → 选这个仓库。
3. Render 会读到根目录的 `render.yaml`，直接点 **Apply**。
4. 一分钟内拿到地址：`https://infinite-rebirth.onrender.com`（名字可改）。

`render.yaml` 已写好：静态站点，发布目录 `./web`，不跑服务器，免费额度够用。

## 方法二：直接复用你已有的服务

你现在那个服务（`srv-db8a7ftg1s2s739jubug`）：

1. 进入该服务 → **Settings**，确认 **Publish Directory** 改成本仓库里的 `web`。
2. **Build Command** 留空（纯静态，不需要构建）。
3. 推一次代码触发 Deploy，或点 **Manual Deploy → Clear build cache & deploy**。
4. 原来的网址不变，直接就能打开新版本。

如果用 Docker/Runtime 部署，把 `web/` 放进镜像静态目录即可，不需要任何后端。

## 部署后自检

打开首页，应看到 “∞ 此世 / REBIRTH”；点“初始化神经连接”，能看到姓名、性别、属性分配。若还是旧页面，强刷一次（`?v=3` 或 Ctrl/Cmd+Shift+R）。

## 注意

- 存档在浏览器 localStorage，不跟服务器走；换设备/清缓存会新开一局。
- DeepSeek Key 由每个玩家自己在 ⚙ 里填，服务端不保存任何密钥。
