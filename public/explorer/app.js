/* Generated from src/explorer/explorerBootstrap.ts. Do not edit manually. */
(function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/explorer/explorerApp.ts
	var methodOrder = [
		"GET",
		"POST",
		"DELETE"
	];
	var getRequiredElement = (id) => {
		const element = document.getElementById(id);
		if (!element) throw new Error(`Explorer element is missing: ${id}`);
		return element;
	};
	var getElements = () => ({
		endpointCount: getRequiredElement("endpoint-count"),
		searchInput: getRequiredElement("search-input"),
		methodFilter: getRequiredElement("method-filter"),
		categoryFilter: getRequiredElement("category-filter"),
		endpointList: getRequiredElement("endpoint-list"),
		activeCategory: getRequiredElement("active-category"),
		activeName: getRequiredElement("active-name"),
		activePath: getRequiredElement("active-path"),
		activeMethod: getRequiredElement("active-method"),
		requestForm: getRequiredElement("request-form"),
		pathParamSection: getRequiredElement("path-param-section"),
		queryParamSection: getRequiredElement("query-param-section"),
		bodySection: getRequiredElement("body-section"),
		bodyInput: getRequiredElement("body-input"),
		requestUrl: getRequiredElement("request-url"),
		sendButton: getRequiredElement("send-button"),
		resetButton: getRequiredElement("reset-button"),
		copyUrlButton: getRequiredElement("copy-url-button"),
		responseMeta: getRequiredElement("response-meta"),
		responseOutput: getRequiredElement("response-output"),
		copyResponseButton: getRequiredElement("copy-response-button"),
		requestLogs: getRequiredElement("request-logs"),
		clearLogsButton: getRequiredElement("clear-logs-button")
	});
	var getScriptMetadataPath = () => {
		return document.currentScript?.dataset.metadataPath || document.querySelector("script[data-metadata-path]")?.dataset.metadataPath;
	};
	var normalize = (value) => String(value || "").toLowerCase();
	var getDeepLinkParams = () => new URLSearchParams(window.location.search);
	var formatJson = (value) => {
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	};
	var getEndpointPaths = (endpoint) => [endpoint.path, ...endpoint.aliases || []];
	var getPathParams = (path) => [...String(path).matchAll(/:([A-Za-z0-9_]+)\??/g)].map((match) => match[1]);
	var getActivePath = (endpoint) => endpoint.path;
	var createOption = (value, label = value) => {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = label;
		return option;
	};
	var setMethodPill = (element, method) => {
		element.textContent = method;
		element.dataset.method = method;
	};
	var getInputName = (kind, name) => `${kind}:${name}`;
	var getNamedControl = (kind, name) => document.querySelector(`[name="${CSS.escape(getInputName(kind, name))}"]`);
	var initExplorerApp = (options = {}) => {
		const metadataPath = options.metadataPath || getScriptMetadataPath();
		if (!metadataPath) throw new Error("Explorer metadata path is not configured.");
		const state = {
			endpoints: [],
			filteredEndpoints: [],
			activeEndpoint: null,
			logs: []
		};
		const elements = getElements();
		const setResponse = (meta, text, responseState) => {
			elements.responseMeta.textContent = meta;
			elements.responseMeta.dataset.state = responseState;
			elements.responseOutput.textContent = text;
			elements.responseOutput.dataset.state = responseState;
			elements.copyResponseButton.disabled = responseState === "idle" || responseState === "loading";
		};
		const clearResponse = () => {
			setResponse("等待请求", "发送请求后，响应会显示在这里。", "idle");
		};
		const copyText = async (value) => {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
				return;
			}
			const textarea = document.createElement("textarea");
			textarea.value = value;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.append(textarea);
			try {
				textarea.select();
				if (!document.execCommand("copy")) throw new Error("当前浏览器不支持复制");
			} finally {
				textarea.remove();
			}
		};
		const withCopyFeedback = async (button, value) => {
			const defaultLabel = button.dataset.defaultLabel || button.textContent || "复制";
			button.dataset.defaultLabel = defaultLabel;
			try {
				await copyText(value);
				button.textContent = "已复制";
			} catch {
				button.textContent = "复制失败";
			} finally {
				window.setTimeout(() => {
					button.textContent = defaultLabel;
				}, 1400);
			}
		};
		const setEndpointCount = () => {
			const total = state.endpoints.length;
			const visible = state.filteredEndpoints.length;
			elements.endpointCount.textContent = `${visible}/${total} 个接口`;
		};
		const getInputValue = (kind, name) => {
			const input = getNamedControl(kind, name);
			return input ? input.value.trim() : "";
		};
		const setInputValue = (kind, name, value) => {
			const input = getNamedControl(kind, name);
			if (input) input.value = String(value);
		};
		const buildUrl = () => {
			const endpoint = state.activeEndpoint;
			if (!endpoint) return "/";
			let path = getActivePath(endpoint);
			for (const name of getPathParams(path)) {
				const value = getInputValue("path", name);
				path = path.replace(new RegExp(`:${name}\\??`), value ? encodeURIComponent(value) : "");
			}
			path = path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
			const search = new URLSearchParams();
			for (const param of endpoint.queryParams || []) {
				const value = getInputValue("query", param.name);
				if (value) search.set(param.name, value);
			}
			const query = search.toString();
			return query ? `${path}?${query}` : path;
		};
		const updateRequestUrl = () => {
			elements.requestUrl.textContent = buildUrl();
		};
		const captureParamValues = (endpoint) => ({
			pathParams: Object.fromEntries(getPathParams(getActivePath(endpoint)).map((name) => [name, getInputValue("path", name)])),
			queryParams: Object.fromEntries((endpoint.queryParams || []).map((param) => [param.name, getInputValue("query", param.name)]).filter(([, value]) => value))
		});
		const createField = (kind, param) => {
			const label = document.createElement("label");
			label.className = "field";
			const text = document.createElement("span");
			text.append(document.createTextNode(param.name));
			if (param.required) {
				text.append(document.createTextNode(" "));
				const requiredMark = document.createElement("b");
				requiredMark.className = "required";
				requiredMark.textContent = "*";
				text.append(requiredMark);
			}
			const control = param.enumValues?.length ? document.createElement("select") : document.createElement("input");
			control.name = getInputName(kind, param.name);
			control.required = Boolean(param.required);
			if (control instanceof HTMLSelectElement) {
				if (!param.required) control.append(createOption("", "默认"));
				param.enumValues?.forEach((value) => control.append(createOption(String(value))));
			} else {
				const placeholder = param.example ?? param.description ?? param.name;
				control.placeholder = String(placeholder);
			}
			if (param.defaultValue !== void 0) control.value = String(param.defaultValue);
			control.addEventListener("input", updateRequestUrl);
			control.addEventListener("change", updateRequestUrl);
			label.append(text, control);
			const hints = [];
			if (param.description) hints.push(param.description);
			if (param.defaultValue !== void 0) hints.push(`默认: ${param.defaultValue}`);
			if (param.example !== void 0) hints.push(`示例: ${param.example}`);
			if (param.enumValues?.length) hints.push(`可选: ${param.enumValues.join(", ")}`);
			if (hints.length > 0) {
				const help = document.createElement("small");
				help.className = "field-help";
				help.textContent = hints.join(" · ");
				label.append(help);
			}
			return label;
		};
		const renderParamSection = (section, title, kind, params) => {
			section.replaceChildren();
			if (!params.length) return;
			const heading = document.createElement("h3");
			heading.className = "param-title";
			heading.textContent = title;
			section.append(heading);
			params.forEach((param) => section.append(createField(kind, param)));
		};
		const renderActiveEndpoint = () => {
			const endpoint = state.activeEndpoint;
			elements.sendButton.disabled = !endpoint;
			elements.resetButton.disabled = !endpoint;
			elements.copyUrlButton.disabled = !endpoint;
			if (!endpoint) {
				elements.activeCategory.textContent = "未选择";
				elements.activeName.textContent = "选择一个接口";
				elements.activePath.textContent = "从左侧列表选择接口后填写参数。";
				setMethodPill(elements.activeMethod, "GET");
				elements.pathParamSection.replaceChildren();
				elements.queryParamSection.replaceChildren();
				elements.bodySection.classList.add("hidden");
				elements.bodyInput.value = "";
				updateRequestUrl();
				clearResponse();
				return;
			}
			const pathParams = getPathParams(getActivePath(endpoint)).map((name) => ({
				name,
				required: true
			}));
			elements.activeCategory.textContent = endpoint.category;
			elements.activeName.textContent = endpoint.name;
			elements.activePath.textContent = [endpoint.description, getEndpointPaths(endpoint).join(" | ")].filter(Boolean).join(" · ");
			setMethodPill(elements.activeMethod, endpoint.method);
			renderParamSection(elements.pathParamSection, "路径参数", "path", pathParams);
			renderParamSection(elements.queryParamSection, "查询参数", "query", endpoint.queryParams || []);
			const hasBody = endpoint.method !== "GET" && endpoint.bodyExample !== void 0;
			elements.bodySection.classList.toggle("hidden", !hasBody);
			elements.bodyInput.value = hasBody ? formatJson(endpoint.bodyExample) : "";
			updateRequestUrl();
		};
		const findDeepLinkedEndpoint = (endpoints) => {
			const params = getDeepLinkParams();
			const apiName = params.get("api") || params.get("name");
			if (!apiName) return null;
			const normalizedApiName = normalize(apiName);
			return endpoints.find((endpoint) => {
				const paths = getEndpointPaths(endpoint);
				return normalize(endpoint.name) === normalizedApiName || paths.some((path) => normalize(path) === normalizedApiName);
			}) || null;
		};
		const applyDeepLinkParams = (endpoint) => {
			if (!endpoint) return;
			const params = getDeepLinkParams();
			getPathParams(getActivePath(endpoint)).forEach((name) => {
				const value = params.get(name);
				if (value !== null) setInputValue("path", name, value);
			});
			(endpoint.queryParams || []).forEach((param) => {
				const value = params.get(param.name);
				if (value !== null) setInputValue("query", param.name, value);
			});
			const rawBody = params.get("body");
			if (rawBody && !elements.bodySection.classList.contains("hidden")) try {
				elements.bodyInput.value = formatJson(JSON.parse(rawBody));
			} catch {
				elements.bodyInput.value = rawBody;
			}
			updateRequestUrl();
		};
		const renderEndpointList = () => {
			elements.endpointList.replaceChildren();
			if (!state.filteredEndpoints.length) {
				const empty = document.createElement("p");
				empty.className = "empty-state";
				empty.textContent = "没有匹配的接口";
				elements.endpointList.append(empty);
				setEndpointCount();
				return;
			}
			for (const endpoint of state.filteredEndpoints) {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "endpoint-item";
				button.setAttribute("role", "option");
				button.setAttribute("aria-selected", endpoint === state.activeEndpoint ? "true" : "false");
				const container = document.createElement("span");
				const title = document.createElement("span");
				title.className = "endpoint-title";
				const name = document.createElement("span");
				name.className = "endpoint-name";
				name.textContent = endpoint.name;
				const method = document.createElement("span");
				method.className = "method-pill";
				setMethodPill(method, endpoint.method);
				const path = document.createElement("span");
				path.className = "endpoint-path";
				path.textContent = endpoint.path;
				title.append(name, method);
				container.append(title, path);
				button.append(container);
				button.addEventListener("click", () => {
					state.activeEndpoint = endpoint;
					renderEndpointList();
					renderActiveEndpoint();
					clearResponse();
				});
				elements.endpointList.append(button);
			}
			setEndpointCount();
		};
		const applyFilters = () => {
			const query = normalize(elements.searchInput.value);
			const method = elements.methodFilter.value;
			const category = elements.categoryFilter.value;
			state.filteredEndpoints = state.endpoints.filter((endpoint) => {
				const matchesMethod = method === "ALL" || endpoint.method === method;
				const matchesCategory = category === "ALL" || endpoint.category === category;
				const searchable = normalize(`${endpoint.name} ${endpoint.category} ${getEndpointPaths(endpoint).join(" ")}`);
				return matchesMethod && matchesCategory && searchable.includes(query);
			});
			if (state.activeEndpoint && !state.filteredEndpoints.includes(state.activeEndpoint)) {
				state.activeEndpoint = state.filteredEndpoints[0] || null;
				renderActiveEndpoint();
			}
			renderEndpointList();
		};
		const populateFilters = () => {
			const methods = [...new Set(state.endpoints.map((endpoint) => endpoint.method))].sort((a, b) => methodOrder.indexOf(a) - methodOrder.indexOf(b));
			const categories = [...new Set(state.endpoints.map((endpoint) => endpoint.category))].sort((a, b) => a.localeCompare(b));
			methods.forEach((method) => elements.methodFilter.append(createOption(method)));
			categories.forEach((category) => elements.categoryFilter.append(createOption(category)));
		};
		const renderLogs = () => {
			elements.requestLogs.replaceChildren();
			if (!state.logs.length) {
				const empty = document.createElement("p");
				empty.className = "empty-state";
				empty.textContent = "还没有请求记录";
				elements.requestLogs.append(empty);
				return;
			}
			state.logs.forEach((log) => {
				const item = document.createElement("button");
				item.type = "button";
				item.className = "log-item";
				item.dataset.state = log.status === "ERR" || typeof log.status === "number" && log.status >= 400 ? "error" : "success";
				const summary = document.createElement("strong");
				summary.textContent = `${log.method} ${log.endpointName}`;
				const meta = document.createElement("span");
				meta.textContent = `${log.status} · ${log.duration}ms · ${log.url}`;
				item.append(summary, meta);
				item.addEventListener("click", () => {
					const endpoint = state.endpoints.find((candidate) => candidate.name === log.endpointName);
					if (!endpoint) return;
					state.activeEndpoint = endpoint;
					renderEndpointList();
					renderActiveEndpoint();
					Object.entries(log.pathParams).forEach(([name, value]) => setInputValue("path", name, value));
					Object.entries(log.queryParams).forEach(([name, value]) => setInputValue("query", name, value));
					elements.bodyInput.value = log.body;
					updateRequestUrl();
					setResponse(log.responseMeta, log.responseText, log.status === "ERR" || typeof log.status === "number" && log.status >= 400 ? "error" : "success");
				});
				elements.requestLogs.append(item);
			});
		};
		const addLog = ({ endpoint, url, status, duration, pathParams, queryParams, body, responseMeta, responseText }) => {
			state.logs.unshift({
				id: Date.now(),
				endpointName: endpoint.name,
				method: endpoint.method,
				url,
				status,
				duration,
				pathParams,
				queryParams,
				body,
				responseMeta,
				responseText
			});
			state.logs = state.logs.slice(0, 30);
			renderLogs();
		};
		const submitRequest = async (event) => {
			event.preventDefault();
			const endpoint = state.activeEndpoint;
			if (!endpoint) return;
			const url = buildUrl();
			const init = { method: endpoint.method };
			const requestParams = captureParamValues(endpoint);
			const requestBody = elements.bodyInput.value;
			if (endpoint.method !== "GET") {
				const rawBody = elements.bodyInput.value.trim();
				if (rawBody) try {
					init.body = JSON.stringify(JSON.parse(rawBody));
					init.headers = { "Content-Type": "application/json" };
				} catch (error) {
					setResponse("JSON 格式错误", error instanceof Error ? error.message : String(error), "error");
					return;
				}
			}
			elements.sendButton.disabled = true;
			setResponse("请求中...", "正在等待服务响应...", "loading");
			const startedAt = performance.now();
			try {
				const response = await fetch(url, init);
				const duration = Math.round(performance.now() - startedAt);
				const contentType = response.headers.get("content-type") || "";
				const rawBody = await response.text();
				let responseText = rawBody;
				if (contentType.includes("application/json") && rawBody) try {
					responseText = formatJson(JSON.parse(rawBody));
				} catch {
					responseText = rawBody;
				}
				const responseMeta = `${response.status} ${response.statusText} · ${duration}ms`;
				setResponse(responseMeta, responseText, response.ok ? "success" : "error");
				addLog({
					endpoint,
					url,
					status: response.status,
					duration,
					...requestParams,
					body: requestBody,
					responseMeta,
					responseText
				});
			} catch (error) {
				const duration = Math.round(performance.now() - startedAt);
				const responseMeta = `请求失败 · ${duration}ms`;
				const responseText = error instanceof Error ? error.message : String(error);
				setResponse(responseMeta, responseText, "error");
				addLog({
					endpoint,
					url,
					status: "ERR",
					duration,
					...requestParams,
					body: requestBody,
					responseMeta,
					responseText
				});
			} finally {
				elements.sendButton.disabled = false;
			}
		};
		const resetActiveEndpoint = () => {
			renderActiveEndpoint();
			clearResponse();
		};
		const loadMetadata = async () => {
			const response = await fetch(metadataPath);
			if (!response.ok) throw new Error(`Metadata request failed: ${response.status}`);
			state.endpoints = [...(await response.json()).endpoints].sort((a, b) => `${a.category}.${a.name}`.localeCompare(`${b.category}.${b.name}`));
			state.filteredEndpoints = state.endpoints;
			state.activeEndpoint = findDeepLinkedEndpoint(state.endpoints) || state.endpoints[0] || null;
			populateFilters();
			renderEndpointList();
			renderActiveEndpoint();
			applyDeepLinkParams(state.activeEndpoint);
			renderLogs();
		};
		elements.searchInput.addEventListener("input", applyFilters);
		elements.methodFilter.addEventListener("change", applyFilters);
		elements.categoryFilter.addEventListener("change", applyFilters);
		elements.requestForm.addEventListener("submit", (event) => {
			submitRequest(event);
		});
		elements.requestForm.addEventListener("keydown", (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !elements.sendButton.disabled) {
				event.preventDefault();
				elements.requestForm.requestSubmit();
			}
		});
		elements.resetButton.addEventListener("click", resetActiveEndpoint);
		elements.copyUrlButton.addEventListener("click", () => {
			withCopyFeedback(elements.copyUrlButton, buildUrl());
		});
		elements.copyResponseButton.addEventListener("click", () => {
			withCopyFeedback(elements.copyResponseButton, elements.responseOutput.textContent || "");
		});
		elements.clearLogsButton.addEventListener("click", () => {
			state.logs = [];
			renderLogs();
		});
		loadMetadata().catch((error) => {
			elements.endpointCount.textContent = "接口加载失败";
			setResponse("加载失败", error instanceof Error ? error.message : String(error), "error");
		});
	};
	//#endregion
	//#region src/explorer/explorerBootstrap.ts
	var startExplorerApp = () => {
		if (typeof document === "undefined") return;
		const requestForm = document.getElementById("request-form");
		const metadataPath = document.querySelector("script[data-metadata-path]")?.dataset.metadataPath;
		if (!requestForm || !metadataPath) return;
		initExplorerApp({ metadataPath });
	};
	if (typeof document !== "undefined") if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startExplorerApp, { once: true });
	else startExplorerApp();
	//#endregion
	exports.getDeepLinkParams = getDeepLinkParams;
	exports.initExplorerApp = initExplorerApp;
	exports.startExplorerApp = startExplorerApp;
})(this.QqMusicApiExplorer = this.QqMusicApiExplorer || {});
