<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration"></div>

    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- 品牌Logo和标题 -->
      <div class="register-header">
        <div class="logo">
          <i class="el-icon-user-plus"></i>
        </div>
        <h2>创建账户</h2>
        <p>填写以下信息完成注册</p>
      </div>

      <el-form
        ref="ruleFormRef"
        :model="form"
        :rules="rules"
        label-width="auto"
        class="register-form"
      >
        <el-form-item label="账户名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请设置6-20位用户名"
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
            placeholder="请设置8-32位密码"
            prefix-icon="Lock"
            :show-password="showPassword"
            :class="{ 'input-focus': focusState.password }"
            @focus="focusState.password = true"
            @blur="focusState.password = false"
          ></el-input>
          <div class="password-hint" v-if="focusState.password || form.password">
            <p class="hint-text">
              密码强度: <span :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
            </p>
            <div class="strength-meter">
              <div
                class="strength-bar"
                :style="{ width: passwordStrength + '%', backgroundColor: passwordStrengthColor }"
              ></div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="passwordConfirm">
          <el-input
            v-model="form.passwordConfirm"
            type="password"
            autocomplete="off"
            placeholder="请再次输入密码"
            prefix-icon="Check"
            :show-password="showConfirmPassword"
            :class="{ 'input-focus': focusState.passwordConfirm }"
            @focus="focusState.passwordConfirm = true"
            @blur="focusState.passwordConfirm = false"
            @input="checkPasswordMatch"
          ></el-input>
          <p
            v-if="focusState.passwordConfirm && form.password && form.passwordConfirm"
            class="match-hint"
            :class="passwordMatch ? 'match' : 'not-match'"
          >
            <i :class="passwordMatch ? 'el-icon-check' : 'el-icon-close'"></i>
            {{ passwordMatch ? '密码一致' : '两次输入的密码不一致' }}
          </p>
        </el-form-item>

        <el-form-item>
          <el-button
            class="submit-btn"
            type="primary"
            @click="submitForm(ruleFormRef)"
            :loading="isLoading"
          >
            创建账户
          </el-button>
        </el-form-item>

        <!-- 已有账号链接 -->
        <div class="login-link">
          已有账号?
          <el-link type="primary" :underline="false" @click="goToLogin"> 立即登录 </el-link>
        </div>
      </el-form>
    </div>

    <!-- 页脚信息 -->
    <div class="register-footer">
      <p>
        点击"创建账户"，即表示您同意我们的<a href="#" class="terms-link">服务条款</a>和<a
          href="#"
          class="privacy-link"
          >隐私政策</a
        >
      </p>
      <p>© 2023 系统名称 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userRegisterAsync } from '@/api/user'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref, computed, watch } from 'vue'
import { md5 } from '@/utils'
import router from '@/router'

const form = reactive({
  name: '',
  password: '',
  passwordConfirm: '',
})

const isLoading = ref(false) // 提交按钮加载状态
const showPassword = ref(false) // 控制密码可见性
const showConfirmPassword = ref(false) // 控制确认密码可见性
const passwordMatch = ref<boolean | null>(null) // 密码匹配状态

// 输入框聚焦状态管理
const focusState = reactive({
  name: false,
  password: false,
  passwordConfirm: false,
})

const ruleFormRef = ref<FormInstance>()

// 验证密码一致性
const validatePass = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 20, message: '长度最小是6,最大是20', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 32, message: '长度最小是8,最大是32', trigger: 'blur' },
  ],
  passwordConfirm: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { min: 8, max: 32, message: '长度最小是8,最大是32', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' },
  ],
})

// 检查密码匹配
const checkPasswordMatch = () => {
  if (form.password && form.passwordConfirm) {
    passwordMatch.value = form.password === form.passwordConfirm
  } else {
    passwordMatch.value = null
  }
}

// 密码强度检测
const passwordStrength = computed(() => {
  if (form.password.length < 8) return 0

  let strength = 0
  // 长度加分
  if (form.password.length >= 12) strength += 25
  else if (form.password.length >= 8) strength += 10

  // 包含小写字母
  if (/[a-z]/.test(form.password)) strength += 25
  // 包含大写字母
  if (/[A-Z]/.test(form.password)) strength += 25
  // 包含数字
  if (/[0-9]/.test(form.password)) strength += 15
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(form.password)) strength += 20

  return Math.min(strength, 100)
})

// 密码强度文本
const passwordStrengthText = computed(() => {
  if (form.password.length === 0) return '未设置'
  if (form.password.length < 8) return '太短'

  const strength = passwordStrength.value
  if (strength < 40) return '弱'
  if (strength < 70) return '中'
  return '强'
})

// 密码强度样式类
const passwordStrengthClass = computed(() => {
  if (form.password.length === 0) return 'neutral'
  if (form.password.length < 8) return 'weak'

  const strength = passwordStrength.value
  if (strength < 40) return 'weak'
  if (strength < 70) return 'medium'
  return 'strong'
})

// 密码强度颜色
const passwordStrengthColor = computed(() => {
  if (form.password.length === 0) return '#ccc'
  if (form.password.length < 8) return '#ff4d4f'

  const strength = passwordStrength.value
  if (strength < 40) return '#ff4d4f'
  if (strength < 70) return '#faad14'
  return '#52c41a'
})

// 监听密码变化，更新匹配状态
watch(() => form.password, checkPasswordMatch)

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
      const { status, message } = await userRegisterAsync(params)
      if (status) {
        ElMessage({
          message: '注册成功',
          type: 'success',
        })
        router.push('/login')
      } else {
        ElMessage({
          message: '注册失败: ' + message,
          type: 'error',
        })
      }
    })
  } catch (error) {
    console.error('注册异常:', error)
    ElMessage({
      message: '注册过程中出现错误',
      type: 'error',
    })
  } finally {
    isLoading.value = false // 结束加载
  }
}

// 前往登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.register-page {
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
      radial-gradient(circle at 70% 30%, rgba(146, 168, 209, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 20% 80%, rgba(146, 168, 209, 0.1) 0%, transparent 40%);
    z-index: 0;
  }
}

.register-card {
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

.register-header {
  text-align: center;
  margin-bottom: 30px;

  .logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #52c41a, #13c2c2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(19, 194, 194, 0.3);
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

.register-form {
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
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
    }

    .el-input__wrapper {
      height: 100%;
      border-radius: 8px;
    }
  }

  .password-hint {
    margin-top: 8px;

    .hint-text {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;

      span {
        &.neutral {
          color: #86909c;
        }
        &.weak {
          color: #ff4d4f;
        }
        &.medium {
          color: #faad14;
        }
        &.strong {
          color: #52c41a;
        }
      }
    }

    .strength-meter {
      height: 4px;
      width: 100%;
      background-color: #f0f2f5;
      border-radius: 2px;
      overflow: hidden;

      .strength-bar {
        height: 100%;
        transition:
          width 0.3s ease,
          background-color 0.3s ease;
      }
    }
  }

  .match-hint {
    margin-top: 8px;
    font-size: 12px;

    &.match {
      color: #52c41a;
    }

    &.not-match {
      color: #ff4d4f;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #52c41a, #13c2c2);
  border: none;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: linear-gradient(135deg, #47b810, #0db8b8);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(19, 194, 194, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #4e5969;
  margin-top: 20px;

  .el-link {
    color: #13c2c2;
    margin-left: 4px;
  }
}

.register-footer {
  margin-top: 30px;
  color: #86909c;
  font-size: 12px;
  text-align: center;
  position: relative;
  z-index: 1;
  line-height: 1.8;

  .terms-link,
  .privacy-link {
    color: #13c2c2;
    text-decoration: underline;
    margin: 0 4px;

    &:hover {
      color: #0db8b8;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .register-card {
    padding: 25px 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .register-header {
    margin-bottom: 25px;

    .logo {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
  }
}
</style>
