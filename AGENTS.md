# gourmetech-system

Sistema ERP e PDV de gestão para restaurantes, mercados e food services (Vue com vue-cli e ESLint). Regras de publicação e de interface da pasta pai: `../AGENTS.md`.

Scripts: `serve` (porta 5173), `build`, `lint` (`vue-cli-service`).

## Regras comuns

- `.env*` nunca é lido, impresso nem commitado (nomes das variáveis: `.env.example`, quando existir).
- Sem `git push`/deploy sem pedido; commits com caminhos explícitos (nada de `git add .`).
- Os comandos citados vêm do `package.json` (quando o repo tem um) e **não foram executados** (`node`/`npm` fora do PATH nesta máquina). Confirme antes de afirmar que passam.
