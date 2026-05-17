---
layout: doc
title: API 调试台
---

<script setup>
import ApiPlayground from '../components/ApiPlayground.vue'
</script>

# API 调试台

这个页面可以直接向本地或远程服务发送请求。默认地址是 `http://localhost:3200`，如果文档站点运行在 HTTPS 页面中，浏览器可能会拦截对 HTTP 服务的请求，此时可以在本地运行 `npm run docs:dev` 后打开调试台。

<ApiPlayground />
