<template>
    <div class="container">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto" style="max-width: 600px">
            <el-form-item label="账户名" prop="name">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" type="password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="passwordConfirm">
                <el-input v-model="form.passwordConfirm" type="password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label=" ">
                <el-button class="submit" type="primary" @click="submitForm(ruleFormRef)">
                    创建账户
                </el-button>
            </el-form-item>

        </el-form>
    </div>

</template>

<script setup lang="ts">
import { userRegisterAsync } from '@/api/user'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { md5 } from '@/utils'
import router from '@/router'

const form = reactive({
    name: '',
    password: '',
    passwordConfirm: '',
})

const ruleFormRef = ref<FormInstance>()

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
        { validator: validatePass, trigger: 'blur' }
    ],
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
        const { status, message } = await userRegisterAsync(params)
        if (status) {
            ElMessage({
                message: '注册成功',
                type: "success"
            })
            router.push('/login')
        } else {
            ElMessage({
                message: "注册失败" + message,
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
