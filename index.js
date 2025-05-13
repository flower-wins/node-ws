const os = require('os');
const http = require('http');
const fs = require('fs');
const axios = require('axios');
const net = require('net');
const { Buffer } = require('buffer');
const { exec, execSync } = require('child_process');
const { WebSocket, createWebSocketStream } = require('ws');

const UUID = process.env.UUID || 'de04add9-5c68-6bab-950c-08cd5320df33';
const NEZHA_SERVER = process.env.NEZHA_SERVER || '';
const NEZHA_PORT = process.env.NEZHA_PORT || '';
const NEZHA_KEY = process.env.NEZHA_KEY || '';
const DOMAIN = process.env.DOMAIN || '1234.abc.com';
const AUTO_ACCESS = process.env.AUTO_ACCESS === 'true';
const ACCESS_INTERVAL = parseInt(process.env.ACCESS_INTERVAL) || 5 * 60 * 1000;
const SUB_PATH = process.env.SUB_PATH || 'sub';
const NAME = process.env.NAME || 'Vls';
const PORT = process.env.PORT || 3000;

const metaInfo = execSync(
  'curl -s https://speed.cloudflare.com/meta | awk -F\\" \'{print $26"-"$18}\' | sed -e \'s/ /_/g\'',
  { encoding: 'utf-8' }
);
const ISP = metaInfo.trim();

const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World\n');
  } else if (req.url === `/${SUB_PATH}`) {
    const vlessURL = `vless://${UUID}@www.visa.com.tw:443?encryption=none&security=tls&sni=${DOMAIN}&type=ws&host=${DOMAIN}&path=%2F#${NAME}-${ISP}`;
    const base64Content = Buffer.from(vlessURL).toString('base64');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(base64Content + '\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

const wss = new WebSocket.Server({ server: httpServer });
const uuid = UUID.replace(/-/g, "");
wss.on('connection', ws => {
  ws.once('message', msg => {
    const [VERSION] = msg;
    const id = msg.slice(1, 17);
    if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) return;
    let i = msg.slice(17, 18).readUInt8() + 19;
    const port = msg.slice(i, i += 2).readUInt16BE(0);
    const ATYP = msg.slice(i, i += 1).readUInt8();
    const host = ATYP == 1 ? msg.slice(i, i += 4).join('.') :
    (ATYP == 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) :
    (ATYP == 3 ? msg.slice(i, i += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));
    ws.send(new Uint8Array([VERSION, 0]));
    const duplex = createWebSocketStream(ws);
    net.connect({ host, port }, function() {
      this.write(msg.slice(i));
      duplex.on('error', () => {}).pipe(this).on('error', () => {}).pipe(duplex);
    }).on('error', () => {});
  }).on('error', () => {});
});

const getDownloadUrl = () => {
  const arch = os.arch();
  if (arch === 'arm' || arch === 'arm64' || arch === 'aarch64') {
    return NEZHA_PORT ? 'https://arm64.ssss.nyc.mn/agent' : 'https://arm64.ssss.nyc.mn/v1';
  } else {
    return NEZHA_PORT ? 'https://amd64.ssss.nyc.mn/agent' : 'https://amd64.ssss.nyc.mn/v1';
  }
};

const downloadFile = async () => {
  const url = getDownloadUrl();
  const response = await axios({ method: 'get', url, responseType: 'stream' });
  const writer = fs.createWriteStream('npm');
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      exec('chmod +x npm', (err) => err ? reject(err) : resolve());
    });
    writer.on('error', reject);
  });
};

const runnz = async () => {
  await downloadFile();
  let command = '';
  if (NEZHA_SERVER && NEZHA_PORT && NEZHA_KEY) {
    const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
    const tlsFlag = tlsPorts.includes(NEZHA_PORT) ? '--tls' : '';
    command = `nohup ./npm -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${tlsFlag} >/dev/null 2>&1 &`;
  } else if (NEZHA_SERVER && NEZHA_KEY) {
    const port = NEZHA_SERVER.includes(':') ? NEZHA_SERVER.split(':').pop() : '';
    const tls = ['443', '8443', '2096', '2087', '2083', '2053'].includes(port);
    const configYaml = `
client_secret: ${NEZHA_KEY}
server: ${NEZHA_SERVER}
tls: ${tls}
uuid: ${UUID}
disable_auto_update: true
disable_force_update: true
insecure_tls: false`;
    fs.writeFileSync('config.yaml', configYaml);
    command = `nohup ./npm -c config.yaml >/dev/null 2>&1 &`;
  } else {
    console.log('NEZHA variable is empty, skip running');
    return;
  }

  exec(command, { shell: '/bin/bash' }, (err) => {
    if (err) console.error('Run error:', err.message);
    else console.log('npm is running');
  });
};

const autoAccess = () => {
  if (!AUTO_ACCESS || !DOMAIN) return;
  const fullURL = `http://${DOMAIN}/${SUB_PATH}`;
  setInterval(() => {
    axios.get(fullURL)
      .then(() => console.log(`Pinged ${fullURL}`))
      .catch(err => console.error(`Ping failed: ${err.message}`));
  }, ACCESS_INTERVAL);
};

const delFiles = () => {
  fs.unlink('npm', () => {});
  fs.unlink('config.yaml', () => {});
};

httpServer.listen(PORT, () => {
  runnz();
  setTimeout(delFiles, 30000);
  autoAccess();
  console.log(`Server is running on port ${PORT}`);
});
