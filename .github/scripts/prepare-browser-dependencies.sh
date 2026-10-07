#!/usr/bin/env bash
set -euo pipefail

# GitHub's Azure Ubuntu mirror can stall dependency downloads. Keep the signed
# Ubuntu sources and all Playwright dependencies, preferring the Ubuntu archive.
test -f /etc/apt/apt-mirrors.txt
sudo sed -i -E \
  -e '/^https:\/\/archive\.ubuntu\.com\/ubuntu\//s/priority:[0-9]+/priority:1/' \
  -e '/^https:\/\/security\.ubuntu\.com\/ubuntu\//s/priority:[0-9]+/priority:2/' \
  -e '/^https?:\/\/azure\.archive\.ubuntu\.com\/ubuntu\//s/priority:[0-9]+/priority:3/' \
  /etc/apt/apt-mirrors.txt
grep -Eq '^https://archive\.ubuntu\.com/ubuntu/[[:space:]]+priority:1([[:space:]]|$)' /etc/apt/apt-mirrors.txt
cat /etc/apt/apt-mirrors.txt
sudo tee /etc/apt/apt.conf.d/zzzz-gavia-ci-network >/dev/null <<'APT'
Acquire::Retries "1";
Acquire::http::Timeout "15";
Acquire::https::Timeout "15";
APT
apt-config dump Acquire::Retries Acquire::http::Timeout Acquire::https::Timeout
