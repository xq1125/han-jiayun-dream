# 韩佳韵™ 梦境限定款 · 内容上传指南

这是一个**纯静态网站**，不需要服务器，双击 `index.html` 即可本地打开。
想往上面加内容（作品、视频、图片、卡片、签文），只需要做两件事：

1. **把文件放进对应文件夹**
2. **在 `js/data.js` 里加一条记录**

改完刷新浏览器即可生效。建议用 VS Code / Cursor 编辑 `js/data.js`，它就是一个"内容清单"。

---

## 📁 文件夹地图

```
han-jiayun-site/
├── index.html            主页面
├── css/style.css         视觉样式
├── js/
│   ├── data.js           ★ 你要改的内容清单（作品/包/扭蛋/签文全在这）
│   ├── main.js           页面引擎（一般不用动）
│   └── gacha.js          扭蛋与抽签逻辑（一般不用动）
├── assets/
│   ├── works/            ★ 作品图片放这里（jpg/png/webp）
│   ├── videos/           ★ 视频放这里（mp4，建议 <50MB，太大就传B站用链接）
│   └── img/              梦核氛围素材图（背景/明信片）
└── _work/                制作过程文件（可删）
```

---

## 🖼 上传一个新作品（图片）

1. 把图片放进 `assets/works/`，例如 `w13-1.jpg`、`w13-2.jpg`（第一张会自动作为卡片封面）。
2. 打开 `js/data.js`，在 `works: [...]` 数组末尾加一条：

```js
{ no:"13", title:"作品名", sub:"一句话副标题", cat:"分类标签", year:"2026",
  price:"¥ 一个想你的深夜",          //  playful 定价，随便写
  badge:"新品",                      // 可选角标，不要就删掉这行
  desc:"作品详细介绍，点开卡片后显示。",
  tags:["标签1","标签2"], images:["assets/works/w13-1.jpg","assets/works/w13-2.jpg"] },
```

## 🎬 上传一个视频

**方式 A：本地文件** — 把 mp4 放进 `assets/videos/`，作品条目里加：

```js
type:"video", video:{ src:"assets/videos/my-video.mp4" },
```

**方式 B：B 站视频**（推荐，省空间）— 作品条目里加：

```js
type:"video", video:{ bilibili:"BV1xx411c7mD" },   // 换成你的BV号
```

点开作品卡片后视频会自动出现在详情页顶部。

## 🔗 挂一个外部链接（比如你写的网页）

```js
link:{ url:"https://你的网址", label:"打开这个网页 →" },
```

## 🎲 加一张扭蛋卡

在 `data.js` 的 `cards: [...]` 里加：

```js
{ id:"唯一英文id", rarity:"SR", emoji:"🌟", name:"卡片名", text:"卡片上的文案。" },
// rarity 可选 "N" / "R" / "SR" / "SSR"；想配图就加 img:"assets/img/xxx.jpg"
```

抽卡概率在 `gachaRates`，保底次数在 `gachaPity`，都可以改。

## 🥮 加一条今日签

在 `data.js` 的 `fortunes: [...]` 里加：

```js
{ level:"大吉", title:"签名", text:"签文内容。" },
```

## 🎲 修改大富翁棋盘（品牌大事记）

`data.js` 里的 `board: [...]` 是 20 个格子，按**顺时针**排列（第 1 格 = 左下角 GO 出厂格）：

- 加一个里程碑：把某个 `kind:"chance"` 机会格改成 `kind:"event"`，填上 `year / title / text / ico`；
- 机会格效果 `effect.type` 可选：`forward`（前进 n 格）、`back`（后退 n 格）、`tbao`（汤包+1）、`talk`、`stall`；
- ⚠ 格子总数必须保持 **20**（棋盘按 20 格布局，多了少了都会错位）。

## 🎒 往"我的包"里塞东西

在 `data.js` 的 `bag: [...]` 里加：

```js
{ ico:"🧸", name:"物品名", note:"物品的自我介绍" },
```

---

## 🌐 想发布到网上？

- **GitHub Pages**（免费，推荐）：新建仓库 → 上传整个文件夹 → Settings 里开启 Pages。
- **Netlify / Vercel**（免费）：直接把 `han-jiayun-site` 文件夹拖进后台即可。

## ✂️ 小提醒

- 收藏册和抽卡记录存在浏览器 localStorage 里，换设备会重置（这是特性不是bug，梦境不跨设备）。
- 载入动画每个浏览器会话只播一次，想重看就开无痕窗口。
- 点首页右上角的**月亮**可以换梦境频道（天空配色），这是彩蛋。
