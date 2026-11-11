# Leo Learn VPS Deployment

These instructions prepare a single Ubuntu 24.04 LTS VPS for the existing Leo Learn demo. They are instructions for later use, not evidence that a server has been configured. Review them before running commands.

## Target and assumptions

- Node.js 24 LTS, installed system-wide; npm is `/usr/bin/npm`.
- Project: `/var/www/leo-learn`; application user/group: `leolearn`.
- Next.js listens only on `127.0.0.1:3000`.
- systemd runs the application; Nginx receives public HTTP traffic on port 80.
- This is a fresh VPS with Ubuntu's standard Nginx `sites-available` / `sites-enabled` layout. Inspect existing configuration before copying anything on a shared server.
- Commands are for Ubuntu Bash, not local Windows PowerShell. Run administrative commands from a sudo-capable administrator account (or the initial root SSH session). Do not give the application user unrestricted sudo access.
- Replace `YOUR_SERVER_IP`, `YOUR_REPOSITORY_URL`, and `YOUR_REVIEWED_BRANCH` before use. `example.com` and `www.example.com` are placeholders, not real deployment settings.
- The existing application still has no real authentication, database, or admin panel. Hosting does not add those features.
- This guide does not replace or disable the GitHub Pages workflow.

**HTTPS is intentionally not configured here. Do not collect real phone numbers, OTPs, credentials, or other sensitive information until HTTPS and the appropriate backend protections are in place.**

## 1. Connect safely and preserve administrator access

Use the SSH command provided in Liara's Connection section, for example:

```bash
ssh root@YOUR_SERVER_IP
```

Use an existing SSH key when possible. Keep private keys on their owner’s device; never commit them to Git. Set up and test a separate sudo-capable administrator account before restricting root access. `leolearn` below is the application identity, not that administrator account.

Keep the current SSH session open while testing a second connection. Do not disable password/root login or change the SSH port until a working replacement has been verified. Liara's dashboard console can provide recovery access.

## 2. Update Ubuntu and install supporting tools

These commands install software on the VPS only when you choose to execute them:

```bash
sudo apt update
sudo apt upgrade
sudo apt install -y ca-certificates curl gnupg git nginx ufw nano
```

If updates require a reboot, reboot and reconnect before continuing.

### Install Node.js 24 LTS

One option is NodeSource's signed APT repository. This is a third-party package source: review its current installation instructions and signing-key fingerprint through trusted documentation before using it. Do not run an unreviewed remote shell script as root.

On a fresh VPS:

```bash
sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
sudo chmod 0644 /etc/apt/keyrings/nodesource.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" \
  | sudo tee /etc/apt/sources.list.d/nodesource.list

sudo apt update
sudo apt install -y nodejs
node --version
npm --version
command -v node
command -v npm
```

Confirm Node reports `v24.x` and npm resolves to `/usr/bin/npm`. Do not install Ubuntu's separate `npm` package over a Node distribution that already includes npm. If Node/npm already exist, inspect their versions and installation source first instead of layering installations.

The supplied service assumes a system-wide installation, not `nvm` or another shell-only setup. Do not proceed with a mismatched executable path.

## 3. Configure the firewall without losing SSH

Inspect existing rules first:

```bash
sudo ufw status verbose
```

If SSH uses the standard port 22:

```bash
sudo ufw allow OpenSSH
```

If Liara/your administrator uses a different SSH port, allow that actual TCP port instead **before enabling UFW**. Do not type an example port blindly.

Allow web traffic, then enable the firewall:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status verbose
```

`Nginx Full` permits 80 and 443; allowing 443 does not configure HTTPS. Do not open port 3000 or future database port 5432 to the Internet. If any provider-level firewall is also active, its rules must allow the same required traffic. Verify a second SSH connection before closing the first.

## 4. Create the application account and project directory

Check whether the account already exists:

```bash
getent passwd leolearn
```

If it does not exist:

```bash
sudo adduser --disabled-password --gecos "" leolearn
```

This creates a home directory but does not grant sudo or require a password in this guide. Do not change an existing account without inspecting it.

Create the parent directory and inspect the intended destination:

```bash
sudo mkdir -p /var/www
sudo ls -ld /var/www
sudo test ! -e /var/www/leo-learn
```

If the final command fails, stop and inspect the existing directory. Do not overwrite it.

## 5. Transfer the project from the existing GitHub repository

Use the same repository as the source of truth. Push/merge the reviewed deployment files to the intended branch before cloning them on the VPS. Do not assume the current local work has already been committed or pushed.

For a repository accessible by HTTPS without embedded credentials:

```bash
sudo install -d -o leolearn -g leolearn -m 0750 /var/www/leo-learn
sudo -u leolearn -H git clone --branch YOUR_REVIEWED_BRANCH \
  YOUR_REPOSITORY_URL /var/www/leo-learn
sudo -u leolearn -H git -C /var/www/leo-learn log -1 --oneline
```

Confirm the expected reviewed commit. For a private repository, provision a dedicated read-only GitHub deploy key for repository access and verify GitHub's host fingerprint. Do not embed an access token in a clone URL or copy your personal private key onto the server. Repository access and future CI-to-server access should use separate credentials.

Clone the source and lockfile; do not transfer local `node_modules`, `.next`, `out`, or secrets. Native dependencies/builds from Windows are not Ubuntu deployment artifacts. The clone does not run the GitHub Pages workflow on this server.

## 6. Install locked dependencies and build for the domain root

**`NEXT_PUBLIC_BASE_PATH` must be absent for this VPS build.** In the current configuration, any non-empty value enables static export, including strings such as `false` or `/`.

The existing demo needs no application secrets or `.env` file. If environment files have been added separately, inspect them privately and remove any base-path assignment before proceeding. Do not paste their contents into logs or chat. Clearing the shell variable does not override a value Next loads from an environment file.

```bash
sudo -u leolearn -H env -u NEXT_PUBLIC_BASE_PATH \
  /usr/bin/npm --prefix /var/www/leo-learn ci --include=dev

sudo -u leolearn -H env -u NEXT_PUBLIC_BASE_PATH NODE_ENV=production \
  /usr/bin/npm --prefix /var/www/leo-learn run build
```

Use `npm ci`, not `npm install`, to preserve the committed dependency versions. Build-time development dependencies are required. If either command fails, stop and diagnose it before configuring a running service.

The build needs outbound access to npm/GitHub as applicable and Google Fonts for the existing Sora font setup. Keep `public/`, the `.next` server build, dependencies, package files, and Next configuration in the application directory. Do not serve the old `out/` directory.

No forced server-rendering change is needed: prerendered pages can still be served by the Next.js Node server.

## 7. Install and start the systemd service

First check for an existing unit and an occupied port:

```bash
sudo systemctl status leo-learn --no-pager
sudo ss -ltnp 'sport = :3000'
```

A missing unit is expected on first setup. If port 3000 is occupied, identify its owner; do not kill an unrelated process.

Inspect `/etc/systemd/system/leo-learn.service` if it already exists before replacing it. After review:

```bash
sudo install -o root -g root -m 0644 \
  /var/www/leo-learn/deployment/leo-learn.service \
  /etc/systemd/system/leo-learn.service
sudo systemd-analyze verify /etc/systemd/system/leo-learn.service
sudo systemctl daemon-reload
sudo systemctl enable --now leo-learn
sudo systemctl status leo-learn --no-pager
curl -I http://127.0.0.1:3000/
```

Expect an HTTP 200 response for the homepage. Test `/profile` and `/learn/unit-2` too.

The service runs `/usr/bin/npm start -- --hostname 127.0.0.1 --port 3000`, sets production mode, restarts on failure, and logs to the journal. It removes an inherited `NEXT_PUBLIC_BASE_PATH` from the process environment; this cannot undo a wrong build or a base-path value in an application environment file.

### Security and write permissions

The unit uses `ProtectSystem=strict` and permits service writes only within `/var/www/leo-learn/.next`, plus its private temporary directory. The `.next` directory must already exist from a successful build and be writable by `leolearn`. Next's disk/image caches are allowed; the rest of the project is read-only inside the service's filesystem view. `ProtectHome=true` is compatible with the system-wide Node installation; it intentionally makes home-directory credentials unavailable to the running app.

Do not use `chmod 777`. Future uploads must live in a deliberate persistent directory with a narrowly scoped service write permission, preferably using object storage instead. Future integrations may require a reviewed unit adjustment. No V8-breaking executable-memory restriction or aggressive syscall filter is included.

## 8. Configure DNS and the Nginx reverse proxy

At your DNS provider, point an A record for the intended hostname to the VPS IPv4 address. Do not add an AAAA record unless IPv6 is configured. If switching DNS providers, preserve existing email and other DNS records.

The provided `nginx.conf` is a **site configuration**, not a replacement for `/etc/nginx/nginx.conf`. Its `map` belongs in the HTTP context, which Ubuntu's standard `sites-enabled/*` include provides.

Inspect any existing `/etc/nginx/sites-available/leo-learn` and enabled site before copying. Then:

```bash
sudo install -o root -g root -m 0644 \
  /var/www/leo-learn/deployment/nginx.conf \
  /etc/nginx/sites-available/leo-learn
sudo nano /etc/nginx/sites-available/leo-learn
```

Replace `server_name example.com www.example.com;` with the actual hostname(s). If using only `learn.yourdomain.com`, list only that hostname. Keep this manual server-specific replacement out of the application source unless you deliberately choose to version it later.

If not already enabled, create the link (do not blindly overwrite an existing link):

```bash
sudo ln -s /etc/nginx/sites-available/leo-learn /etc/nginx/sites-enabled/leo-learn
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx
```

Only reload after `nginx -t` succeeds. Do not include this site twice: the map variable must be defined only once. If IPv6 is disabled at the OS level and the `[::]:80` listener fails, remove that listener from the installed site after confirming the cause.

The Ubuntu default site can remain for unmatched hosts while the real hostname selects Leo Learn. Do not remove another application's site. Test before DNS propagation using a Host header, replacing the hostname:

```bash
curl -I -H 'Host: learn.yourdomain.com' http://127.0.0.1/
```

From your computer, after DNS resolves, visit `http://YOUR_ACTUAL_HOSTNAME/`. Merely visiting the IP may display Ubuntu's default site, not Leo Learn.

### Proxy behavior

All paths, queries, Next assets, and future API requests are forwarded to Next. Upgrade headers support WebSocket connections if future functionality needs them; the present chat is client-side and does not itself use WebSockets. Caching is not enabled, Next cache headers are preserved, and response buffering is disabled for streaming.

This configuration assumes Nginx is the direct Internet-facing proxy. It overwrites forwarded client-IP information with its actual peer address rather than trusting a client-supplied forwarding chain. If a CDN/load balancer is added later, configure trusted proxy IP ranges and real-IP handling deliberately. The 10 MB request-body limit is a transport cap, not a promise that future Server Actions or upload code accept that size.

## 9. Verify before calling the migration complete

- Confirm direct access and refresh for `/`, `/welcome`, `/home`, `/learn`, `/profile`, `/progress`, `/leo`, and every onboarding page.
- Confirm `/learn/unit-1`, `/learn/unit-2`, and `/learn/unit-3` respond.
- Test the lesson link `/learn/unit-2#lesson-2` in a browser, forms, navigation, images, fonts, and chat input.
- Complete the playable lesson and reload progress in the same browser.
- Confirm `ss` shows Next bound to `127.0.0.1:3000`, not a public address.
- Check application and Nginx logs for errors.
- At a planned maintenance time, reboot and verify both services start automatically.
- Configure and verify HTTPS in a separate reviewed step before real users or sensitive data. Port 443 being allowed is not enough.

Browser-local progress from the old GitHub Pages origin does not transfer to a new domain automatically. Existing demo limitations remain. Do not disable Pages until the new deployment and any old-link handoff have been reviewed.

## 10. Logs and routine operations

```bash
sudo systemctl status leo-learn --no-pager
sudo journalctl -u leo-learn -n 100 --no-pager
sudo journalctl -u leo-learn -f
sudo systemctl restart leo-learn
sudo systemctl stop leo-learn
sudo systemctl start leo-learn

sudo nginx -t
sudo systemctl reload nginx
sudo tail -n 100 /var/log/nginx/leo-learn.error.log
```

Use Ctrl+C to exit a log-follow command; that does not stop the service. Logs can contain personal information as features are added: redact sensitive data before sharing. Do not log OTPs, credentials, or tokens.

After editing the installed systemd unit, run `sudo systemctl daemon-reload` and restart the service. After repeated startup failures, first fix the underlying cause; if the start limit was reached, use `sudo systemctl reset-failed leo-learn` before starting it again.

For a 502 response, first check whether Next is running and listening locally. For a startup permission error, inspect `.next` ownership and build existence rather than disabling all service security settings.

## 11. Later updates and rollback

This initial layout is a single in-place checkout, not an atomic release system. Do not rebuild its `.next` while the existing server is serving requests: that can mix old and new build assets.

For the first manual updates, plan downtime:

1. Record the currently deployed commit and preserve a recoverable copy/backup outside the application directory. Back up any future database separately.
2. Stop `leo-learn` before changing the checkout or build artifacts.
3. Retrieve and check out the exact reviewed commit as `leolearn`; do not use a destructive reset on unknown local changes.
4. Repeat the locked install and root-path build from step 6. If the build fails, do not start an incomplete release.
5. Install any reviewed changes to the service/site, preserving the actual domain replacement. Verify their syntax before activation.
6. Start the service and repeat HTTP/browser checks. Restore the previous reviewed source/dependencies/build if the release fails.

A fresh install has no earlier release to roll back to. Future production automation should use separate release directories, health checks, and a deliberate switch/rollback design rather than silently building over the running directory. That requires a separately reviewed adjustment to the fixed paths and service write permissions used here.

## Secrets and future backend work

No secrets are included in these files. The current prototype needs none. If future authentication/database work requires them, use a root-controlled environment file outside the Git checkout with restrictive permissions and a reviewed `EnvironmentFile` directive. Never use `NEXT_PUBLIC_*` for server secrets.

For the future MVP, add server-enforced authorization, phone verification/rate limiting, PostgreSQL migrations, off-server backups, and HTTPS. Keep PostgreSQL private. These are separate application/operations tasks, not features created by this deployment configuration.
