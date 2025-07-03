# tank_reader.py  – backend Docker-ready
# lê WORD (0-27 648) → nível (m) via p = ρ·g·h, publica REST/WS

from __future__ import annotations
import asyncio, json, logging, os, struct
from dataclasses import dataclass, asdict
from datetime import datetime

import snap7
from fastapi import FastAPI, WebSocket
import uvicorn

# ───────── Configurações globais (env → default) ─────────
PLC_IP  = os.getenv("PLC_IP",       "172.30.140.20")
RACK    = int(os.getenv("PLC_RACK", 0))
SLOT    = int(os.getenv("PLC_SLOT", 1))

DB_NUM  = int(os.getenv("PLC_DB_NUM", 1))          # ← único DB comum
RAW_MIN = int(os.getenv("RAW_MIN",      6400))
RAW_MAX = int(os.getenv("RAW_MAX",      27648))
SCAN_MS = int(os.getenv("SCAN_MS",      500))

PORT                = int  (os.getenv("TANK_API_PORT", 8000))
SPAN_BAR_DEFAULT    = float(os.getenv("SPAN_BAR_DEFAULT", 1.0))   # sensor 0-1 bar
HMAX_DEFAULT        = float(os.getenv("HMAX_DEFAULT",      8.0))  # altura 8 m
RHO_DEFAULT         = float(os.getenv("RHO_DEFAULT",     998.0))  # kg m-3

# ───────── Offsets padrão ─────────
DEFAULT_TANKS = {
    "T1": {"off": 0},
    "T2": {"off": 2},
    "T3": {"off": 4},
    "T4": {"off": 6},
    "T5": {"off": 8},
    "T6": {"off": 10},
    "T7": {"off": 12},
    "T8": {"off": 14},
}

_eF = lambda k, d: float(os.getenv(k, d))
_eI = lambda k, d: int  (os.getenv(k, d))

# aplica overrides --> T1_OFF, T1_RHO, T1_SPAN, T1_HMAX, …
TANKS: dict[str, dict[str, float]] = {
    tag: {
        "off":   _eI(f"{tag}_OFF",  cfg["off"]),
        "rho":   _eF(f"{tag}_RHO",  RHO_DEFAULT),
        "span":  _eF(f"{tag}_SPAN", SPAN_BAR_DEFAULT),
        "h_max": _eF(f"{tag}_HMAX", HMAX_DEFAULT),
    }
    for tag, cfg in DEFAULT_TANKS.items()
}

# ───────── Conversão RAW → metros ─────────
def raw_to_h(raw: int, *, span: float, rho: float) -> float:
    g   = 9.80665
    bar = (raw - RAW_MIN) * span / (RAW_MAX - RAW_MIN)
    return (bar * 1e5) / (rho * g)

# ───────── Classe PLC ─────────
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
            logging.error("Falha conexão PLC: %s", e)

    def scan(self):
        if not self.cli.get_connected():
            self._connect()
            if not self.cli.get_connected():
                return
        for tag, cfg in TANKS.items():
            raw = struct.unpack(">H",
                   self.cli.db_read(DB_NUM, cfg["off"], 2))[0]
            h   = raw_to_h(raw, span=cfg["span"], rho=cfg["rho"])
            h_s = max(0.0, min(cfg["h_max"], h))
            pct = int(round(h_s / cfg["h_max"] * 100))
            self.data[tag] = TankVal(round(h_s, 3), pct)

# ───────── FastAPI ─────────
plc = PLC()
app = FastAPI()
log = logging.getLogger("tank_reader")
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")

@app.get("/api/v1/tanks")
def tanks():
    return {k: asdict(v) for k, v in plc.data.items()}

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "ts": datetime.utcnow().isoformat()}

@app.websocket("/api/v1/tanks/stream")
async def stream(ws: WebSocket):
    await ws.accept()
    last = {}
    while True:
        await asyncio.sleep(SCAN_MS / 1000)
        snap = {k: asdict(v) for k, v in plc.data.items()}
        if snap != last:
            await ws.send_text(json.dumps(snap))
            last = snap

async def _loop():
    while True:
        plc.scan()
        await asyncio.sleep(SCAN_MS / 1000)

@app.on_event("startup")
async def _startup():
    asyncio.create_task(_loop())

# ───────── Execução ─────────
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
