import type { ApiFunction, ApiOptions, ApiResponse } from '../../../types/api';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import { getGtk, getGuid } from '../../../util/loginUtils';

interface LoginSession {
  loginUin: string;
  uin: string;
  cookie: string;
  cookieList: string[];
  cookieObject: Record<string, string>;
}

const REQUEST_TIMEOUT_MS = 10000;
const DEBUG_ENABLED = process.env.DEBUG === 'true';

const debugLog = (message: string, payload?: unknown) => {
  if (DEBUG_ENABLED) {
    console.log(`[checkQQLoginQr] ${message}`, payload ?? '');
  }
};

const parseSetCookie = (setCookieHeader: string | null): string[] => {
  if (!setCookieHeader) return [];
  const cookies: string[] = [];
  const parts = setCookieHeader.split(/,(?=\s*[a-zA-Z_]+=)/);
  for (const part of parts) {
    const cookiePair = part.split(';')[0].trim();
    if (cookiePair && cookiePair.includes('=') && cookiePair.split('=')[1]) {
      cookies.push(cookiePair);
    }
  }
  return cookies;
};

const fetchWithTimeout = async (input: string, init: RequestInit = {}, timeout = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
};

const buildLoginSession = (cookie: string): LoginSession => {
  const cookieList = cookie
    .split(';')
    .map(item => item.trim())
    .filter(Boolean);

  const cookieObject: Record<string, string> = {};
  cookieList.forEach(item => {
    const [key, value = ''] = item.split('=');
    if (key && value) {
      cookieObject[key] = value;
    }
  });

  const loginUin = cookieObject.uin || '';

  return {
    loginUin,
    uin: loginUin,
    cookie,
    cookieList,
    cookieObject
  };
};

const checkQQLoginQr: ApiFunction = async ({ method = 'get', params = {}, option = {} }: ApiOptions): Promise<ApiResponse> => {
  const { ptqrtoken, qrsig } = params;
  if (!ptqrtoken || !qrsig) {
    return errorResponse('参数错误', 400);
  }

  try {
    const url = `https://ssl.ptlogin2.qq.com/ptqrlogin?u1=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump&ptqrtoken=${ptqrtoken}&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-1711022193435&js_ver=23111510&js_type=1&login_sig=du-YS1h8*0GqVqcrru0pXkpwVg2DYw-DtbFulJ62IgPf6vfiJe*4ONVrYc5hMUNE&pt_uistyle=40&aid=716027609&daid=383&pt_3rd_aid=100497308&&o1vId=3674fc47871e9c407d8838690b355408&pt_js_version=v1.48.1`;

    const response = await fetchWithTimeout(url, { headers: { Cookie: `qrsig=${qrsig}` } });
    const data = (await response.text()) || '';

    const cookieMap = new Map<string, string>();
    const setCookie = (setCookieHeader: string | null) => {
      const cookies = parseSetCookie(setCookieHeader);
      for (const cookie of cookies) {
        const [name] = cookie.split('=');
        cookieMap.set(name, cookie);
      }
    };

    setCookie(response.headers.get('Set-Cookie'));

    const refresh = data.includes('已失效');
    if (!data.includes('登录成功')) {
      return customResponse(
        {
          isOk: false,
          refresh,
          message: (refresh && '二维码已失效') || '未扫描二维码'
        },
        200
      );
    }

    const allCookie = () => Array.from(cookieMap.values());

    const urlMatch = data.match(/(?:'((?:https?|ftp):\/\/[^\s/$.?#].[^\s]*)')/g);
    if (!urlMatch || !urlMatch[0]) {
      return errorResponse('Failed to extract checkSigUrl from response', 502);
    }
    const checkSigUrl = urlMatch[0].replace(/'/g, '');
    const checkSigRes = await fetchWithTimeout(checkSigUrl, {
      redirect: 'manual',
      headers: { Cookie: allCookie().join('; ') }
    });

    const checkSigCookie = checkSigRes.headers.get('Set-Cookie');
    const pSkeyMatch = checkSigCookie?.match(/p_skey=([^;]+)/);
    if (!pSkeyMatch || !pSkeyMatch[1]) {
      return errorResponse('Failed to extract p_skey from response', 502);
    }
    const p_skey = pSkeyMatch[1];
    const gtk = getGtk(p_skey);
    setCookie(checkSigCookie);

    const authorizeUrl = 'https://graph.qq.com/oauth2.0/authorize';

    const getAuthorizeData = (g_tk: number) => {
      const data = new FormData();
      data.append('response_type', 'code');
      data.append('client_id', '100497308');
      data.append('redirect_uri', 'https://y.qq.com/portal/wx_redirect.html?login_type=1&surl=https://y.qq.com/');
      data.append('scope', 'get_user_info,get_app_friends');
      data.append('state', 'state');
      data.append('switch', '');
      data.append('from_ptlogin', '1');
      data.append('src', '1');
      data.append('update_auth', '1');
      data.append('openapi', '1010_1030');
      data.append('g_tk', g_tk.toString());
      data.append('auth_time', new Date().toString());
      data.append('ui', getGuid());
      return data;
    };

    const authorizeRes = await fetchWithTimeout(authorizeUrl, {
      redirect: 'manual',
      method: 'POST',
      body: getAuthorizeData(gtk),
      headers: {
        Cookie: allCookie().join('; ')
      }
    });
    setCookie(authorizeRes.headers.get('Set-Cookie'));

    const location = authorizeRes.headers.get('Location');
    const contentType = authorizeRes.headers.get('Content-Type');

    debugLog('authorize response meta', {
      status: authorizeRes.status,
      redirected: authorizeRes.redirected,
      hasLocation: Boolean(location),
      contentType
    });

    if (authorizeRes.status < 300 || authorizeRes.status >= 400 || !location) {
      return errorResponse('授权响应异常，未返回跳转地址', 502);
    }

    const codeMatch = location.match(/[?&]code=([^&]+)/);
    if (!codeMatch || !codeMatch[1]) {
      debugLog('authorize location parse failed', { location });
      return errorResponse('授权响应中未找到 code 参数', 502);
    }
    const code = codeMatch[1];

    const getFcgReqData = (g_tk: number, code: string) => {
      const data = {
        comm: {
          g_tk,
          platform: 'yqq',
          ct: 24,
          cv: 0
        },
        req: {
          module: 'QQConnectLogin.LoginServer',
          method: 'QQLogin',
          param: {
            code
          }
        }
      };
      return JSON.stringify(data);
    };

    const loginUrl = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
    const loginRes = await fetchWithTimeout(loginUrl, {
      method: 'POST',
      body: getFcgReqData(gtk, code),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: allCookie().join('; ')
      }
    });
    setCookie(loginRes.headers.get('Set-Cookie'));

    const sessionCookie = allCookie().join('; ');

    return customResponse(
      {
        isOk: true,
        message: '登录成功',
        session: buildLoginSession(sessionCookie)
      },
      200
    );
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return errorResponse('登录检查超时', 504);
    }

    return errorResponse('登录检查失败', 502);
  }
};

export default checkQQLoginQr;
