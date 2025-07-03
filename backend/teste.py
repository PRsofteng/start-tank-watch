# tank_reader_pct.py  – backend corrigido
from __future__ import annotations
import asyncio, json, logging, os, struct
from dataclasses import dataclass
from datetime import datetime

import snap7
from fastapi import FastAPI, WebSocket
import uvicorn

PLC_IP, RACK, SLOT = "172.30.140.20", 0, 1
PORT                = int(os.getenv("TANK_API_PORT", "8080"))
SCAN_MS             = 500  # intervalo de leitura em ms

# id  → (DB, offset, endian)   endian: '>' = big-endian  '<' = little-endian
TANKS = {
    "Det1": (142, 32, '>'),
    "Det2": (142, 36, '>'),
    "Det3": (142, 40, '>'),
    "Det4": (142, 44, '>'),
    "Des1": (142, 48, '>'),
    "Des2": (142, 52, '>'),
    "Vor1": (142, 56, '>'),
    "Vor2": (142, 60, '>'),
}

@dataclass
class Tank:
    pct: float = 0.0

class PLC:
    def __init__(self):
        self.cli = snap7.client.Client()
        self.cli.connect(PLC_IP, RACK, SLOT)
        self.data: dict[str, Tank] = {k: Tank() for k in TANKS}

    def scan(self):
        for tag, (db, off, endian) in TANKS.items():
            raw = self.cli.db_read(db, off, 4)           # 4 bytes REAL
            val = struct.unpack(f"{endian}f", raw)[0]    # converte p/ float
            self.data[tag] = Tank(round(val, 1))

plc  = PLC()
app  = FastAPI()
log  = logging.getLogger("tank_reader")
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")

@app.get("/api/v1/tanks")
def get_tanks():
    return {k: v.pct for k, v in plc.data.items()}

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "ts": datetime.utcnow().isoformat()}

@app.websocket("/api/v1/tanks/stream")
async def stream(ws: WebSocket):
    await ws.accept()
    last = {}
    while True:
        await asyncio.sleep(SCAN_MS / 1000)
        snap = {k: v.pct for k, v in plc.data.items()}
        if snap != last:
            await ws.send_text(json.dumps(snap))
            last = snap

async def _loop_plc():
    while True:
        try:
            plc.scan()
            for tag, v in plc.data.items():
                log.info("%s → %.1f %%", tag, v.pct)
        except Exception as exc:
            log.error("PLC read error: %s", exc)
        await asyncio.sleep(SCAN_MS / 1000)

@app.on_event("startup")
async def _startup():
    asyncio.create_task(_loop_plc())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
