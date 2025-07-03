# Start‑TankWatch

> **Dashboard completo para monitoramento em tempo real de tanques / reatores usando PLC Siemens S7‑1200**  
> Backend FastAPI + python‑snap7 · Front‑end React/Vite + Tailwind · Pronto para Docker

![capa](docs/screenshot.png)

---

## 📑 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Requisitos](#requisitos)
4. [Instalação Rápida (Docker)](#instalação-rápida-docker)
5. [Backend](#backend)
6. [Frontend](#frontend)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Roadmap](#roadmap)
9. [Contribuição](#contribuição)
10. [Licença](#licença)

---

## Visão Geral

O **Start‑TankWatch** transforma sinais analógicos (4–20 mA → 0–27 648 contagens) em níveis de produto (%) e exibe tudo em uma única tela com animações e cores de alarme.

* **Reatores/Tanques:** 8 (expansível)
* **PLC suporte:** Siemens S7‑1200 (via snap7; aceita qualquer S7 que suporte protocolo S7‑TCP)
* **Comunicação:** REST + WebSocket
* **Cores de nível:** Verde ≥ 50 %, Laranja 20 – 49 %, Vermelho < 20 %
* **Interface:** pronta para monitores 1080 p ou Ultra‑Wide, modo quiosque

> Pensado para linhas de produção que precisam de um monitor visual simples, sem custos de WinCC ou SCADA proprietários.

---

## Arquitetura

```
┌──────────┐   S7‑TCP   ┌────────────────┐   REST / WS   ┌────────────┐
│   PLC    │──────────▶│   FastAPI      │──────────────▶│   React    │
│ S7‑1200  │  snap7    │  tank_reader   │               │  Vite/TW   │
└──────────┘            └────────────────┘               └────────────┘
```

* **Backend `tank_reader.py`**
  * Conecta ao PLC, lê `WORD` (ou `REAL`) de cada tanque.
  * Converte pressão → altura via ρ·g·h, restringe 0–h_max.
  * Publica `/api/v1/tanks` (JSON) e `/api/v1/tanks/stream` (WebSocket push).
* **Frontend**
  * Fundo PNG com desenho da fábrica.
  * Componente `TankBar` posiciona barra colorida + texto percentual.
  * Hook `useTankData` mantém estado via WS + polling.

---

## Requisitos

| Camada        | Min. Versão | Obs.                              |
|---------------|-------------|-----------------------------------|
| Python        | 3.11        | backend
| Node.js       | 18 LTS      | build do front (dev/prod)
| Docker Engine | 24.x        | (opcional) execução containerizada
| PLC           | S7‑1200 CPU 1215C ≥ V4.0 | Rack 0 / Slot 1 por padrão

---

## Instalação Rápida (Docker)

```bash
# clone ou baixe o repositório
$ git clone https://github.com/PRsofteng/start-tank-watch.git
$ cd start-tank-watch/backend

# ajuste variáveis no docker-compose.yml
#   PLC_IP, PLC_DB_NUM, offsets T1_OFF…

# levantar
$ docker compose up -d

# painel em http://localhost:8000
```

> **Windows Desktop?** Instale Docker Desktop + WSL 2.  \
> **Linux Server?** apt install docker‑ce docker‑compose‑plugin.

---

## Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt\python tank_reader.py
```

* Após start → `GET /api/v1/health` retorna `{"status":"ok"}`.
* Ajuste offsets/densidades via variáveis de ambiente ou arquivo `.env`.

### Principais variáveis

| Nome                  | Default | Descrição                                   |
|-----------------------|---------|---------------------------------------------|
| `PLC_IP`              | 172.30.140.20 | IP da CPU S7                               |
| `PLC_DB_NUM`          | 1       | Bloco de Dados único                       |
| `T1_OFF … T8_OFF`     | 0…14    | Offset byte de cada tanque                 |
| `SPAN_BAR_DEFAULT`    | 1.0     | Sensor 0‑1 bar (padrão)                    |
| `HMAX_DEFAULT`        | 8.0     | Altura máxima padrão (m)                   |
| `RHO_DEFAULT`         | 998     | Densidade da água (kg·m‑3)                 |

---

## Frontend

```bash
cd frontend
npm install
npm run dev       # abre http://localhost:5173 (hot‑reload)

# build produção
npm run build      # gera dist/ (copie p/ backend ou Nginx)
```

* Flechas de posição no arquivo `src/components/TankBar.jsx`
* Ajustes de fundo em `TankMonitor.jsx` → `backgroundSize`.

---

## Variáveis de Ambiente

Crie `.env` (dev) ou configure no `docker-compose.yml` (prod):

```dotenv
PLC_IP=172.30.140.20
PLC_DB_NUM=142
T1_OFF=32
T1_SPAN=40.0      # se sensor 0‑40 bar
```



## Licença

**Uso restrito / Proprietária** – Este repositório é destinado exclusivamente a projetos internos ou clientes da **PRsofteng**.  
Não é permitido redistribuir, publicar forks públicos, sublicenciar ou vender cópias sem autorização escrita.

> Para adquirir uma licença comercial ou sublicenciar este software, entre em contato em **pedro@prsofteng.com.br**.

Todos os direitos reservados © 2025 — PRsofteng.
