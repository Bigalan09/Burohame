#!/bin/sh

set -eu

fake_bin=$(mktemp -d)

cleanup() {
  rm -rf "$fake_bin"
}

trap cleanup EXIT

for cmd in git grep sed tr rm mktemp; do
  ln -s "$(command -v "$cmd")" "$fake_bin/$cmd"
done

# Shadow ripgrep (`rg`) to ensure it cannot be used during validation, even if
# installed in /usr/bin or /bin. Any accidental use of `rg` should fail.
cat >"$fake_bin/rg" <<'EOF'
#!/bin/sh
echo "error: rg (ripgrep) must not be used in validation scripts" >&2
exit 1
EOF
chmod +x "$fake_bin/rg"

PATH="$fake_bin:/usr/bin:/bin" sh scripts/validate-static-site.sh
PATH="$fake_bin:/usr/bin:/bin" sh scripts/validate-github-pages-workflows.sh
