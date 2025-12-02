# ✅ Vercel 设置检查清单

## 📋 当前设置检查

根据你的截图，需要修改以下设置：

---

## ❌ 需要修改的设置

### 1. Framework Preset（框架预设）

**当前**：`Other`  
**应该**：`Create React App`

**操作**：
1. 点击下拉菜单
2. 选择 `Create React App`

---

### 2. Root Directory（根目录）⚠️ **最重要！**

**当前**：`./`  
**应该**：`frontend`

**操作**：
1. 点击 "Edit" 按钮
2. 输入：`frontend`
3. 保存

**为什么重要**：如果不设置，Vercel 会在项目根目录查找 `package.json`，但我们的前端代码在 `frontend` 目录下。

---

### 3. Build Command（构建命令）

**当前**：开关关闭，使用默认值  
**应该**：打开开关，设置为 `npm run build`

**操作**：
1. 打开 Build Command 的开关（向右滑动）
2. 输入：`npm run build`
3. 保存

---

### 4. Output Directory（输出目录）

**当前**：开关关闭，使用默认值  
**应该**：打开开关，设置为 `build`

**操作**：
1. 打开 Output Directory 的开关（向右滑动）
2. 输入：`build`
3. 保存

---

### 5. Install Command（安装命令）

**当前**：开关关闭，使用默认值  
**可以保持**：`npm install`（默认值即可）

**操作**：
- 可以保持关闭，使用默认值 `npm install`

---

### 6. Environment Variables（环境变量）⚠️ **必须添加！**

**当前**：只有 `EXAMPLE_NAME`  
**应该**：添加 `REACT_APP_API_URL`

**操作**：
1. 删除 `EXAMPLE_NAME`（点击右侧的减号按钮）
2. 点击 "+ Add More" 按钮
3. 添加新变量：
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://web-production-3aff5.up.railway.app`
   - **Environment**: 全选（Production、Preview、Development）
4. 保存

---

## ✅ 正确的设置总结

| 设置项 | 值 |
|--------|-----|
| Framework Preset | `Create React App` |
| Root Directory | `frontend` |
| Build Command | `npm run build`（开关打开） |
| Output Directory | `build`（开关打开） |
| Install Command | `npm install`（可以保持默认） |
| Environment Variables | `REACT_APP_API_URL = https://web-production-3aff5.up.railway.app` |

---

## 🔧 修改步骤

1. **修改 Framework Preset**
   - 选择 `Create React App`

2. **修改 Root Directory**
   - 点击 "Edit"
   - 输入 `frontend`

3. **设置 Build Command**
   - 打开开关
   - 输入 `npm run build`

4. **设置 Output Directory**
   - 打开开关
   - 输入 `build`

5. **添加环境变量**
   - 删除 `EXAMPLE_NAME`
   - 添加 `REACT_APP_API_URL = https://web-production-3aff5.up.railway.app`

6. **保存并部署**
   - 点击 "Deploy" 或 "Save"

---

## ⚠️ 重要提示

1. **Root Directory 必须设置为 `frontend`**，否则 Vercel 找不到前端代码
2. **必须添加 `REACT_APP_API_URL` 环境变量**，否则前端无法连接到后端
3. **确保环境变量的值没有末尾斜杠** `/`

---

修改完成后，重新部署应该就能成功了！🚀




