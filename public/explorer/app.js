const state = {
	endpoints: [],
	filteredEndpoints: [],
	activeEndpoint: null,
	logs: [],
};

const elements = {
	endpointCount: document.getElementById('endpoint-count'),
	searchInput: document.getElementById('search-input'),
	methodFilter: document.getElementById('method-filter'),
	categoryFilter: document.getElementById('category-filter'),
	endpointList: document.getElementById('endpoint-list'),
	activeCategory: document.getElementById('active-category'),
	activeName: document.getElementById('active-name'),
	activePath: document.getElementById('active-path'),
	activeMethod: document.getElementById('active-method'),
	requestForm: document.getElementById('request-form'),
	pathParamSection: document.getElementById('path-param-section'),
	queryParamSection: document.getElementById('query-param-section'),
	bodySection: document.getElementById('body-section'),
	bodyInput: document.getElementById('body-input'),
	requestUrl: document.getElementById('request-url'),
	sendButton: document.getElementById('send-button'),
	resetButton: document.getElementById('reset-button'),
	responseMeta: document.getElementById('response-meta'),
	responseOutput: document.getElementById('response-output'),
	requestLogs: document.getElementById('request-logs'),
	clearLogsButton: document.getElementById('clear-logs-button'),
};

const methodOrder = ['GET', 'POST', 'DELETE'];
const metadataPath = document.currentScript?.dataset.metadataPath;
if (!metadataPath) throw new Error('Explorer metadata path is not configured.');

const normalize = value => String(value || '').toLowerCase();

const formatJson = value => {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
};

const getEndpointPaths = endpoint => [endpoint.path, ...(endpoint.aliases || [])];

const getPathParams = path => [...String(path).matchAll(/:([A-Za-z0-9_]+)\??/g)].map(match => match[1]);

const getActivePath = endpoint => endpoint.path;

const createOption = (value, label = value) => {
	const option = document.createElement('option');
	option.value = value;
	option.textContent = label;
	return option;
};

const setMethodPill = (element, method) => {
	element.textContent = method;
	element.dataset.method = method;
};

const setEndpointCount = () => {
	const total = state.endpoints.length;
	const visible = state.filteredEndpoints.length;
	elements.endpointCount.textContent = `${visible}/${total} 个接口`;
};

const getInputName = (kind, name) => `${kind}:${name}`;

const getInputValue = (kind, name) => {
	const input = document.querySelector(`[name="${CSS.escape(getInputName(kind, name))}"]`);
	return input ? input.value.trim() : '';
};

const buildUrl = () => {
	const endpoint = state.activeEndpoint;
	if (!endpoint) return '/';

	let path = getActivePath(endpoint);
	for (const name of getPathParams(path)) {
		const value = getInputValue('path', name);
		path = path.replace(new RegExp(`:${name}\\??`), value ? encodeURIComponent(value) : '');
	}
	path = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

	const search = new URLSearchParams();
	for (const param of endpoint.queryParams || []) {
		const value = getInputValue('query', param.name);
		if (value) search.set(param.name, value);
	}

	const query = search.toString();
	return query ? `${path}?${query}` : path;
};

const updateRequestUrl = () => {
	elements.requestUrl.textContent = buildUrl();
};

const createField = (kind, param) => {
	const label = document.createElement('label');
	label.className = 'field';

	const text = document.createElement('span');
	text.append(document.createTextNode(param.name));
	if (param.required) {
		text.append(document.createTextNode(' '));
		const requiredMark = document.createElement('b');
		requiredMark.className = 'required';
		requiredMark.textContent = '*';
		text.append(requiredMark);
	}

	const input = document.createElement('input');
	input.name = getInputName(kind, param.name);
	input.placeholder = param.description || param.name;
	input.required = Boolean(param.required);
	input.addEventListener('input', updateRequestUrl);

	label.append(text, input);
	return label;
};

const renderParamSection = (section, title, kind, params) => {
	section.replaceChildren();
	if (!params.length) return;

	const heading = document.createElement('h3');
	heading.className = 'param-title';
	heading.textContent = title;
	section.append(heading);

	params.forEach(param => section.append(createField(kind, param)));
};

const renderActiveEndpoint = () => {
	const endpoint = state.activeEndpoint;
	elements.sendButton.disabled = !endpoint;
	elements.resetButton.disabled = !endpoint;

	if (!endpoint) {
		elements.activeCategory.textContent = '未选择';
		elements.activeName.textContent = '选择一个接口';
		elements.activePath.textContent = '从左侧列表选择接口后填写参数。';
		setMethodPill(elements.activeMethod, 'GET');
		elements.pathParamSection.replaceChildren();
		elements.queryParamSection.replaceChildren();
		elements.bodySection.classList.add('hidden');
		elements.bodyInput.value = '';
		updateRequestUrl();
		return;
	}

	const activePath = getActivePath(endpoint);
	const pathParams = getPathParams(activePath).map(name => ({ name, required: true }));

	elements.activeCategory.textContent = endpoint.category;
	elements.activeName.textContent = endpoint.name;
	elements.activePath.textContent = getEndpointPaths(endpoint).join(' | ');
	setMethodPill(elements.activeMethod, endpoint.method);

	renderParamSection(elements.pathParamSection, '路径参数', 'path', pathParams);
	renderParamSection(elements.queryParamSection, '查询参数', 'query', endpoint.queryParams || []);

	const hasBody = endpoint.method !== 'GET' && endpoint.bodyExample !== undefined;
	elements.bodySection.classList.toggle('hidden', !hasBody);
	elements.bodyInput.value = hasBody ? formatJson(endpoint.bodyExample) : '';
	updateRequestUrl();
};

const renderEndpointList = () => {
	elements.endpointList.replaceChildren();

	if (!state.filteredEndpoints.length) {
		const empty = document.createElement('p');
		empty.className = 'empty-state';
		empty.textContent = '没有匹配的接口';
		elements.endpointList.append(empty);
		setEndpointCount();
		return;
	}

	for (const endpoint of state.filteredEndpoints) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'endpoint-item';
		button.setAttribute('role', 'option');
		button.setAttribute('aria-selected', endpoint === state.activeEndpoint ? 'true' : 'false');

		const container = document.createElement('span');
		const title = document.createElement('span');
		title.className = 'endpoint-title';

		const name = document.createElement('span');
		name.className = 'endpoint-name';
		name.textContent = endpoint.name;

		const method = document.createElement('span');
		method.className = 'method-pill';
		setMethodPill(method, endpoint.method);

		const path = document.createElement('span');
		path.className = 'endpoint-path';
		path.textContent = endpoint.path;

		title.append(name, method);
		container.append(title, path);
		button.append(container);
		button.addEventListener('click', () => {
			state.activeEndpoint = endpoint;
			renderEndpointList();
			renderActiveEndpoint();
		});
		elements.endpointList.append(button);
	}

	setEndpointCount();
};

const applyFilters = () => {
	const query = normalize(elements.searchInput.value);
	const method = elements.methodFilter.value;
	const category = elements.categoryFilter.value;

	state.filteredEndpoints = state.endpoints.filter(endpoint => {
		const matchesMethod = method === 'ALL' || endpoint.method === method;
		const matchesCategory = category === 'ALL' || endpoint.category === category;
		const searchable = normalize(`${endpoint.name} ${endpoint.category} ${getEndpointPaths(endpoint).join(' ')}`);
		return matchesMethod && matchesCategory && searchable.includes(query);
	});

	if (state.activeEndpoint && !state.filteredEndpoints.includes(state.activeEndpoint)) {
		state.activeEndpoint = state.filteredEndpoints[0] || null;
		renderActiveEndpoint();
	}

	renderEndpointList();
};

const populateFilters = () => {
	const methods = [...new Set(state.endpoints.map(endpoint => endpoint.method))].sort(
		(a, b) => methodOrder.indexOf(a) - methodOrder.indexOf(b),
	);
	const categories = [...new Set(state.endpoints.map(endpoint => endpoint.category))].sort((a, b) =>
		a.localeCompare(b),
	);

	methods.forEach(method => elements.methodFilter.append(createOption(method)));
	categories.forEach(category => elements.categoryFilter.append(createOption(category)));
};

const addLog = ({ endpoint, url, status, duration }) => {
	state.logs.unshift({
		id: Date.now(),
		endpointName: endpoint.name,
		method: endpoint.method,
		url,
		status,
		duration,
	});
	state.logs = state.logs.slice(0, 30);
	renderLogs();
};

const renderLogs = () => {
	elements.requestLogs.replaceChildren();
	if (!state.logs.length) {
		const empty = document.createElement('p');
		empty.className = 'empty-state';
		empty.textContent = '还没有请求记录';
		elements.requestLogs.append(empty);
		return;
	}

	state.logs.forEach(log => {
		const item = document.createElement('button');
		item.type = 'button';
		item.className = 'log-item';

		const summary = document.createElement('strong');
		summary.textContent = `${log.method} ${log.endpointName}`;

		const meta = document.createElement('span');
		meta.textContent = `${log.status} · ${log.duration}ms · ${log.url}`;

		item.append(summary, meta);
		item.addEventListener('click', () => {
			elements.responseMeta.textContent = `${log.status} · ${log.duration}ms`;
			elements.requestUrl.textContent = log.url;
		});
		elements.requestLogs.append(item);
	});
};

const submitRequest = async event => {
	event.preventDefault();
	const endpoint = state.activeEndpoint;
	if (!endpoint) return;

	const url = buildUrl();
	const init = { method: endpoint.method };

	if (endpoint.method !== 'GET') {
		const rawBody = elements.bodyInput.value.trim();
		if (rawBody) {
			try {
				init.body = JSON.stringify(JSON.parse(rawBody));
				init.headers = { 'Content-Type': 'application/json' };
			} catch (error) {
				elements.responseMeta.textContent = 'JSON 格式错误';
				elements.responseOutput.textContent = error instanceof Error ? error.message : String(error);
				return;
			}
		}
	}

	elements.sendButton.disabled = true;
	elements.responseMeta.textContent = '请求中...';
	const startedAt = performance.now();

	try {
		const response = await fetch(url, init);
		const duration = Math.round(performance.now() - startedAt);
		const contentType = response.headers.get('content-type') || '';
		const body = contentType.includes('application/json') ? await response.json() : await response.text();
		elements.responseMeta.textContent = `${response.status} ${response.statusText} · ${duration}ms`;
		elements.responseOutput.textContent = typeof body === 'string' ? body : formatJson(body);
		addLog({ endpoint, url, status: response.status, duration });
	} catch (error) {
		const duration = Math.round(performance.now() - startedAt);
		elements.responseMeta.textContent = `请求失败 · ${duration}ms`;
		elements.responseOutput.textContent = error instanceof Error ? error.message : String(error);
		addLog({ endpoint, url, status: 'ERR', duration });
	} finally {
		elements.sendButton.disabled = false;
	}
};

const resetActiveEndpoint = () => {
	renderActiveEndpoint();
};

const loadMetadata = async () => {
	const response = await fetch(metadataPath);
	if (!response.ok) throw new Error(`Metadata request failed: ${response.status}`);

	const metadata = await response.json();
	state.endpoints = [...metadata.endpoints].sort((a, b) =>
		`${a.category}.${a.name}`.localeCompare(`${b.category}.${b.name}`),
	);
	state.filteredEndpoints = state.endpoints;
	state.activeEndpoint = state.endpoints[0] || null;
	populateFilters();
	renderEndpointList();
	renderActiveEndpoint();
	renderLogs();
};

elements.searchInput.addEventListener('input', applyFilters);
elements.methodFilter.addEventListener('change', applyFilters);
elements.categoryFilter.addEventListener('change', applyFilters);
elements.requestForm.addEventListener('submit', submitRequest);
elements.resetButton.addEventListener('click', resetActiveEndpoint);
elements.clearLogsButton.addEventListener('click', () => {
	state.logs = [];
	renderLogs();
});

loadMetadata().catch(error => {
	elements.endpointCount.textContent = '接口加载失败';
	elements.responseMeta.textContent = '加载失败';
	elements.responseOutput.textContent = error instanceof Error ? error.message : String(error);
});
