---
id: 20230313120000
title: "My Docker cheatsheet"
aliases:
  - "Docker commands"
  - "Docker quick reference"
type: cheatsheet
category: tech
subcategory: docker
domain: programming
tags:
  - docker
  - containers
  - devops
  - cli
  - cheatsheet
created: 2023-03-13
modified: 2026-05-23
date: 2023-03-13
status: active
up: "[[Docker]]"
---

# My Docker cheatsheet

> [!abstract] Summary
> Things I find myself Googling for the nth time: cleanup, log limits, getting a shell into a container, group permissions, and the `docker compose` alias dance. Less a tour of Docker, more a record of the same six problems I keep solving.

## Cleanup

| Task | Command |
|---|---|
| Remove all images | `docker rmi $(docker images -a -q)` |
| Prune system (containers, networks, dangling images, build cache) | `docker system prune` |
| Same, plus all unused images and volumes | `docker system prune -a --volumes` |
| Prune unused volumes only | `docker volume prune` |
| Prune networks only | `docker network prune` |
| Stop all running containers | `docker stop $(docker ps -q)` |

## Permissions: run Docker without `sudo`

```bash
sudo groupadd docker            # often already exists
sudo usermod -aG docker "$USER" # then log out and back in
```

## Shell into a running container

```bash
docker exec -it <container-id> /bin/bash
```

If `bash` isn't installed in the image (common on Alpine-based images), fall back to:

```bash
docker exec -it <container-id> /bin/sh
```

## Diagnostics

```bash
docker info                      # daemon and host details
docker system df                 # disk usage by images/containers/volumes
docker logs <container-id>       # container stdout/stderr
docker logs -f <container-id>    # ...and follow
```

## Limit Docker log size

Container logs are unlimited by default. Cap them in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
```

Then:

```bash
sudo systemctl restart docker
```

Existing containers keep their old log config until recreated.

More daemon options: [Docker daemon configuration file](https://medium.com/@sujaypillai/docker-daemon-configuration-file-f577000da655).

## Aliasing `docker-compose` to `docker compose`

```bash
# in ~/.bashrc or ~/.zshrc
alias docker-compose='docker compose --compatibility'
```

Bash and zsh aliases automatically forward arguments, so any `docker-compose up -d`, `docker-compose logs -f web`, etc. just works.

---

## LINKS

### Up
- [[Docker]] *(to write)*

### Related
- [[Containers]] *(to write)*
- [[Docker Compose]] *(to write)*
- [[Self-hosting]] *(to write)*

### External references
- The Ultimate Docker Cheat Sheet — <https://dockerlabs.collabnix.com/docker/cheatsheet/>
- Docker daemon configuration — <https://docs.docker.com/engine/reference/commandline/dockerd/>
- Dockerfile reference — <https://docs.docker.com/engine/reference/builder/>

