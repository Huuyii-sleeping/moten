<template>
    <div class="container">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto" style="max-width: 600px">
            <el-form-item label="账户名" prop="name">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" type="password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label=" ">
                <el-button class="submit" type="primary" @click="submitForm(ruleFormRef)">
                    登录
                </el-button>
            </el-form-item>

        </el-form>
    </div>

</template>

<script setup lang="ts">
import { userLoginAsync } from '@/api/user'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { md5 } from '@/utils'
import router from '@/router'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const form = reactive({
    name: '',
    password: '',
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
    ]
})
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (!valid) {
            console.log('error submit!', fields)
            return
        }

        const params = {
            username: form.name,
            password: md5(form.password)
        }
        const { status, data, message } = await userLoginAsync(params)
        if (status) {
            ElMessage({
                message: '登录成功',
                type: "success"
            })
            const { role_id, token } = data
            userStore.setRole(role_id)
            userStore.setToken(token)
            router.push('/')
        } else {
            ElMessage({
                message: "登录失败" + message,
                type: "error"
            })
        }
    })

}
</script>

<style scoped lang="scss">
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;

    .el-form {
        width: 400px;
    }
}

.submit {
    margin: 0 auto;
}
</style>
