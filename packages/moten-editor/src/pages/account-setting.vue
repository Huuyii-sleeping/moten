<template>
  <div class="account-settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <p>管理你的个人信息、安全设置和偏好选项</p>
    </div>

    <!-- 主要内容区 -->
    <div class="settings-container">
      <!-- 左侧导航 -->
      <div class="settings-sidebar">
        <el-menu :default-active="activeTab" class="sidebar-menu" @select="handleTabChange">
          <el-menu-item index="basic">
            <el-icon slot="icon"><User /></el-icon>
            <span slot="title">基本信息</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon slot="icon"><Lock /></el-icon>
            <span slot="title">安全设置</span>
          </el-menu-item>
          <el-menu-item index="preference">
            <el-icon slot="icon"><Setting /></el-icon>
            <span slot="title">偏好设置</span>
          </el-menu-item>
          <el-menu-item index="account">
            <el-icon slot="icon"><Delete /></el-icon>
            <span slot="title">账户管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容 -->
      <div class="settings-content">
        <!-- 基本信息 -->
        <div v-if="activeTab === 'basic'" class="settings-card">
          <h2 class="card-title">基本信息</h2>
          <p class="card-desc">修改你的个人资料，这些信息会在个人主页展示</p>

          <el-form :model="basicForm" label-width="100px" class="settings-form">
            <!-- 头像上传 -->
            <el-form-item label="头像">
              <div class="avatar-upload">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <img v-if="basicForm.avatar" :src="basicForm.avatar" class="avatar-img" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <p class="avatar-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
              </div>
            </el-form-item>

            <el-form-item label="用户名">
              <el-input v-model="basicForm.username" placeholder="请输入用户名" disabled />
              <p class="form-tip">用户名一旦设置无法修改</p>
            </el-form-item>

            <el-form-item label="昵称">
              <el-input v-model="basicForm.nickname" placeholder="请输入昵称" maxLength="20" />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="basicForm.email" placeholder="请输入邮箱" type="email" />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="basicForm.phone" placeholder="请输入手机号" type="tel" />
            </el-form-item>

            <el-form-item label="个人简介">
              <el-input
                v-model="basicForm.intro"
                placeholder="请输入个人简介"
                type="textarea"
                :rows="3"
                maxLength="100"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 安全设置 -->
        <div v-if="activeTab === 'security'" class="settings-card">
          <h2 class="card-title">安全设置</h2>
          <p class="card-desc">保护你的账户安全，定期更新密码和验证信息</p>

          <el-form :model="securityForm" label-width="120px" class="settings-form">
            <el-form-item label="密码修改">
              <div class="password-group">
                <el-input
                  v-model="securityForm.oldPassword"
                  placeholder="请输入旧密码"
                  type="password"
                />
                <el-input
                  v-model="securityForm.newPassword"
                  placeholder="请输入新密码"
                  type="password"
                  class="mt-2"
                />
                <el-input
                  v-model="securityForm.confirmPassword"
                  placeholder="请确认新密码"
                  type="password"
                  class="mt-2"
                />
              </div>
              <p class="form-tip">密码长度至少 8 位，包含字母和数字</p>
            </el-form-item>

            <el-form-item label="手机号绑定">
              <div class="bind-item">
                <span class="bind-value">{{ basicForm.phone }}</span>
                <el-button type="text" @click="handleBind('phone')">更换绑定</el-button>
              </div>
              <p class="form-tip">已验证 · 用于登录和安全验证</p>
            </el-form-item>

            <el-form-item label="邮箱绑定">
              <div class="bind-item">
                <span class="bind-value">{{ basicForm.email }}</span>
                <el-button type="text" @click="handleBind('email')">更换绑定</el-button>
              </div>
              <p class="form-tip">已验证 · 用于接收通知和找回密码</p>
            </el-form-item>

            <el-form-item label="登录验证">
              <el-switch
                v-model="securityForm.loginVerify"
                active-text="开启"
                inactive-text="关闭"
              />
              <p class="form-tip">开启后，新设备登录需验证手机号</p>
            </el-form-item>
          </el-form>
        </div>

        <!-- 偏好设置 -->
        <div v-if="activeTab === 'preference'" class="settings-card">
          <h2 class="card-title">偏好设置</h2>
          <p class="card-desc">自定义你的使用体验</p>

          <el-form :model="preferenceForm" label-width="120px" class="settings-form">
            <el-form-item label="主题模式">
              <el-radio-group v-model="preferenceForm.theme">
                <el-radio label="light">浅色主题</el-radio>
                <el-radio label="dark">深色主题</el-radio>
                <el-radio label="auto">跟随系统</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="通知设置">
              <el-checkbox-group v-model="preferenceForm.notifications">
                <el-checkbox label="system">系统通知</el-checkbox>
                <el-checkbox label="activity">活动通知</el-checkbox>
                <el-checkbox label="marketing">营销通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="语言设置">
              <el-select v-model="preferenceForm.language" placeholder="请选择语言">
                <el-option label="简体中文" value="zh-CN"></el-option>
                <el-option label="English" value="en-US"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="默认页面">
              <el-select v-model="preferenceForm.defaultPage" placeholder="请选择默认页面">
                <el-option label="首页" value="home"></el-option>
                <el-option label="个人中心" value="profile"></el-option>
                <el-option label="消息中心" value="message"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 账户管理 -->
        <div v-if="activeTab === 'account'" class="settings-card">
          <h2 class="card-title">账户管理</h2>
          <p class="card-desc">管理你的账户状态和数据</p>

          <div class="account-management">
            <div class="account-info">
              <h3>账户状态</h3>
              <p class="status normal">正常</p>
              <p class="account-time">注册时间：2024-01-15</p>
              <p class="account-time">最后登录：2025-02-20 14:35</p>
            </div>

            <div class="account-actions">
              <el-button type="danger" class="action-btn" @click="handleDeleteAccount">
                注销账户
              </el-button>
              <p class="action-tip">
                <el-icon class="warning-icon"><Warning /></el-icon>
                注销账户后，所有数据将永久删除，无法恢复
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="settings-footer">
      <el-button type="default" @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSave">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Lock, Setting, Delete, Warning } from '@element-plus/icons-vue'
import {
  ElMenu,
  ElMenuItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElUpload,
  ElSwitch,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElButton,
  ElMessageBox,
  ElMessage,
} from 'element-plus'

// 激活的标签页
const activeTab = ref('basic')

// 基本信息表单数据（固定占位）
const basicForm = ref({
  username: 'user123456', // 不可修改
  nickname: '星辰大海',
  email: 'user@example.com',
  phone: '138****6789',
  avatar: 'https://picsum.photos/id/64/200/200', // 占位头像
  intro: '热爱生活，喜欢探索新事物～',
})

// 安全设置表单数据（固定占位）
const securityForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  loginVerify: true, // 默认开启登录验证
})

// 偏好设置表单数据（固定占位）
const preferenceForm = ref({
  theme: 'light', // 浅色主题
  notifications: ['system', 'activity'], // 开启系统和活动通知
  language: 'zh-CN', // 简体中文
  defaultPage: 'home', // 默认首页
})

// 切换标签页
const handleTabChange = (tabIndex: string) => {
  activeTab.value = tabIndex
}

// 头像上传前校验
const beforeAvatarUpload = (rawFile: File) => {
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件！')
    return false
  }
  const isLt2M = rawFile.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  // 这里只是模拟，实际项目中需要对接上传接口
  return true
}

// 绑定/更换手机号/邮箱
const handleBind = (type: 'phone' | 'email') => {
  const title = type === 'phone' ? '更换手机号' : '更换邮箱'
  ElMessageBox.prompt(`请输入新的${type === 'phone' ? '手机号' : '邮箱'}`, title, {
    inputType: type === 'phone' ? 'tel' : 'email',
    confirmButtonText: '下一步',
    cancelButtonText: '取消',
  }).then(({ value }) => {
    // 模拟验证流程
    ElMessage.success(`${title}申请已提交，请等待验证`)
  })
}

// 注销账户
const handleDeleteAccount = () => {
  ElMessageBox.confirm('确定要注销账户吗？注销后将无法登录', '确认注销', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('账户已暂时注销')
  })
}

// 重置表单
const handleReset = () => {
  // 重置为初始固定数据
  basicForm.value = {
    username: 'user123456',
    nickname: '星辰大海',
    email: 'user@example.com',
    phone: '138****6789',
    avatar: 'https://picsum.photos/id/64/200/200',
    intro: '热爱生活，喜欢探索新事物～',
  }
  securityForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    loginVerify: true,
  }
  preferenceForm.value = {
    theme: 'light',
    notifications: ['system', 'activity'],
    language: 'zh-CN',
    defaultPage: 'home',
  }
  ElMessage.success('已重置为默认设置')
}

// 保存设置
const handleSave = () => {
  // 模拟保存接口请求
  ElMessage.success('设置保存成功！')
}
</script>

<style scoped lang="scss">
.account-settings-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f9fafb;
  min-height: calc(100vh - 40px);

  .page-header {
    margin-top: -30px;
    margin-bottom: 30px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .settings-container {
    display: flex;
    gap: 24px;
  }

  .settings-sidebar {
    width: 220px;
    flex-shrink: 0;
  }

  .sidebar-menu {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .el-menu-item {
      height: 52px;
      line-height: 52px;
      font-size: 14px;

      &.is-active {
        background-color: #f0f7ff;
        color: #1989fa;

        .el-icon {
          color: #1989fa;
        }
      }
    }

    .el-icon {
      font-size: 18px;
      margin-right: 8px;
    }
  }

  .settings-content {
    flex: 1;
  }

  .settings-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
    }

    .card-desc {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 13px;
    }
  }

  .settings-form {
    .el-form-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-tip {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: #999;
    }
  }

  // 头像上传样式
  .avatar-upload {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar-uploader {
      border: 1px dashed #dcdcdc;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9f9f9;

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-uploader-icon {
        font-size: 24px;
        color: #8c939d;
      }
    }

    .avatar-tip {
      font-size: 12px;
      color: #999;
      margin: 0;
    }
  }

  // 密码组样式
  .password-group {
    display: flex;
    flex-direction: column;
  }

  // 绑定项样式
  .bind-item {
    display: flex;
    align-items: center;
    gap: 16px;

    .bind-value {
      font-size: 14px;
      color: #333;
    }

    .el-button {
      color: #1989fa;
      padding: 0;
      height: auto;
    }
  }

  // 账户管理样式
  .account-management {
    padding: 16px 0;

    .account-info {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }

      .status {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 13px;
        margin-bottom: 12px;
      }

      .status.normal {
        background-color: #f0f9eb;
        color: #52c41a;
      }

      .account-time {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #666;
      }
    }

    .account-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .action-btn {
        width: 200px;
        justify-content: center;
      }

      .action-tip {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #999;
        margin: 8px 0 0 0;

        .warning-icon {
          color: #faad14;
          font-size: 14px;
        }
      }
    }
  }

  // 底部按钮样式
  .settings-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      min-width: 100px;
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    .settings-container {
      flex-direction: column;
    }

    .settings-sidebar {
      width: 100%;
      margin-bottom: 16px;
    }

    .settings-card {
      padding: 16px;
    }

    .avatar-upload {
      flex-direction: column;
      align-items: flex-start;
    }

    .account-actions .action-btn {
      width: 100%;
    }

    .settings-footer {
      flex-direction: column;
    }
  }
}
</style>
