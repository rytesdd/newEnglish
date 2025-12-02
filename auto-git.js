#!/usr/bin/env node

/**
 * 自动 Git 提交脚本
 * 每 10 分钟自动检查并提交代码更改
 */

const { execSync } = require('child_process');
const path = require('path');

const GIT_INTERVAL = 10 * 60 * 1000; // 10 分钟（毫秒）
const REPO_PATH = __dirname;

console.log('🚀 自动 Git 提交服务已启动');
console.log(`📁 仓库路径: ${REPO_PATH}`);
console.log(`⏰ 检查间隔: ${GIT_INTERVAL / 1000 / 60} 分钟`);
console.log('💡 按 Ctrl+C 停止服务\n');

// 执行 Git 命令的辅助函数
function execGitCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: REPO_PATH,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 检查是否有未提交的更改
function hasChanges() {
  const statusResult = execGitCommand('git status --porcelain', { silent: true });
  if (!statusResult.success) {
    return false;
  }
  return statusResult.output.trim().length > 0;
}

// 执行 Git 提交和推送
async function autoCommit() {
  try {
    // 检查是否有更改
    if (!hasChanges()) {
      const now = new Date().toLocaleString('zh-CN');
      console.log(`[${now}] ✓ 没有需要提交的更改`);
      return;
    }

    const now = new Date().toLocaleString('zh-CN');
    console.log(`[${now}] 📝 检测到代码更改，开始提交...`);

    // 添加所有更改
    const addResult = execGitCommand('git add .');
    if (!addResult.success) {
      console.error('❌ 添加文件失败:', addResult.error);
      return;
    }

    // 生成提交信息
    const commitMessage = `chore: 自动提交 - ${new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}`;

    // 提交更改
    const commitResult = execGitCommand(`git commit -m "${commitMessage}"`);
    if (!commitResult.success) {
      // 可能是没有实际更改或提交信息为空
      if (commitResult.error.includes('nothing to commit')) {
        console.log(`[${now}] ℹ️  没有需要提交的内容`);
        return;
      }
      console.error('❌ 提交失败:', commitResult.error);
      return;
    }

    // 推送到远程仓库
    const pushResult = execGitCommand('git push origin main');
    if (!pushResult.success) {
      console.error('❌ 推送失败:', pushResult.error);
      return;
    }

    console.log(`[${now}] ✅ 代码已成功提交并推送到 GitHub\n`);
  } catch (error) {
    console.error('❌ 自动提交过程中发生错误:', error.message);
  }
}

// 立即执行一次
autoCommit();

// 设置定时器，每10分钟执行一次
const intervalId = setInterval(autoCommit, GIT_INTERVAL);

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n🛑 正在停止自动 Git 提交服务...');
  clearInterval(intervalId);
  console.log('✅ 服务已停止');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 正在停止自动 Git 提交服务...');
  clearInterval(intervalId);
  console.log('✅ 服务已停止');
  process.exit(0);
});






