# Versions

v00.01.000 docs(README): first commit

v00.02.000 docs(vers_ocorr.md): send list version test-manual version

docs(vers_ocorr.md): ver_man 00.03.000 – send version list for manual commit tests number 3

docs(vers_ocorr.md): ver_man 00.04.000 – send a new branch for manual test number 4

fix watchers: ver_man 00.05.000 – resolve falha de polling no monitoramento#254 to watches=524288

feat(side menu): ver_man 01.0.000 – global side menu opens blank pages

fix(tag): ver_man 0.1.1 - update version automomate version 00.1.001 or 0.1.1

feat(cadastro.vue): send Cadastro.vue to create tasks

feat(backlog.vue): ver_man 00.06.000 – implements backlod Product

feat(fazendohoje.vue): ver_man 00.07.000 – implements Fazendo Hoje Screen

feat(impedimentos.vue): ver_man 00.08.000 – implements Impedimentos.vue Screen

feat(metasfuturas): ver_man 00.09.000 – implements MetasFuturas.vue Screen

feat(core): ver_man 00.10.000 – Send All file support Screen

feat(fix): ver_man 00.10.001 – Fixed editable fields regarding the per-screen fixed message functionality.

feat(backup): ver_man 00.11.001 – implemented function for localStorage backup and restoration

update readme.md






Erro node:internal/fs/watchers:254 ENOSPC: System limit for number of file watchers reached, watch

Correção temporaria para observadore linux:
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=512

