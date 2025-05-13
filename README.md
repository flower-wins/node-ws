# 安装  

```bash 
curl -Ls https://raw.githubusercontent.com/frankiejun/node-ws/refs/heads/main/setup.sh | bash -s yourdomain
```



# Node-ws说明
用于node环境的玩具和容器，基于node三方ws库，集成哪吒探针服务，可自行添加环境变量
* PaaS 平台设置的环境变量
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | UUID         | 否 |de04add9-5c68-6bab-950c-08cd5320df33| 开启了哪吒v1,请修改UUID|
  | PORT         | 否 |  3000  |  监听端口                    |
  | NEZHA_SERVER | 否 |        |哪吒v1填写形式：nz.abc.com:8008   哪吒v0填写形式：nz.abc.com|
  | NEZHA_PORT   | 否 |        | 哪吒v1没有此变量，v0的agent端口| 
  | NEZHA_KEY    | 否 |        | 哪吒v1的NZ_CLIENT_SECRET或v0的agent端口 |
  | NAME         | 否 |        | 节点名称前缀，例如：Glitch |
  | DOMAIN       | 是 |        | 项目分配的域名或已反代的域名，不包括https://前缀  |
  | SUB_PATH     | 否 |  sub   | 订阅路径   |
  | AUTO_ACCESS  | 否 |  false | 是否开启自动访问保活,false为关闭,true为开启,需同时填写DOMAIN变量 |

* 域名/sub查看节点信息，也是订阅地址，包含 https:// 或 http:// 前缀，非标端口，域名:端口/sub

    
* 温馨提示：READAME.md为说明文件，请不要上传。
* js混肴地址：https://obfuscator.io

📝 更新
markdown
复制
编辑
# Node-ws

用于 Node.js 环境的轻量级 WebSocket 服务，支持哪吒探针接入、VLESS 节点订阅生成和定时保活访问。

## 功能特性

- 提供 VLESS 格式的订阅链接（默认路径为 `/sub`，可自定义）
- 支持定时访问 `/sub` 路径进行保活，防止服务休眠
- 集成哪吒探针客户端，支持 v0 和 v1 版本
- 支持 ARM 和 AMD 架构的自动下载与运行

## 环境变量配置

| 变量名           | 是否必须 | 默认值                                   | 说明                                                         |
|------------------|----------|------------------------------------------|--------------------------------------------------------------|
| `UUID`           | 否       | `de04add9-5c68-6bab-950c-08cd5320df33`   | VLESS 节点的 UUID，建议自定义以确保唯一性                   |
| `DOMAIN`         | 是       | 无                                       | 项目的域名或已反代的域名，不带前缀                          |
| `PORT`           | 否       | `3000`                                   | HTTP 和 WebSocket 服务监听的端口                             |
| `SUB_PATH`       | 否       | `sub`                                    | 订阅链接的路径，可自定义                                     |
| `NAME`           | 否       | `Vls`                                    | 节点名称，用于订阅链接的备注                                 |
| `AUTO_ACCESS`    | 否       | `false`                                  | 是否开启定时访问 `/sub` 路径进行保活，`true` 为开启         |
| `ACCESS_INTERVAL`| 否       | `300000`（5 分钟）                       | 定时访问 `/sub` 的间隔时间，单位为毫秒                      |
| `NEZHA_SERVER`   | 否       | 无                                       | 哪吒服务端地址，格式为 `nz.example.com:8008` 或 `nz.example.com` |
| `NEZHA_PORT`     | 否       | 无                                       | 哪吒服务端端口，v1 版本无需设置                              |
| `NEZHA_KEY`      | 否       | 无                                       | 哪吒客户端密钥，v1 为 `NZ_CLIENT_SECRET`，v0 为 agent 密钥   |

## 使用说明

1. 克隆项目并安装依赖：

   ```bash
   git clone https://github.com/eooce/node-ws.git
   cd node-ws
   npm install
设置环境变量（可通过 .env 文件或部署平台的环境变量配置）：

bash
export UUID=your-uuid

export DOMAIN=your.domain.com

export AUTO_ACCESS=true

export ACCESS_INTERVAL=600000  # 10 分钟

启动服务：
bash
npm start
注意事项
订阅链接访问路径为：https://your.domain.com/sub，其中 sub 可通过 SUB_PATH 环境变量自定义。

若开启 AUTO_ACCESS，服务将每隔 ACCESS_INTERVAL 毫秒自动访问 /sub 路径，以保持服务活跃。

请确保 DOMAIN 环境变量已正确设置，且指向当前部署的服务地址。
