<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 品牌Logo和标题 -->
      <div class="login-header">
        <div class="logo">
          <i class="el-icon-lock"></i>
        </div>
        <h2>账户登录</h2>
        <p>请输入您的账户信息登录系统</p>
      </div>

      <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto" class="login-form">
        <el-form-item label="账户名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入用户名"
            prefix-icon="User"
            :class="{ 'input-focus': focusState.name }"
            @focus="focusState.name = true"
            @blur="focusState.name = false"
          ></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="off"
            placeholder="请输入密码"
            prefix-icon="Lock"
            :show-password="showPassword"
            :class="{ 'input-focus': focusState.password }"
            @focus="focusState.password = true"
            @blur="focusState.password = false"
          ></el-input>
        </el-form-item>

        <el-form-item class="form-actions">
          <el-checkbox v-model="form.remember" class="remember-me"> 记住密码 </el-checkbox>
          <el-link
            type="primary"
            :underline="false"
            class="forgot-password"
            @click="handleForgotPassword"
          >
            忘记密码?
          </el-link>
        </el-form-item>

        <el-form-item>
          <el-button
            class="submit-btn"
            type="primary"
            @click="submitForm(ruleFormRef)"
            :loading="isLoading"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 分隔线 -->
        <div class="divider">
          <span>其他登录方式</span>
        </div>

        <!-- 第三方登录 -->
        <div class="social-login">
          <el-button
            icon="Wechat"
            circle
            class="social-btn wechat"
            @click="handleSocialLogin('wechat')"
          ></el-button>
          <el-button
            icon="Github"
            circle
            class="social-btn github"
            @click="handleSocialLogin('github')"
          ></el-button>
          <el-button
            icon="Mail"
            circle
            class="social-btn email"
            @click="handleSocialLogin('email')"
          ></el-button>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号?
          <el-link type="primary" :underline="false" @click="handleRegister"> 立即注册 </el-link>
        </div>
      </el-form>
    </div>

    <!-- 页脚信息 -->
    <div class="login-footer">
      <p>© 2023 系统名称 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userLoginAsync } from '@/api/user'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { md5 } from '@/utils'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isLoading = ref(false) // 登录按钮加载状态
const showPassword = ref(false) // 控制密码可见性

const form = reactive({
  name: '',
  password: '',
  remember: false, // 记住密码
})
const router = useRouter()
// 输入框聚焦状态管理
const focusState = reactive({
  name: false,
  password: false,
})

const ruleFormRef = ref<FormInstance>()

const rules = reactive({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 20, message: '长度最小是6,最大是20', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 32, message: '长度最小是8,最大是32', trigger: 'blur' },
  ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  isLoading.value = true // 开始加载

  try {
    await formEl.validate(async (valid, fields) => {
      if (!valid) {
        console.log('error submit!', fields)
        return
      }

      const params = {
        username: form.name,
        password: md5(form.password),
      }
      const { status, data, message } = await userLoginAsync(params)
      if (status) {
        ElMessage({
          message: '登录成功',
          type: 'success',
        })
        const { role_id, token, refreshToken } = data
        userStore.setRole(role_id)
        userStore.setToken(token)
        userStore.setRefreshToken(refreshToken)


        router.push('/')
      } else {
        ElMessage({
          message: '登录失败: ' + message,
          type: 'error',
        })
      }
    })
  } catch (error) {
    console.error('登录异常:', error)
    ElMessage({
      message: '登录过程中出现错误',
      type: 'error',
    })
  } finally {
    isLoading.value = false // 结束加载
  }
}

// 忘记密码处理
const handleForgotPassword = () => {
  ElMessageBox.alert('请联系管理员重置密码或通过注册邮箱找回', '忘记密码', {
    confirmButtonText: '确定',
  })
}

// 第三方登录处理
const handleSocialLogin = (type: string) => {
  ElMessage({
    message: `暂未开放${type}登录方式`,
    type: 'info',
  })
}

// 注册处理
const handleRegister = () => {
  router.push('/register') // 假设注册页路由为/register
}

// 页面加载时，如果有记住的账号，可以在这里读取并填充
// 示例:
// onMounted(() => {
//   const savedUser = localStorage.getItem('savedUser')
//   if (savedUser) {
//     form.name = savedUser
//     form.remember = true
//   }
// })
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  background-color: #f5f7fa;

  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(146, 168, 209, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(146, 168, 209, 0.1) 0%, transparent 40%);
    z-index: 0;
  }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 30px 40px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #fff, #1890ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }

  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #1f2329;
    margin-bottom: 8px;
  }

  p {
    color: #86909c;
    font-size: 14px;
  }
}

.login-form {
  width: 100%;

  .el-form-item {
    margin-bottom: 20px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .el-input {
    height: 44px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &.input-focus {
      border-color: #4096ff;
      box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
    }

    .el-input__wrapper {
      height: 100%;
      border-radius: 8px;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;

  .remember-me {
    color: #4e5969;
    font-size: 14px;
  }

  .forgot-password {
    margin-left: 20px;
    font-size: 14px;
    color: #4096ff;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4096ff, #1890ff);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #3688f0, #0e80e0);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e5e6eb;
  }

  span {
    padding: 0 15px;
    font-size: 13px;
    color: #86909c;
  }
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;

  .social-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }

  .wechat {
    color: #07c160;
    border-color: #07c160;

    &:hover {
      background-color: rgba(7, 193, 96, 0.1);
    }
  }

  .github {
    color: #333;
    border-color: #333;

    &:hover {
      background-color: rgba(51, 51, 51, 0.1);
    }
  }

  .email {
    color: #ff7d00;
    border-color: #ff7d00;

    &:hover {
      background-color: rgba(255, 125, 0, 0.1);
    }
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #4e5969;

  .el-link {
    color: #4096ff;
    margin-left: 4px;
  }
}

.login-footer {
  margin-top: 30px;
  color: #86909c;
  font-size: 12px;
  text-align: center;
  position: relative;
  z-index: 1;
}

// 响应式调整
@media (max-width: 768px) {
  .login-card {
    padding: 25px 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .login-header {
    margin-bottom: 25px;

    .logo {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
  }
}
</style>
