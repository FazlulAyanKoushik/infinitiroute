# InfinitiRoute — Docker Guide

Everyday commands for running InfinitiRoute in Docker. All examples use the
container name `infinitiroute`.

---

## 1. First run — build the image

There is no image on Docker Hub yet, so build it once from the repo:

```bash
cd my-version
docker build -t infinitiroute:latest .
```

This takes a few minutes (installs dependencies and compiles the app inside the
container). You only rebuild when the code changes.

---

## 2. Run the gateway

```bash
docker run -d \
  --name infinitiroute \
  --restart unless-stopped \
  --stop-timeout 40 \
  -p 127.0.0.1:20128:20128 \
  -v infinitiroute-data:/app/data \
  infinitiroute:latest
```

| Flag                              | What it does                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `-d`                              | Run in the background (detached)                                                                                           |
| `--name infinitiroute`            | Fixed name so the other commands below work                                                                                |
| `--restart unless-stopped`        | Auto-start on boot / after crashes (unless you stopped it)                                                                 |
| `--stop-timeout 40`               | Give the SQLite database 40s to checkpoint cleanly on stop                                                                 |
| `-p 127.0.0.1:20128:20128`        | Gateway on `http://127.0.0.1:20128` (local machine only)                                                                   |
| `-v infinitiroute-data:/app/data` | All settings, providers, keys and usage history live in this volume — deleting the container does **not** delete your data |

**Dashboard:** <http://127.0.0.1:20128>
**API base URL for your CLI tools:** `http://127.0.0.1:20128/v1`

> **Port already taken?** If your old `omniroute` container is still running on
> 20128, either stop it first (see §4) or run InfinitiRoute alongside it on
> another port, e.g. `-p 127.0.0.1:20129:20128` and use `http://127.0.0.1:20129`.

---

## 3. Check it's running

```bash
docker ps                                   # running containers
docker logs -f infinitiroute                # live logs (Ctrl+C to exit)
curl http://127.0.0.1:20128/api/v1/models   # should return HTTP 200
```

`STATUS` should say `Up ... (healthy)`.

---

## 4. Stop / start / restart

```bash
docker stop infinitiroute       # graceful stop (waits up to 40s for SQLite)
docker start infinitiroute      # start again (same config, same data)
docker restart infinitiroute    # stop + start
```

---

## 5. Remove the container (data is kept)

```bash
docker rm -f infinitiroute      # remove container — volume infinitiroute-data survives
```

To also wipe **all settings, provider connections and logs** (destructive):

```bash
docker volume rm infinitiroute-data
```

---

## 6. Switch from old omniroute to InfinitiRoute on port 20128

```bash
docker stop omniroute && docker rm omniroute   # free port 20128
docker rm -f infinitiroute                     # remove the side-by-side instance
docker run -d \
  --name infinitiroute \
  --restart unless-stopped \
  --stop-timeout 40 \
  -p 127.0.0.1:20128:20128 \
  -v infinitiroute-data:/app/data \
  infinitiroute:latest
```

Your CLI tools keep pointing at `http://127.0.0.1:20128/v1` — nothing to
reconfigure on their side.

**Migrating your omniroute data:** the new gateway starts with an empty
database. To carry providers/keys/combos over: omniroute dashboard →
Settings → export JSON → InfinitiRoute dashboard → Settings → import JSON.
(Or just reconnect providers — OAuth flows take a minute each.)

---

## 7. Update to a new build

After pulling/changing code:

```bash
docker build -t infinitiroute:latest .
docker rm -f infinitiroute
docker run -d \
  --name infinitiroute \
  --restart unless-stopped \
  --stop-timeout 40 \
  -p 127.0.0.1:20128:20128 \
  -v infinitiroute-data:/app/data \
  infinitiroute:latest
```

Same as §2 but on the already-freed port. The volume keeps all your data, so
recreating the container is safe any time.

Tip: save the `docker run` line as a script (`run.sh` / `run.ps1`) so updates
are copy-paste.

---

## 8. Inspect data / backups

```bash
docker volume inspect infinitiroute-data      # where the volume lives on disk
docker exec -it infinitiroute sh              # shell inside the container
docker exec infinitiroute ls -la /app/data    # see storage.sqlite etc.
```

Dashboard-side backup: **Settings → database backups** (export/import JSON).
The SQLite file itself is at `/app/data/storage.sqlite` inside the volume —
stop the container first before copying it directly.

---

## 9. Quick troubleshooting

| Problem                                                 | Fix                                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Bind for ... failed: port is already allocated`        | Something else owns the port — `docker ps` to find it, or use a different host port                                      |
| `The container name "/infinitiroute" is already in use` | `docker rm -f infinitiroute` then run again                                                                              |
| Container restarts in a loop                            | `docker logs --tail 100 infinitiroute` and check for the failing step                                                    |
| Dashboard unreachable but container healthy             | Check the `-p` port mapping matches the URL you are opening                                                              |
| Forgot dashboard password                               | `docker exec -it infinitiroute node bin/reset-password.mjs` (or the `infinitiroute-reset-password` CLI inside the image) |
