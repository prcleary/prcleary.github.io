+++
title = "My Docker cheatsheet"
+++

{{ toc() }}

> Stuff I find myself Googling for the nth time

### Remove all Docker images

```bash
docker rmi $(docker images -a -q)
```

### Remove stopped containers, unused networks, dangling images, dangling build caches, unused volumes

```bash
docker system prune --volumes
# Note also -a [all] and -f [force] options
## To remove "dangling" (unused) Docker volumes
docker volume rm $(docker volume ls -qf dangling=true)
# To remove networks
docker network prune
```

### Add your user to the Docker group

To run Docker commands without `sudo`

```bash
sudo groupadd docker # may be required - may need a restart
sudo usermod -aG docker paul  # then log out and back in
```

### Get container shell

```bash
docker exec -it <container-id> /bin/bash
```
If you get a weird error with this, then it may be that Bash is not available in the container and you should use `sh` instead.

### Find out about your Docker setup

```bash
docker info
```

### Check size of images, containers and volumes

```bash
docker system df
```

### Stop all containers

```bash
docker stop $(docker ps -q)
```

### Check Docker logs

```bash
docker logs <container-id>
```

### Limit the size of Docker logs

Logs are unlimited by default - can limit to 50MB

In `/etc/docker/daemon.json`:

```
{
"log-driver": "json-file",
	"log-opts": {
		"max-size": "50m",
		"max-file": "3"
	}
}
```

then

```bash
sudo systemctl restart docker
```

Other configuration options [here](https://medium.com/@sujaypillai/docker-daemon-configuration-file-f577000da655)

### Aliasing `docker-compose` to `docker compose`

in e.g. `.bashrc`

```bash
alias docker-compose="docker compose --compatibility $@"
```

### Useful links

- [The Ultimate Docker Cheat Sheet | dockerlabs](https://dockerlabs.collabnix.com/docker/cheatsheet/)
