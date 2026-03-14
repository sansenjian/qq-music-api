// 获取 QQ 用户头像
export const getUserAvatar = async (params: {
  k?: string;
  uin?: string;
  size?: number;
}) => {
  const { k, uin, size = 140 } = params;
  
  // 如果提供了 k 参数，使用 k 参数获取头像
  if (k) {
    const url = `https://thirdqq.qlogo.cn/g?b=sdk&k=${k}&s=${size}`;
    
    return {
      avatarUrl: url,
      message: '头像 URL 获取成功'
    };
  }
  
  // 如果提供了 uin，尝试从 uin 获取头像
  if (uin) {
    const url = `https://q.qlogo.cn/headimg_dl?dst_uin=${uin}&spec=${size}`;
    
    return {
      avatarUrl: url,
      message: '头像 URL 获取成功'
    };
  }
  
  throw new Error('缺少 k 或 uin 参数');
};
