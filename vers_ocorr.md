# Versions

v00.01.000 docs(README): first commit

v00.02.000 docs(vers_ocorr.md): send list version test-manual version

docs(vers_ocorr.md): ver_man 00.03.000 – send version list for manual commit tests number 3

docs(vers_ocorr.md): ver_man 00.04.000 – send a new branch for manual test number 4

fix watchers: ver_man 00.05.000 – resolve falha de polling no monitoramento#254 to watches=524288








Erro node:internal/fs/watchers:254 ENOSPC: System limit for number of file watchers reached, watch

Correção temporaria para observadore linux:
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=512

