# 第一阶段：用 Node 22 构建前端产物
FROM node:22-alpine AS builder
# 设置工作目录（容器内的目录，随便起，比如 /app）
WORKDIR /app
# 复制根目录的 PNPM 配置（因为用了 Workspace）
COPY ../../package.json ../../pnpm-lock.yaml ./
# 复制当前前端包的 package.json
COPY package.json ./packages/moten-editor/
# 安装 PNPM（Node 22 兼容最新版）
RUN npm install -g pnpm
# 安装依赖（--frozen-lockfile 确保依赖版本和本地一致）
RUN pnpm install --frozen-lockfile
# 复制所有项目代码到容器（忽略 .dockerignore 里的文件）
COPY ../../ .
# 构建前端（进入前端目录执行 build 命令）
RUN cd packages/moten-editor && pnpm build


# 第二阶段：用 Nginx 托管静态文件（轻量、高效）
FROM nginx:alpine
# 从构建阶段复制 dist 文件夹到 Nginx 静态目录
COPY --from=builder /app/packages/moten-editor/dist /usr/share/nginx/html
# 复制自定义 Nginx 配置（解决 Vue 路由刷新 404 问题）
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露 80 端口（Nginx 默认端口）
EXPOSE 80
# 启动 Nginx（前台运行，否则容器会退出）
CMD ["nginx", "-g", "daemon off;"]