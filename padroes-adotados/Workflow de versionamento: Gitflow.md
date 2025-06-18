# **Workflow de versionamento: Gitflow**

Este documento apresenta um fluxo de trabalho simples e eficaz para o gerenciamento de código-fonte com Git. O objetivo é organizar o desenvolvimento de novas funcionalidades (features) de forma isolada, assegurando que a branch principal de desenvolvimento (`develop`) permaneça estável e operante.

## Princípios Básicos

1. **Fonte da Verdade:** A branch `develop` contém o código mais recente que está sendo preparado para o próximo lançamento. Ela deve permanecer em estado compilável e funcional.
2. **Isolamento:** Todo desenvolvimento (funcionalidade, correção ou melhoria) ocorre em uma branch separada, denominada *feature branch*.
3. **Integração via Merge/Pull Request:** Uma *feature branch* somente é integrada novamente à `develop` após conclusão, testes e, preferencialmente, revisão por outro membro da equipe.

---

## 1. Fluxo Passo a Passo

A seguir descreve-se o ciclo de vida de uma nova funcionalidade, desde a criação até a integração.

### 1.1. Sincronizar a Branch `develop` Local

Antes de iniciar qualquer trabalho, deve-se garantir que a branch `develop` local esteja sincronizada com o repositório remoto.

```bash
# Trocar para a branch develop
git checkout develop

# Obter as atualizações mais recentes do servidor remoto
git pull origin develop
```

### 1.2. Criar a Feature Branch

Cria-se uma nova branch a partir da `develop`. O nome deve ser descritivo e seguir o padrão `feat/<nome-da-feature>`.

```bash
# Criar e alternar para a nova branch em um único comando
git checkout -b feat/login-com-google
```

> Substituir `login-com-google` pelo identificador da funcionalidade em desenvolvimento.

### 1.3. Desenvolver na Feature Branch

Com o ambiente isolado, são permitidas criações, edições e testes de código sem impactar o trabalho de outros colaboradores.

* Commits devem ser pequenos e possuir mensagens claras que expliquem *o que* e *por que* determinada alteração foi realizada.

```bash
# Adicionar arquivos modificados
git add .

# Registrar as alterações
git commit -m "feat: adiciona botão de login com Google na tela inicial"

# ... continuar trabalhando e realizando novos commits ...
```

### 1.4. Enviar a Branch para o Repositório Remoto

Após concluir a funcionalidade (ou para salvar progresso), a branch é enviada ao repositório remoto.

```bash
# Primeiro envio (-u cria o vínculo com a branch remota)
git push -u origin feat/login-com-google

# Envios subsequentes podem utilizar apenas
git push
```

### 1.5. Abrir um Pull Request (PR) / Merge Request (MR)

Com a branch no servidor, deve-se abrir um **Pull Request** na interface do serviço Git (GitHub, GitLab, etc.).

* **De:** `feat/login-com-google`
* **Para:** `develop`

No Pull Request, descrevem-se as alterações realizadas. É neste momento que testes automatizados (CI/CD) são executados e que a equipe pode revisar o código, sugerir melhorias e aprovar a integração.

### 1.6. Integrar (Merge) o Pull Request

Após aprovação (e com todos os testes aprovados), o Pull Request é *merged*, integrando o conteúdo da `feat/login-com-google` à branch `develop`. Normalmente esta ação é concluída pelo botão *Merge* disponível na interface do repositório.

### 1.7. Limpeza da Branch (Opcional, porém Recomendada)

Com a branch integrada, seu propósito foi cumprido. É recomendada a remoção para manter o repositório organizado.

```bash
# Voltar para a branch develop
git checkout develop

# Excluir a branch local
git branch -d feat/login-com-google
```

A exclusão da branch remota costuma ser realizada por meio do botão *Delete branch* presente no próprio Pull Request após o *merge*.
