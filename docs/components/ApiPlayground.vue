<script setup>
import { computed, ref } from 'vue'
import {
  buildFetchOptions,
  buildRequestUrl,
  defaultBaseUrl,
  fetchPlaygroundRequest,
  getErrorMessage
} from '../../public/playground-utils.js'

const presets = [
  {
    name: '播放链接',
    method: 'GET',
    path: '/getMusicPlay',
    query: 'songmid=003rJSwm3TechU',
    body: ''
  },
  {
    name: '歌词',
    method: 'GET',
    path: '/getLyric',
    query: 'songmid=003rJSwm3TechU&isFormat=1',
    body: ''
  },
  {
    name: '搜索',
    method: 'GET',
    path: '/getSearchByKey',
    query: 'key=周杰伦&limit=10&page=1',
    body: ''
  },
  {
    name: '批量歌曲信息',
    method: 'POST',
    path: '/batchGetSongInfo',
    query: '',
    body: '{\n  "songs": [\n    ["003rJSwm3TechU"],\n    ["0042c8L50x6Z9z"]\n  ]\n}'
  },
  {
    name: '歌单列表',
    method: 'POST',
    path: '/batchGetSongLists',
    query: '',
    body: '{\n  "categoryIds": [10000000],\n  "page": 0,\n  "limit": 19,\n  "sortId": 5\n}'
  }
]

const baseUrl = ref(defaultBaseUrl)
const selectedName = ref(presets[0].name)
const method = ref(presets[0].method)
const path = ref(presets[0].path)
const query = ref(presets[0].query)
const body = ref(presets[0].body)
const cookie = ref('')
const loading = ref(false)
const status = ref('')
const elapsed = ref('')
const responseText = ref('')
const errorText = ref('')

const selectedPreset = computed(() => presets.find(item => item.name === selectedName.value) || presets[0])

const requestUrl = computed(() => {
  return buildRequestUrl({
    baseUrl: baseUrl.value,
    path: path.value,
    query: query.value
  })
})

const applyPreset = () => {
  const preset = selectedPreset.value
  method.value = preset.method
  path.value = preset.path
  query.value = preset.query
  body.value = preset.body
  responseText.value = ''
  errorText.value = ''
  status.value = ''
  elapsed.value = ''
}

const sendRequest = async () => {
  loading.value = true
  status.value = ''
  elapsed.value = ''
  responseText.value = ''
  errorText.value = ''
  const startedAt = performance.now()

  try {
    const result = await fetchPlaygroundRequest({
      url: requestUrl.value,
      options: buildFetchOptions({
        method: method.value,
        cookie: cookie.value,
        body: body.value
      })
    })
    status.value = result.statusText
    responseText.value = result.formattedText
    elapsed.value = `${result.elapsedMs} ms`
  } catch (error) {
    errorText.value = getErrorMessage(error)
    elapsed.value = `${Math.round(performance.now() - startedAt)} ms`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="api-playground">
    <div class="toolbar">
      <label>
        <span>预设接口</span>
        <select v-model="selectedName" @change="applyPreset">
          <option v-for="preset in presets" :key="preset.name" :value="preset.name">
            {{ preset.name }}
          </option>
        </select>
      </label>
      <label>
        <span>Base URL</span>
        <input v-model="baseUrl" type="url" spellcheck="false">
      </label>
    </div>

    <div class="request-line">
      <select v-model="method" aria-label="请求方法">
        <option>GET</option>
        <option>POST</option>
      </select>
      <input v-model="path" aria-label="接口路径" spellcheck="false">
      <button type="button" :disabled="loading" @click="sendRequest">
        {{ loading ? '请求中' : '发送请求' }}
      </button>
    </div>

    <label class="field">
      <span>Query</span>
      <input v-model="query" spellcheck="false" placeholder="key=value&limit=10">
    </label>

    <label class="field">
      <span>登录态 Cookie</span>
      <textarea v-model="cookie" rows="2" spellcheck="false" placeholder="通过 X-Custom-Cookie 发送，例如 uin=o123456789; qqmusic_key=..."></textarea>
    </label>

    <label class="field">
      <span>Body</span>
      <textarea v-model="body" rows="7" spellcheck="false" :disabled="method === 'GET'"></textarea>
    </label>

    <div class="url-preview">{{ requestUrl }}</div>

    <div class="result-head">
      <span>{{ status || '等待请求' }}</span>
      <span>{{ elapsed }}</span>
    </div>

    <pre v-if="errorText" class="result error">{{ errorText }}</pre>
    <pre v-else class="result">{{ responseText || '响应会显示在这里' }}</pre>
  </div>
</template>

<style scoped>
.api-playground {
  display: grid;
  gap: 14px;
  margin: 24px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(180px, 0.8fr) minmax(240px, 1.2fr);
  gap: 12px;
}

.request-line {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 120px;
  gap: 10px;
}

.field {
  display: grid;
  gap: 6px;
}

label span {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 9px 10px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font: inherit;
}

textarea {
  resize: vertical;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

button {
  border: 0;
  border-radius: 6px;
  color: white;
  background: var(--vp-c-brand-1);
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.url-preview {
  overflow-wrap: anywhere;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  padding: 10px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.result-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.result {
  min-height: 180px;
  max-height: 520px;
  overflow: auto;
  margin: 0;
  border-radius: 6px;
  padding: 14px;
  background: var(--vp-code-block-bg);
  font-size: 13px;
}

.error {
  color: #d53939;
}

@media (max-width: 720px) {
  .toolbar,
  .request-line {
    grid-template-columns: 1fr;
  }

  button {
    min-height: 40px;
  }
}
</style>
