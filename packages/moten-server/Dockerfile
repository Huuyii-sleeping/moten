# 用 Node 22 基础镜像（alpine 是轻量版本，体积小）
FROM node:22-alpine
# 设置工作目录
WORKDIR /app
# 复制根目录的 PNPM 配置
COPY ../../package.json ../../pnpm-lock.yaml ./
# 复制当前后端包的 package.json
COPY package.json ./packages/moten-server/
# 安装 PNPM
RUN npm install -g pnpm
# 安装依赖（生产环境依赖，--prod 跳过开发依赖）
RUN pnpm install --prod --frozen-lockfile
# 复制所有项目代码
COPY ../../ .
# 暴露后端端口（你的代码里用了 8081，见 index.js）
EXPOSE 8081
# 启动命令（直接用 node 运行，简化流程）
CMD ["node", "packages/moten-server/index.js"]