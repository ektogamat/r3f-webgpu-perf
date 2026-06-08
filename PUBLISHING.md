# Guia de publicação no NPM

Este guia cobre a **primeira publicação** do pacote `r3f-webgpu-perf`.

## 1. Criar conta no NPM

1. Acesse [npmjs.com/signup](https://www.npmjs.com/signup)
2. Confirme seu e-mail
3. (Recomendado) Ative autenticação em dois fatores em **Account → Security**

## 2. Login no terminal

```bash
npm login
```

Informe username, password e OTP (se 2FA estiver ativo).

Confirme:

```bash
npm whoami
```

## 3. Verificar se o nome está disponível

```bash
npm view r3f-webgpu-perf
```

Se retornar `404 Not Found`, o nome está livre.

## 4. Checklist antes de publicar

- [ ] `npm run build` conclui sem erros
- [ ] `npm run dev` — demo abre e o painel aparece
- [ ] Código commitado e push feito no GitHub
- [ ] `package.json` com `name`, `version`, `author`, `repository` corretos
- [ ] Teste local com `npm pack` (ver seção 5)

## 5. Testar o pacote localmente (sem publicar)

Na raiz do projeto:

```bash
npm run build
npm pack
```

Isso gera `r3f-webgpu-perf-0.1.0.tgz`.

Em outro projeto R3F:

```bash
npm i /caminho/completo/para/r3f-webgpu-perf-0.1.0.tgz
```

Use no código:

```jsx
import { Perf } from 'r3f-webgpu-perf'
```

## 6. Publicar

Se sua conta NPM tem 2FA ativo (recomendado), use o código do autenticador:

```bash
npm publish --access public --otp=123456
```

Substitua `123456` pelo código de 6 dígitos do seu app autenticador.

Sem 2FA:

```bash
npm publish --access public
```

O script `prepublishOnly` roda `npm run build` automaticamente antes de publicar.

> **Status:** build e `npm pack` já foram validados. Nome `r3f-webgpu-perf` está livre no registry. Login ativo como `andersonmancini`. Falta apenas rodar o comando acima com seu OTP.

## 7. Confirmar no site

Abra [npmjs.com/package/r3f-webgpu-perf](https://www.npmjs.com/package/r3f-webgpu-perf) e confira a versão.

## 8. Atualizações futuras

```bash
# correção de bug: 0.1.0 → 0.1.1
npm version patch
npm publish

# nova feature: 0.1.1 → 0.2.0
npm version minor
npm publish

# breaking change: 0.2.0 → 1.0.0
npm version major
npm publish
```

## Problemas comuns

| Erro | Solução |
|------|---------|
| `403 Forbidden` | Nome já pertence a outro usuário, ou você não está logado |
| `You cannot publish over the previously published versions` | Rode `npm version patch` antes de `npm publish` |
| `ENEEDAUTH` | Rode `npm login` novamente |
| Pacote sem CSS no consumidor | Confirme que `sideEffects` inclui `**/*.css` no `package.json` |
