# **Fluxo de Trabalho Git: Feature Branch Workflow**

Este documento descreve um fluxo de trabalho simples e eficaz para gerenciar o código-fonte usando Git. O objetivo é organizar o desenvolvimento de novas funcionalidades (features) de forma isolada, garantindo que a branch principal de desenvolvimento (develop) permaneça estável e funcional.

## Princípios Básicos

1. **Fonte da Verdade:** A branch develop contém o código mais recente que está sendo preparado para o próximo lançamento. Ela deve estar sempre em um estado compilável e funcional.  
2. **Isolamento:** Todo novo desenvolvimento (seja uma funcionalidade, correção ou melhoria) acontece em uma branch separada, chamada de "feature branch".  
3. **Integração via Merge/Pull Request:** Uma feature branch só é integrada de volta à develop após ser concluída, testada e, idealmente, revisada por outro membro da equipe.

## 1. O Fluxo Passo a Passo

Aqui está o ciclo de vida de uma nova funcionalidade, desde a sua criação até a integração.

### 1.1. Sincronize sua Branch develop Local

Antes de iniciar qualquer trabalho, garanta que sua branch develop local está atualizada com a versão mais recente do repositório remoto.  
\# Vá para a branch develop  
git checkout develop

\# Baixe as atualizações mais recentes do servidor remoto  
git pull origin develop

### 1.1.2.  Crie a sua Feature Branch

Crie uma nova branch a partir da develop. O nome deve ser descritivo, seguindo o padrão feat/nome-da-feature.  
\# Crie e mude para a nova branch em um único comando  
git checkout \-b feat/login-com-google

*Substitua login-com-google por um nome que descreva sua tarefa.*

### 1.1.3. Desenvolva na Feature Branch

Agora você está em um ambiente isolado. Pode criar, editar e testar o código sem se preocupar em afetar o trabalho de outros.  
Faça commits pequenos e com mensagens claras que expliquem *o quê* e *porquê* foi feito.  
\# Adicione os arquivos que você modificou  
git add .

\# Faça o commit das suas alterações  
git commit \-m "feat: Adiciona botão de login com Google na tela inicial"

\# ... continue trabalhando e fazendo commits ...

#### 1.1.4. Envie sua Branch para o Repositório Remoto

Quando tiver finalizado a funcionalidade (ou quiser salvar seu progresso no servidor), envie a sua branch para o repositório remoto (ex: GitHub, GitLab, Bitbucket).  
\# Na primeira vez, use o \-u para criar a referência remota  
git push \-u origin feat/login-com-google

Depois do primeiro push, você pode usar apenas git push.

#### 1.1.5. Abra um Pull Request (PR) ou Merge Request (MR)

Com a branch no servidor, acesse a interface do seu serviço de Git (GitHub, GitLab, etc.) e abra um **Pull Request**.

* **De:** feat/login-com-google  
* **Para:** develop

No Pull Request, descreva as alterações que você fez. É aqui que os testes automatizados (CI/CD) irão rodar e onde sua equipe pode revisar o código, sugerir melhorias e aprovar a integração.

#### 1.1.6. Integre (Merge) o Pull Request

Após a aprovação (e com os testes passando), o Pull Request pode ser "merged". Isso significa que todo o código da sua feat/login-com-google será integrado à branch develop.  
Normalmente, isso é feito clicando no botão "Merge" na interface do GitHub/GitLab.

#### 1.1.7. Limpeza (Opcional, mas Recomendado)

Após o merge, a feature branch já cumpriu seu propósito. Você pode deletá-la para manter o repositório limpo.  
\# Volte para a branch develop  
git checkout develop

\# Delete a branch localmente  
git branch \-d feat/login-com-google

A branch remota geralmente pode ser deletada através de um botão na própria interface do Pull Request que foi merged.
