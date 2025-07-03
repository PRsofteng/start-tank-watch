# tank_reader.py  – backend definitivo (conversão 0-27 k → nível)

from __future__ import annotations
import asyncio, json, logging, os, struct
from dataclasses import dataclass
from datetime import datetime

import snap7
from fastapi import FastAPI, WebSocket
import uvicorn

# ─────────── Configurações ───────────
PLC_IP, RACK, SLOT = "172.30.140.20", 0, 1
DB_NUM             = 1
RAW_MIN, RAW_MAX   = 6_400, 27_648          # 4–20 mA
SCAN_MS            = 500                    # ms
PORT               = int(os.getenv("TANK_API_PORT", "8000"))

def convert_raw_to_level(raw: int, *, span_bar: float, rho: float) -> float:
    """0-27 k contagens → metros usando p = ρ·g·h."""
    G   = 9.80665
    bar = (raw - RAW_MIN) * span_bar / (RAW_MAX - RAW_MIN)
    return (bar * 1e5) / (rho * G)

# id → dict(offset, ρ, span (bar), h_max)
TANKS = {
    "T1": {"off": 0,  "rho": 998, "span": 40.0, "h_max": 7.0},
    "T2": {"off": 2,  "rho": 998, "span": 40.0, "h_max": 7.0},
    "T3": {"off": 4,  "rho": 998, "span": 40.0, "h_max": 7.0},
    "T4": {"off": 6,  "rho": 998, "span": 40.0, "h_max": 7.0},
    "T5": {"off": 8,  "rho": 998, "span": 40.0, "h_max": 7.0},
    "T6": {"off": 10, "rho": 998, "span": 40.0, "h_max": 7.0},
    "T7": {"off": 12, "rho": 998, "span": 40.0, "h_max": 7.0},
    "T8": {"off": 14, "rho": 998, "span": 40.0, "h_max": 7.0},
}

# ─────────── Classe PLC ───────────
@dataclass
class TankVal:
    nivel_m: float = 0.0
    pct:     int   = 0

class PLC:
    def __init__(self):
        self.cli  = snap7.client.Client()
        self.data = {k: TankVal() for k in TANKS}
        self._connect()

    def _connect(self):
        try:
            self.cli.connect(PLC_IP, RACK, SLOT)
            logging.info("Conectado ao PLC %s", PLC_IP)
        except Exception as e:
            logging.error("Falha de conexão: %s", e)

    def _calc(self, raw: int, *, rho: float, span: float, h_max: float) -> TankVal:
        h   = convert_raw_to_level(raw, span_bar=span, rho=rho)
        h_s = max(0.0, min(h_max, h))
        pct = int(round(h_s / h_max * 100))
        return TankVal(round(h_s, 3), pct)

    def scan(self):
        if not self.cli.get_connected():
            self._connect()
            if not self.cli.get_connected():
                return
        for tag, cfg in TANKS.items():
            raw = struct.unpack(">H", self.cli.db_read(DB_NUM, cfg["off"], 2))[0]
            self.data[tag] = self._calc(raw, **cfg)

# ─────────── API FastAPI ───────────
plc = PLC()
app = FastAPI()
log = logging.getLogger("tank_reader")
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")

@app.get("/api/v1/tanks")
def tanks():
    return {k: vars(v) for k, v in plc.data.items()}

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "ts": datetime.utcnow().isoformat()}

@app.websocket("/api/v1/tanks/stream")
async def stream(ws: WebSocket):
    await ws.accept()
    last = {}
    while True:
        await asyncio.sleep(SCAN_MS / 1000)
        snap = {k: vars(v) for k, v in plc.data.items()}
        if snap != last:
            await ws.send_text(json.dumps(snap))
            last = snap

async def loop_plc():
    while True:
        plc.scan()
        await asyncio.sleep(SCAN_MS / 1000)

@app.on_event("startup")
async def _startup():
    asyncio.create_task(loop_plc())

# ─────────── Execução ───────────
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
